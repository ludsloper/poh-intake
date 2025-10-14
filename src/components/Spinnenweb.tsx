import { useMemo, useState } from 'react'

type Domain =
	| 'Lichamelijk'
	| 'Mentaal'
	| 'Zingeving'
	| 'Kwaliteit van leven'
	| 'Meedoen'
	| 'Dagelijks functioneren'

const DOMAINS: Domain[] = ['Lichamelijk', 'Mentaal', 'Zingeving', 'Kwaliteit van leven', 'Meedoen', 'Dagelijks functioneren']

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
}: {
	onBack: () => void
	onComplete: (result: SpinnenwebResult) => void
}) {
	const [view, setView] = useState<'questions' | 'chart'>('questions')
	const [answers, setAnswers] = useState<Record<string, number>>({})

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
		const cx = 160
		const cy = 160
		const maxR = 120
		const step = 360 / DOMAINS.length
		const points = DOMAINS.map((d, i) => {
			const angle = i * step
			const r = (domainScores[d] / 10) * maxR
			const { x, y } = polarToCartesian(cx, cy, r, angle)
			return `${x},${y}`
		}).join(' ')
		return { cx, cy, maxR, points }
	}, [domainScores])

	const remaining = QUESTIONS.length - Object.keys(answers).length
	const canSubmit = remaining === 0

	return (
		<div className="space-y-4">
			{view === 'questions' && (
				<>
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight">Spinnenweb (Positieve Gezondheid)</h2>
							<p className="text-sm text-muted-foreground">Beantwoord de vragen per domein (0–10). Daarna tonen we je spinnenweb.</p>
						</div>
						<span className="text-sm text-muted-foreground">Nog {remaining} te gaan</span>
					</div>

					<div className="rounded-xl border bg-card text-card-foreground shadow p-4 grid gap-4 content-start max-h-[70vh] overflow-auto">
						{DOMAINS.map((domain) => (
							<div key={domain} className="grid gap-2">
								<h3 className="text-sm font-semibold">{domain}</h3>
								{QUESTIONS.filter((q) => q.domain === domain).map((q) => {
									const value = answers[q.id] ?? 5
									return (
										<label key={q.id} className="grid gap-1">
											<span className="text-sm text-foreground/90">{q.text}</span>
											<div className="flex items-center gap-3">
												<span className="text-xs text-muted-foreground w-6 text-right">0</span>
												<input
													type="range"
													min={0}
													max={10}
													step={1}
													value={value}
													onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: Number(e.target.value) }))}
													className="accent-orange-500 flex-1"
												/>
												<span className="text-xs text-muted-foreground w-6">10</span>
												<span className="text-xs font-medium tabular-nums w-6 text-right">{value}</span>
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
							Terug
						</button>
						<button
							className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow disabled:opacity-50"
							disabled={!canSubmit}
							onClick={() => setView('chart')}
						>
							Bekijk spinnenweb
						</button>
					</div>
				</>
			)}

			{view === 'chart' && (
				<>
					<div className="flex items-start justify-between gap-3">
						<div>
							<h2 className="text-2xl font-semibold tracking-tight">Jouw Spinnenweb</h2>
							<p className="text-sm text-muted-foreground">Gemiddelde scores (0–10) per domein, op basis van je antwoorden.</p>
						</div>
					</div>

					<div className="rounded-xl border bg-card text-card-foreground shadow p-4">
						<svg viewBox="0 0 360 380" className="w-full h-auto">
							<defs>
								<linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" />
									<stop offset="100%" stopColor="#fb923c" stopOpacity="0.15" />
								</linearGradient>
							</defs>
							{[1, 2, 3, 4, 5].map((k) => (
								<circle key={k} cx={polygon.cx} cy={polygon.cy} r={(k * polygon.maxR) / 5} className="fill-none stroke-foreground/10" />
							))}
							{DOMAINS.map((d, i) => {
								const step = 360 / DOMAINS.length
								const angle = i * step
								const { x, y } = polarToCartesian(polygon.cx, polygon.cy, polygon.maxR, angle)
								const { x: lx, y: ly } = polarToCartesian(polygon.cx, polygon.cy, polygon.maxR + 18, angle)
								return (
									<g key={d}>
										<line x1={polygon.cx} y1={polygon.cy} x2={x} y2={y} className="stroke-foreground/10" />
										<text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[10px]">
											{d}
										</text>
									</g>
								)
							})}
							<polygon points={polygon.points} className="stroke-orange-500 fill-[url(#fillGrad)]" />
						</svg>
						<div className="mt-3 text-xs text-muted-foreground">
							<p>
								Dit spinnenweb toont je gemiddelde score (0–10) per domein. Het is bedoeld als reflectiehulpmiddel en geen diagnose. Bespreek je profiel met een professional voor context en vervolgstappen.
							</p>
						</div>
					</div>

					<div className="flex justify-between pt-2">
						<button
							className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
							onClick={() => setView('questions')}
						>
							Terug naar vragen
						</button>
						<button
							className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow"
							onClick={() => onComplete(domainScores)}
						>
							Afronden
						</button>
					</div>
				</>
			)}
		</div>
	)
}


