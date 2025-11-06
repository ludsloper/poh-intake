import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

type Domain =
	| 'Lichamelijk'
	| 'Mentaal'
	| 'Zingeving'
	| 'Kwaliteit van leven'
	| 'Meedoen'
	| 'Dagelijks functioneren'

const DOMAINS: Domain[] = ['Lichamelijk', 'Mentaal', 'Zingeving', 'Kwaliteit van leven', 'Meedoen', 'Dagelijks functioneren']

const DOMAIN_ICON: Record<Domain, string> = {
	Lichamelijk: '🏃',
	Mentaal: '🧠',
	Zingeving: '✨',
	'Kwaliteit van leven': '☀️',
	Meedoen: '🤝',
	'Dagelijks functioneren': '🧭',
}

const DOMAIN_COLOR: Record<Domain, string> = {
	Lichamelijk: '#ef4444',
	Mentaal: '#3b82f6',
	Zingeving: '#a855f7',
	'Kwaliteit van leven': '#f59e0b',
	Meedoen: '#f97316',
	'Dagelijks functioneren': '#22c55e',
}

type Question = { id: string; domain: Domain; text: string }

const QUESTIONS: Question[] = [
	// Lichamelijk
	{ id: 'lich-1', domain: 'Lichamelijk', text: 'Ik voel me lichamelijk fit.' },
	{ id: 'lich-2', domain: 'Lichamelijk', text: 'Ik slaap voldoende en herstel goed.' },
	{ id: 'lich-3', domain: 'Lichamelijk', text: 'Ik heb genoeg energie voor dagelijkse activiteiten.' },
	// Mentaal
	{ id: 'ment-1', domain: 'Mentaal', text: 'Ik kan goed omgaan met stress.' },
	{ id: 'ment-2', domain: 'Mentaal', text: 'Ik voel me positief en veerkrachtig.' },
	{ id: 'ment-3', domain: 'Mentaal', text: 'Ik ervaar weinig piekeren.' },
	// Zingeving
	{ id: 'zing-1', domain: 'Zingeving', text: 'Ik heb een duidelijk gevoel van richting.' },
	{ id: 'zing-2', domain: 'Zingeving', text: 'Mijn activiteiten voelen betekenisvol.' },
	{ id: 'zing-3', domain: 'Zingeving', text: 'Ik leef volgens mijn waarden.' },
	// Kwaliteit van leven
	{ id: 'kvl-1', domain: 'Kwaliteit van leven', text: 'Ik ben tevreden met mijn leven.' },
	{ id: 'kvl-2', domain: 'Kwaliteit van leven', text: 'Ik geniet van dagelijkse dingen.' },
	{ id: 'kvl-3', domain: 'Kwaliteit van leven', text: 'Mijn leven voelt in balans.' },
	// Meedoen
	{ id: 'mdn-1', domain: 'Meedoen', text: 'Ik heb steun uit mijn sociale omgeving.' },
	{ id: 'mdn-2', domain: 'Meedoen', text: 'Ik voel me onderdeel van een community.' },
	{ id: 'mdn-3', domain: 'Meedoen', text: 'Ik kan deelnemen aan activiteiten die ik belangrijk vind.' },
	// Dagelijks functioneren
	{ id: 'dfn-1', domain: 'Dagelijks functioneren', text: 'Ik kan dagelijkse taken uitvoeren zoals ik wil.' },
	{ id: 'dfn-2', domain: 'Dagelijks functioneren', text: 'Ik red mijn werk/studie goed.' },
	{ id: 'dfn-3', domain: 'Dagelijks functioneren', text: 'Ik kan mijn tijd effectief indelen.' },
]

export type SpinnenwebResult = Record<Domain, number>

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
	const angleRad = ((angleDeg - 90) * Math.PI) / 180
	return {
		x: cx + r * Math.cos(angleRad),
		y: cy + r * Math.sin(angleRad),
	}
}

export default function Spinnenweb({
	onBack,
	onComplete,
	initialAnswers,
	chartRef: externalChartRef,
	onChartReady,
}: {
	onBack: () => void
	onComplete: (result: SpinnenwebResult, answers: Record<string, number>) => void
	initialAnswers?: Record<string, number>
	chartRef?: React.RefObject<HTMLDivElement | null>
	onChartReady?: (pdfBlob: Blob) => void
}) {
	const { t } = useTranslation()
	const [view, setView] = useState<'questions' | 'chart'>('questions')
	const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers || {})
	const internalChartRef = useRef<HTMLDivElement>(null)
	const chartRef = externalChartRef || internalChartRef
	const [isDownloading, setIsDownloading] = useState(false)
	const totalQuestions = QUESTIONS.length
	const answeredCount = Object.keys(answers).length
	const progressPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0

	const domainScores = useMemo<Record<Domain, number>>(() => {
		const byDomain: Record<Domain, number[]> = DOMAINS.reduce((acc, d) => {
			acc[d] = []
			return acc
		}, {} as Record<Domain, number[]>)
		for (const q of QUESTIONS) {
			if (q.id in answers) byDomain[q.domain].push(answers[q.id])
		}
		const result = {} as Record<Domain, number>
		for (const d of DOMAINS) {
			const arr = byDomain[d]
			result[d] = arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0
		}
		return result
	}, [answers])

	const polygon = useMemo(() => {
		const cx = 280
		const cy = 280
		const maxR = 220
		const step = 360 / DOMAINS.length
		const points = DOMAINS.map((d, i) => {
			const angle = i * step
			const r = (domainScores[d] / 10) * maxR
			const { x, y } = polarToCartesian(cx, cy, r, angle)
			return `${x},${y}`
		}).join(' ')
		return { cx, cy, maxR, points }
	}, [domainScores])

	const remaining = totalQuestions - answeredCount
	const canSubmit = remaining === 0

	// Generate PDF blob when chart view is shown and all questions are answered
	useEffect(() => {
		if (view === 'chart' && canSubmit && chartRef.current && onChartReady) {
			const generateBlob = async () => {
				try {
					const target = chartRef.current!
					const bounds = target.getBoundingClientRect()
					const width = Math.ceil(bounds.width)
					const height = Math.ceil(bounds.height)

					const dataUrl = await toPng(target, {
						cacheBust: true,
						backgroundColor: '#ffffff',
						pixelRatio: Math.max(3, window.devicePixelRatio || 1),
						canvasWidth: width + 48,
						canvasHeight: height + 48,
						style: {
							padding: '24px',
							backgroundColor: '#ffffff',
							width: `${width}px`,
							height: `${height}px`,
							border: 'none',
							boxShadow: 'none',
							outline: 'none',
						},
					})

					const image = await new Promise<HTMLImageElement>((resolve, reject) => {
						const img = new Image()
						img.onload = () => resolve(img)
						img.onerror = (err) => reject(err)
						img.src = dataUrl
					})

					const pdf = new jsPDF({
						orientation: 'portrait',
						unit: 'mm',
						format: 'a4',
					})

					const pageWidth = pdf.internal.pageSize.getWidth()
					const pageHeight = pdf.internal.pageSize.getHeight()
					const margin = 20
					const maxWidth = pageWidth - margin * 2
					const maxHeight = pageHeight - margin * 2
					const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
					const safety = 0.9
					const renderWidth = image.width * scale * safety
					const renderHeight = image.height * scale * safety
					const x = (pageWidth - renderWidth) / 2
					const y = (pageHeight - renderHeight) / 2

					// Draw the image
					pdf.addImage(image, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST')

					// Add border
					pdf.setDrawColor(226, 232, 240)
					pdf.setLineWidth(0.4)
					const inset = 0.6
					const radius = 3
					pdf.roundedRect(x + inset, y + inset, renderWidth - inset * 2, renderHeight - inset * 2, radius, radius, 'S')
					
					// Get PDF as blob
					const pdfBlob = pdf.output('blob')
					onChartReady(pdfBlob)
				} catch (error) {
					console.error('Error generating PDF blob:', error)
				}
			}
			
			// Small delay to ensure DOM is fully rendered
			const timer = setTimeout(generateBlob, 100)
			return () => clearTimeout(timer)
		}
	}, [view, canSubmit, onChartReady, chartRef])

	const handleDownloadPDF = async () => {
		if (!chartRef.current) return
		
		setIsDownloading(true)
		try {
			const target = chartRef.current
			const bounds = target.getBoundingClientRect()
			const width = Math.ceil(bounds.width)
			const height = Math.ceil(bounds.height)

			const dataUrl = await toPng(target, {
				cacheBust: true,
				backgroundColor: '#ffffff',
				pixelRatio: Math.max(3, window.devicePixelRatio || 1),
				canvasWidth: width + 48,
				canvasHeight: height + 48,
				style: {
					padding: '24px',
					backgroundColor: '#ffffff',
					width: `${width}px`,
					height: `${height}px`,
					border: 'none',
					boxShadow: 'none',
					outline: 'none',
				},
			})

			const image = await new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image()
				img.onload = () => resolve(img)
				img.onerror = (err) => reject(err)
				img.src = dataUrl
			})

			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4',
			})

			const pageWidth = pdf.internal.pageSize.getWidth()
			const pageHeight = pdf.internal.pageSize.getHeight()
			const margin = 20
			const maxWidth = pageWidth - margin * 2
			const maxHeight = pageHeight - margin * 2
			const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
			const safety = 0.9
			const renderWidth = image.width * scale * safety
			const renderHeight = image.height * scale * safety
			const x = (pageWidth - renderWidth) / 2
			const y = (pageHeight - renderHeight) / 2

			// Draw the image
			pdf.addImage(image, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST')

			// Explicit border to avoid any clipped DOM border in export
			pdf.setDrawColor(226, 232, 240) // slate-200-ish
			pdf.setLineWidth(0.4)
			const inset = 0.6
			const radius = 3
			// roundedRect: x, y, w, h, rx, ry, style ('S' stroke)
			// ensure border is inside the image area
			pdf.roundedRect(x + inset, y + inset, renderWidth - inset * 2, renderHeight - inset * 2, radius, radius, 'S')
			pdf.save(t('spinnenweb.pdfFileName'))
		} catch (error) {
			console.error('Error generating PDF:', error)
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<div className="space-y-4">
			{view === 'questions' && (
				<>
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight">{t('spinnenweb.title')}</h2>
							<p className="text-sm text-muted-foreground">{t('spinnenweb.intro')}</p>
							<p className="text-xs text-muted-foreground">{t('spinnenweb.scaleLegend')}</p>
						</div>
						{/* <div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">{t('spinnenweb.remaining', { count: remaining })}</span>
							<button
								className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
								onClick={() => {
									const rnd: Record<string, number> = {}
									for (const q of QUESTIONS) rnd[q.id] = Math.floor(Math.random() * 11)
									setAnswers(rnd)
									setView('chart')
								}}
							>
								{t('spinnenweb.quickFill')}
							</button>
						</div> */}
					</div>

					<div className="rounded-lg border bg-muted/40 p-4">
						<div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
							<span>
								{t('spinnenweb.progress', { answered: answeredCount, total: totalQuestions })}
							</span>
							<span>{progressPct}%</span>
						</div>
						<div className="mt-2 h-2 rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-orange-500 transition-all"
								style={{ width: `${progressPct}%` }}
							/>
						</div>
					</div>

					<div className="rounded-xl border bg-card text-card-foreground shadow p-6 sm:p-8 grid gap-6 content-start">
						{DOMAINS.map((domain, idx) => (
							<div key={domain} className={`${idx > 0 ? 'pt-6 mt-2 border-t' : ''} space-y-4`}>
								<h3 className="text-base font-semibold flex items-center gap-3">
									<span
										className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
										style={{ backgroundColor: `${DOMAIN_COLOR[domain]}22`, color: DOMAIN_COLOR[domain] }}
										aria-hidden="true"
									>
										{DOMAIN_ICON[domain]}
									</span>
									<span>{t(`spinnenweb.domains.${domain}`)}</span>
								</h3>
								{QUESTIONS.filter((q) => q.domain === domain).map((q) => {
									const hasAnswer = Object.prototype.hasOwnProperty.call(answers, q.id)
									const value = hasAnswer ? answers[q.id] : 5
									return (
										<label key={q.id} className="space-y-2">
											<span className="text-sm text-foreground/90 flex items-center gap-2">
												{t(`spinnenweb.questions.${q.id}`)}
												{hasAnswer ? (
													<span className="text-[10px] font-medium uppercase tracking-wide text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">
														{t('spinnenweb.filled')}
													</span>
												) : null}
											</span>
											<div className="flex items-center gap-4">
												<span className="text-xs text-muted-foreground w-8 text-right">0</span>
												<input
													type="range"
													min={0}
													max={10}
													step={1}
													value={value}
													aria-label={`${t(`spinnenweb.questions.${q.id}`)} (${t(`spinnenweb.domains.${domain}`)})`}
													onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: Number(e.target.value) }))}
													className={`${hasAnswer ? 'accent-orange-500 opacity-100' : 'accent-zinc-300 opacity-70'} flex-1`}
												/>
												<span className="text-xs text-muted-foreground w-8">10</span>
												<span className="text-xs font-medium tabular-nums w-8 text-right">{hasAnswer ? value : '—'}</span>
											</div>
										</label>
									)
								})}
							</div>
						))}
					</div>

					<div className="flex justify-between pt-2">
						<button
							className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
							onClick={onBack}
						>
							{t('spinnenweb.back')}
						</button>
						<button
							className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow disabled:opacity-50"
							disabled={!canSubmit}
							onClick={() => setView('chart')}
						>
							{t('spinnenweb.viewChart')}
						</button>
					</div>
				</>
			)}

			{view === 'chart' && (
				<>
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<h2 className="text-2xl font-semibold tracking-tight">{t('spinnenweb.chartTitle')}</h2>
								{canSubmit && (
									<div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-sm font-medium">{t('spinnenweb.complete')}</span>
									</div>
								)}
							</div>
							<p className="text-sm text-muted-foreground">{t('spinnenweb.averages')}</p>
						</div>
						{/* <button
							className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30 gap-2"
							onClick={handleDownloadPDF}
							disabled={isDownloading}
						>
							{isDownloading ? (
								<>
									<svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
										<span>{t('spinnenweb.downloading')}</span>
								</>
							) : (
								<>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
										<span>{t('spinnenweb.downloadPdf')}</span>
								</>
							)}
						</button> */}
					</div>

						<div className="rounded-xl border bg-card text-card-foreground shadow max-w-2xl mx-auto">
							<div ref={chartRef} className="p-6 sm:p-8 space-y-6">
							<svg viewBox="-60 -80 680 720" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
							<defs />
					{[1, 2, 3, 4, 5].map((k) => {
						const r = (k * polygon.maxR) / 5
						const step = 360 / DOMAINS.length
						const ringPoints = DOMAINS.map((_, i) => {
							const angle = i * step
							const { x, y } = polarToCartesian(polygon.cx, polygon.cy, r, angle)
							return `${x},${y}`
						}).join(' ')
						return (
							<g key={k}>
										<polygon
											points={ringPoints}
											fill="none"
											stroke="rgba(15, 23, 42, 0.24)"
											strokeWidth={1}
											vectorEffect="non-scaling-stroke"
										/>
								<text x={polygon.cx} y={polygon.cy - r - 10} textAnchor="middle" className="fill-foreground/60 text-[10px]">{k * 2}</text>
							</g>
						)
					})}
							{/* center marker */}
							<circle cx={polygon.cx} cy={polygon.cy} r={1.5} className="fill-foreground/30" />
					{DOMAINS.map((d, i) => {
									const step = 360 / DOMAINS.length
									const angle = i * step
						const axisEnd = polarToCartesian(polygon.cx, polygon.cy, polygon.maxR, angle)
					const iconPosition = polarToCartesian(polygon.cx, polygon.cy, polygon.maxR + 56, angle)
					const labelOffset = angle === 180 ? 42 : 36
								const labelPosition = { x: iconPosition.x, y: iconPosition.y + labelOffset }
									return (
										<g key={d}>
											<line
												x1={polygon.cx}
												y1={polygon.cy}
												x2={axisEnd.x}
												y2={axisEnd.y}
												stroke="rgba(15, 23, 42, 0.12)"
												strokeWidth={1}
												vectorEffect="non-scaling-stroke"
											/>
										{/* radial tick markers at 0,2,4,6,8,10 */}
										{[2, 4, 6, 8, 10].map((tv) => {
											const rTick = (tv / 10) * polygon.maxR
											const { x: cx, y: cy } = polarToCartesian(polygon.cx, polygon.cy, rTick, angle)
											const angleRad = ((angle - 90) * Math.PI) / 180
											const nx = Math.cos(angleRad + Math.PI / 2)
											const ny = Math.sin(angleRad + Math.PI / 2)
											const len = 4
											const x1 = cx - nx * (len / 2)
											const y1 = cy - ny * (len / 2)
											const x2 = cx + nx * (len / 2)
											const y2 = cy + ny * (len / 2)
											return (
												<line
													key={`tick-${d}-${tv}`}
													x1={x1}
													y1={y1}
													x2={x2}
													y2={y2}
													stroke="rgba(15, 23, 42, 0.22)"
													strokeWidth={1}
													vectorEffect="non-scaling-stroke"
												/>
											)
										})}
										{/* icon above label, with colored badge (badge first, then emoji so it's not cropped) */}
										<circle cx={iconPosition.x} cy={iconPosition.y} r={24} fill={DOMAIN_COLOR[d]} opacity="0.18" />
										<text
											x={iconPosition.x}
											y={iconPosition.y}
											textAnchor="middle"
											dominantBaseline="middle"
											className="text-[26px]"
											aria-hidden="true"
										>
											{DOMAIN_ICON[d]}
										</text>
							<text
								x={labelPosition.x}
								y={labelPosition.y}
								textAnchor="middle"
								dominantBaseline="hanging"
								className="fill-foreground text-[12px] font-medium"
								style={{ paintOrder: 'stroke fill', stroke: 'white', strokeWidth: 3 }}
							>
								{t(`spinnenweb.domains.${d}`)}
							</text>
									</g>
								)
							})}
						<polygon
							points={polygon.points}
							fill="rgba(251, 146, 60, 0.22)"
							stroke="#f97316"
							strokeWidth={2}
							vectorEffect="non-scaling-stroke"
						/>
						{/* value points + tooltips */}
					{DOMAINS.map((d, i) => {
							const step = 360 / DOMAINS.length
							const angle = i * step
							const r = (domainScores[d] / 10) * polygon.maxR
							const { x, y } = polarToCartesian(polygon.cx, polygon.cy, r, angle)
							return (
								<g key={`pt-${d}`}>
									<title>{`${t(`spinnenweb.domains.${d}`)}: ${domainScores[d]}`}</title>
									<circle cx={x} cy={y} r={4} className="fill-orange-500 stroke-white/80" />
								{(() => {
									const labelR = r + 20
									const { x: tx, y: ty } = polarToCartesian(polygon.cx, polygon.cy, labelR, angle)
									return (
										<text
											x={tx}
											y={ty}
											textAnchor="middle"
											dominantBaseline="middle"
											className="fill-orange-700 text-[11px] font-semibold"
											style={{ paintOrder: 'stroke fill', stroke: 'white', strokeWidth: 3 }}
										>
											{domainScores[d]}
										</text>
									)
								})()}
								</g>
							)
						})}
						</svg>
							
							{/* Modern score overview grid */}
							<div className="border-t pt-6">
								<h3 className="text-sm font-semibold text-foreground/80 mb-4">{t('spinnenweb.scoreOverview')}</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
									{DOMAINS.map((d) => (
										<div 
											key={`score-${d}`} 
											className="group relative rounded-lg border bg-linear-to-br from-white to-slate-50/50 hover:shadow-md transition-all duration-200 overflow-hidden"
										>
											{/* Colored accent bar */}
											<div 
												className="absolute inset-x-0 top-0 h-1"
												style={{ backgroundColor: DOMAIN_COLOR[d] }}
											/>
											<div className="p-4 pt-5">
												<div className="flex items-center gap-2 mb-2">
													<span
														className="flex h-7 w-7 items-center justify-center rounded-full text-base"
														style={{ backgroundColor: `${DOMAIN_COLOR[d]}15`, color: DOMAIN_COLOR[d] }}
														aria-hidden="true"
													>
														{DOMAIN_ICON[d]}
													</span>
													<span className="text-xs font-medium text-foreground/70 line-clamp-2 leading-tight">
														{t(`spinnenweb.domains.${d}`)}
													</span>
												</div>
												<div className="flex items-baseline gap-1.5">
													<span 
														className="text-2xl font-bold tabular-nums"
														style={{ color: DOMAIN_COLOR[d] }}
													>
														{domainScores[d]}
													</span>
													<span className="text-xs text-muted-foreground font-medium">/ 10</span>
												</div>
												{/* Progress bar */}
												<div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
													<div 
														className="h-full rounded-full transition-all duration-300"
														style={{ 
															width: `${(domainScores[d] / 10) * 100}%`,
															backgroundColor: DOMAIN_COLOR[d]
														}}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
							
							<div className="mt-3 text-xs text-muted-foreground">
								<p>{t('spinnenweb.explainer')}</p>
							</div>
							{/* Legend intentionally hidden per request */}
						</div>
					</div>

					{canSubmit && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
							<div className="flex items-center gap-2 text-green-700">
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className="font-medium">{t('spinnenweb.congratsTitle')}</span>
							</div>
							<p className="text-sm text-green-600 mt-1">{t('spinnenweb.congratsText')}</p>
						</div>
					)}

					<div className="flex justify-between pt-2">
						<button
							className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
							onClick={() => setView('questions')}
						>
							{t('spinnenweb.backToQuestions')}
						</button>
						<button
							className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow ${
								canSubmit 
									? 'bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-500 ring-offset-2' 
									: 'bg-orange-500 text-white hover:bg-orange-600'
							}`}
							onClick={() => onComplete(domainScores, answers)}
						>
							{canSubmit && (
								<svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							)}
									{t('spinnenweb.finish')}
						</button>
					</div>
				</>
			)}
		</div>
	)
}


