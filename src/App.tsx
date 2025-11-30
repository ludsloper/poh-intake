import { useState, useRef } from 'react'
import './App.css'
import Spinnenweb, { type SpinnenwebResult } from './components/Spinnenweb'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import { sendAdviceRequest } from './utils/sendAdviceRequest'
// import utilities removed as export/print actions are no longer used

type Step = 'landing' | 'tests' | 'quiz' | 'summary' | 'success'

// advies-vraag verwijderd

function App() {
	const { t, i18n } = useTranslation()
	const [step, setStep] = useState<Step>('landing')
	
	// Helper function to change step and scroll to top
	const changeStep = (newStep: Step) => {
		setStep(newStep)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
	const [numAppointments, setNumAppointments] = useState<number | null>(null)
    const [preferences, setPreferences] = useState<string[]>([])
	const [selectedTest, setSelectedTest] = useState<'spinnenweb' | ''>('')
	const [resultSpinnenweb, setResultSpinnenweb] = useState<SpinnenwebResult | null>(null)
	const [spinnenwebAnswers, setSpinnenwebAnswers] = useState<Record<string, number>>({})
	const [contactFirstName, setContactFirstName] = useState<string>('')
	const [contactLastName, setContactLastName] = useState<string>('')
	const [contactDob, setContactDob] = useState<string>('')
	const [contactEmail, setContactEmail] = useState<string>('')
	const [contactEmailConfirm, setContactEmailConfirm] = useState<string>('')
	const [contactNote, setContactNote] = useState<string>('')
	const [quizErrors, setQuizErrors] = useState<string[]>([])
	const [adviceErrors, setAdviceErrors] = useState<string[]>([])
	const [quizAttempted, setQuizAttempted] = useState<boolean>(false)
	const [adviceAttempted, setAdviceAttempted] = useState<boolean>(false)
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const chartRef = useRef<HTMLDivElement>(null)
	const [spinnenwebPdfBlob, setSpinnenwebPdfBlob] = useState<Blob | null>(null)

    // advies-vraag verwijderd

    // resetQuiz niet meer gebruikt na UI-herstructurering

	const isQuizComplete = numAppointments !== null && preferences.length > 0

	async function handleRequestAdvice() {
		setIsSubmitting(true)
		setAdviceErrors([])

		try {
			const result = await sendAdviceRequest({
				firstName: contactFirstName,
				lastName: contactLastName,
				dateOfBirth: contactDob,
				email: contactEmail,
				numAppointments: numAppointments!,
				preferences: preferences,
				notes: contactNote,
				language: i18n.language,
				spinnenwebResult: resultSpinnenweb,
				pdfBlob: spinnenwebPdfBlob,
			})

			if (result.success) {
				changeStep('success')
			} else {
				setAdviceErrors(['advice.errors.sendFailed'])
			}
		} catch (error) {
			console.error('Error submitting advice request:', error)
			setAdviceErrors(['advice.errors.sendFailed'])
		} finally {
			setIsSubmitting(false)
		}
	}	return (
		<div className="min-h-screen bg-gray-50 md:bg-linear-to-b md:from-orange-100/80 md:via-amber-100/50 md:to-orange-100/30 py-0 md:py-8 px-0 sm:px-0">
			<div className="max-w-3xl mx-auto p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6 bg-white md:bg-white/80 backdrop-blur-sm rounded-none md:rounded-2xl shadow-none md:shadow-lg border-0 md:border md:border-orange-100">
				{/* Logo header - visible on all steps */}
				<div className="flex items-center justify-between gap-2 sm:gap-3 pb-4 sm:pb-6 border-b border-orange-200/50 mb-2">
					<div className="flex items-center gap-2 sm:gap-3">
						<img 
							src="/kruis.png" 
							alt={t('app.logoAlt')} 
							className="h-12 sm:h-16 w-auto rounded-4xl"
						/>
						<div className="flex flex-col">
							<span className="text-xl sm:text-2xl font-medium"><span className="text-gray-500">student</span><span className="text-orange-500">arts</span></span>
						</div>
					</div>
					<LanguageSwitcher />
				</div>

			{step === 'landing' && (
				<div className="space-y-4 sm:space-y-5">
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-800 leading-tight">{t('landing.header')}</h1>
					<h2 className="text-lg sm:text-xl font-medium tracking-tight text-gray-700 mt-2">{t('landing.title')}</h2>
					<ol className="list-decimal pl-5 sm:pl-6 space-y-2.5 text-base sm:text-base leading-relaxed">
						<li className="pl-1">{t('landing.step1')}</li>
						<li className="pl-1">{t('landing.step2')}</li>

					</ol>
					<p className="leading-relaxed text-foreground/90 text-base sm:text-base">{t('landing.paragraph')}</p>
					<div className="flex justify-stretch sm:justify-end gap-3 pt-3">
						<button
							className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 px-6 py-3 text-base font-medium shadow-sm"
							onClick={() => changeStep('quiz')}
						>
							{t('actions.start')}
						</button>
					</div>
				</div>
			)}

			{step === 'tests' && (
				<div className="space-y-5 sm:space-y-5">
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight">{t('tests.title')}</h2>
					<p className="text-muted-foreground text-base sm:text-base leading-relaxed">{t('tests.subtitle')}</p>
					<div className="grid gap-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow p-5 flex flex-col gap-3">
							<div className="flex items-start justify-between gap-2">
								<div>
									<h3 className="text-lg font-semibold">{t('tests.card.title')}</h3>
									<p className="text-sm text-muted-foreground">{t('tests.card.subtitle')}</p>
								</div>
								<span className="inline-flex h-8 items-center rounded-full bg-orange-100 text-orange-700 px-3 text-xs font-medium">{t('badges.reflection')}</span>
							</div>
							<ul className="text-sm list-disc pl-5 space-y-1 text-foreground/90">
								<li>{t('tests.card.bullet1')}</li>
								<li>{t('tests.card.bullet2')}</li>
							</ul>
							<div className="mt-auto flex justify-between items-center">
								{resultSpinnenweb && (
									<div className="flex items-center gap-2 text-green-600">
										<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-sm font-medium">{t('status.completed')}</span>
									</div>
								)}
								<button
									className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow"
									onClick={() => { setSelectedTest('spinnenweb'); changeStep('quiz') }}
								>
									{resultSpinnenweb ? t('actions.changeSpinnenweb') : t('actions.startSpinnenweb')}
								</button>
							</div>
						</div>
					</div>
					<div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
						<button
							className="inline-flex items-center justify-center rounded-lg border bg-background px-5 py-2.5 text-base font-medium hover:bg-orange-50 active:bg-orange-100"
							onClick={() => changeStep('landing')}
						>
							{t('actions.back')}
						</button>
						<button
							className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-base font-medium shadow-sm ${
								resultSpinnenweb 
									? 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700' 
									: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							}`}
							onClick={() => changeStep('summary')}
						>
							{resultSpinnenweb ? t('actions.requestAdvice') : t('actions.finishDirectly')}
						</button>
					</div>
				</div>
			)}

            

			{step === 'quiz' && selectedTest === 'spinnenweb' && (
				<Spinnenweb
					onBack={() => changeStep('tests')}
					onComplete={(res, answers) => {
						setResultSpinnenweb(res)
						setSpinnenwebAnswers(answers)
						changeStep('tests')
					}}
					onChartReady={(pdfBlob) => {
						setSpinnenwebPdfBlob(pdfBlob)
					}}
					initialAnswers={spinnenwebAnswers}
					chartRef={chartRef}
				/>
			)}

            {step === 'quiz' && selectedTest === '' && (
				<div className="space-y-4 sm:space-y-5">
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight">{t('quiz.generalTitle')}</h2>
					<p className="text-base text-muted-foreground leading-relaxed">{t('quiz.generalSubtitle')}</p>
					{quizErrors.length > 0 && (
						<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
							<p className="font-medium">{t('quiz.errorsHeading')}</p>
							<ul className="list-disc pl-5 mt-1">
								{quizErrors.map((e) => (
									<li key={e}>{t(e)}</li>
								))}
							</ul>
						</div>
					)}
					<div className={`rounded-xl border bg-card text-card-foreground shadow p-5 sm:p-5 space-y-3 ${quizAttempted && numAppointments === null ? 'border-red-300' : ''}`}>
                    <p className="text-base font-medium text-muted-foreground">{t('quiz.q1Label')}</p>
						<div className="grid grid-cols-5 sm:grid-cols-9 gap-2.5">
							{Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
								<label
									key={n}
									className={`${numAppointments === n ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' : 'hover:bg-orange-50'} inline-flex items-center justify-center gap-2 rounded-lg border px-3 sm:px-3 py-3 text-base font-medium cursor-pointer`}
								>
									<input
										type="radio"
										name="numAppointments"
										value={n}
										checked={numAppointments === n}
										onChange={() => { setNumAppointments(n); setQuizErrors([]) }}
										className="sr-only"
									/>
									<span>{n}</span>
								</label>
							))}
						</div>
						{quizAttempted && numAppointments === null && (
							<p className="text-xs text-red-600">{t('quiz.q1Required')}</p>
						)}
					</div>

					<div className={`rounded-xl border bg-card text-card-foreground shadow p-5 sm:p-5 space-y-3 ${quizAttempted && preferences.length === 0 ? 'border-red-300' : ''}`}>
                    <p className="text-base font-medium text-muted-foreground">{t('quiz.q2Label')}</p>
						<div className="flex flex-col gap-2.5">
								{[
									{ key: 'poh_ggz', labelKey: 'quiz.preferences.poh_ggz' },
									{ key: 'sport', labelKey: 'quiz.preferences.sport' },
									{ key: 'group', labelKey: 'quiz.preferences.group' },
									{ key: 'online', labelKey: 'quiz.preferences.online' },
								].map((opt) => {
								const checked = preferences.includes(opt.key)
								return (
									<label
										key={opt.key}
										className={`${checked ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' : 'hover:bg-orange-50'} flex items-center gap-3 rounded-lg border px-4 py-3.5 text-base sm:text-base cursor-pointer`}
									>
										<input
											type="checkbox"
											name={`preference-${opt.key}`}
											value={opt.key}
											checked={checked}
											onChange={(e) => {
												const { checked } = e.target
											setPreferences((prev) => (
													checked ? Array.from(new Set([...prev, opt.key])) : prev.filter((k) => k !== opt.key)
												))
											setQuizErrors([])
											}}
											className="sr-only"
										/>
										<span>{t(opt.labelKey)}</span>
									</label>
								)
							})}
						</div>
						{quizAttempted && preferences.length === 0 && (
							<p className="text-xs text-red-600">{t('quiz.q2Required')}</p>
						)}
					</div>

					<div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3">
						<button
							className="inline-flex items-center justify-center rounded-lg border bg-background px-5 py-2.5 text-base font-medium hover:bg-orange-50 active:bg-orange-100"
							onClick={() => changeStep('landing')}
						>
							{t('actions.back')}
						</button>
						<button
							className="inline-flex items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 px-5 py-2.5 text-base font-medium shadow-sm"
							onClick={() => {
								if (isQuizComplete) {
									setQuizErrors([])
									setQuizAttempted(false)
									changeStep('tests')
								} else {
									const errs: string[] = []
									if (numAppointments === null) errs.push('quiz.errors.numAppointments')
									if (preferences.length === 0) errs.push('quiz.errors.preferences')
									setQuizErrors(errs)
									setQuizAttempted(true)
									window.scrollTo({ top: 0, behavior: 'smooth' })
								}
							}}
						>
							{t('actions.nextToSpinnenweb')}
						</button>
					</div>
				</div>
			)}

			{step === 'summary' && (
				<div className="space-y-4 sm:space-y-5">
					<h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight">{t('summary.title')}</h2>
					<p className="text-sm text-muted-foreground leading-relaxed">{t('summary.disclaimer')}</p>
					{adviceErrors.length > 0 && (
						<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
							<p className="font-medium">{t('summary.fillFieldsHeading')}</p>
							<ul className="list-disc pl-5 mt-1">
								{adviceErrors.map((e) => (
									<li key={e}>{t(e)}</li>
								))}
							</ul>
						</div>
					)}
					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{t('summary.spinnenwebOptional')}</p>
						{resultSpinnenweb ? (
							<div className="flex items-center gap-2 text-green-600">
								<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className="text-lg font-semibold">{t('status.completed')}</span>
							</div>
						) : (
							<p className="text-lg font-semibold text-muted-foreground">{t('misc.dash')}</p>
						)}</div>
					{resultSpinnenweb && (
						<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
							<p className="text-sm font-medium text-muted-foreground">{t('summary.spinnenwebScores')}</p>
							<ul className="grid sm:grid-cols-2 gap-2 text-sm">
								{Object.entries(resultSpinnenweb).map(([k, v]) => (
									<li key={k}><span className="font-medium">{t(`spinnenweb.domains.${k}`)}:</span> {v}</li>
								))}
							</ul>
						</div>
					)}
				<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{t('summary.estimatedAppointments')}</p>
						<p className="text-lg font-semibold">{numAppointments ?? '-'}</p>
					</div>
					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{t('summary.preferredTreatments')}</p>
						<ul className="flex flex-wrap gap-2">
							{preferences.length === 0 && <li className="text-sm text-muted-foreground">{t('misc.dash')}</li>}
							{preferences.includes('poh_ggz') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">{t('quiz.preferences.poh_ggz')}</li>}
							{preferences.includes('sport') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">{t('quiz.preferences.sport')}</li>}
							{preferences.includes('group') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">{t('quiz.preferences.group')}</li>}
							{preferences.includes('online') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">{t('quiz.preferences.online')}</li>}
						</ul>
					</div>

				{/* Behandeladvies aanvragen - onderaan en als enige actieknop */}
				<div className="rounded-xl border bg-card text-card-foreground shadow p-4 sm:p-5 space-y-4">
					<p className="text-sm font-medium text-muted-foreground">{t('advice.sectionTitle')}</p>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<div className="flex flex-col gap-1">
							<label htmlFor="contactFirstName" className="text-xs font-medium text-muted-foreground">{t('advice.firstName')}</label>
								<input
								id="contactFirstName"
								type="text"
								placeholder={t('advice.firstName')}
								value={contactFirstName}
									onChange={(e) => { setContactFirstName(e.target.value); setAdviceErrors([]) }}
									className={`rounded-md border bg-background px-3 py-2 text-sm ${adviceAttempted && contactFirstName.trim().length < 2 ? 'border-red-500 ring-1 ring-red-500' : ''}`}
							/>
								{adviceAttempted && contactFirstName.trim().length < 2 && (
									<p className="text-xs text-red-600">{t('advice.errors.firstRequired')}.</p>
								)}
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="contactLastName" className="text-xs font-medium text-muted-foreground">{t('advice.lastName')}</label>
								<input
								id="contactLastName"
								type="text"
								placeholder={t('advice.lastName')}
								value={contactLastName}
									onChange={(e) => { setContactLastName(e.target.value); setAdviceErrors([]) }}
									className={`rounded-md border bg-background px-3 py-2 text-sm ${adviceAttempted && contactLastName.trim().length < 2 ? 'border-red-500 ring-1 ring-red-500' : ''}`}
							/>
								{adviceAttempted && contactLastName.trim().length < 2 && (
									<p className="text-xs text-red-600">{t('advice.errors.lastRequired')}.</p>
								)}
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="contactDob" className="text-xs font-medium text-muted-foreground">{t('advice.dob')}</label>
								<input
								id="contactDob"
								type="date"
								value={contactDob}
									onChange={(e) => { setContactDob(e.target.value); setAdviceErrors([]) }}
									className={`rounded-md border bg-background px-3 py-2 text-sm ${adviceAttempted && !contactDob ? 'border-red-500 ring-1 ring-red-500' : ''}`}
							/>
								{adviceAttempted && !contactDob && (
									<p className="text-xs text-red-600">{t('advice.errors.dobRequired')}.</p>
								)}
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="contactEmail" className="text-xs font-medium text-muted-foreground">{t('advice.email')}</label>
								<input
								id="contactEmail"
								type="email"
								placeholder="jouw@email.nl"
								value={contactEmail}
									onChange={(e) => { setContactEmail(e.target.value); setAdviceErrors([]) }}
									className={`rounded-md border bg-background px-3 py-2 text-sm ${adviceAttempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
							/>
								{adviceAttempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) && (
									<p className="text-xs text-red-600">{t('advice.errors.emailInvalid')}</p>
								)}
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="contactEmailConfirm" className="text-xs font-medium text-muted-foreground">{t('advice.emailConfirm')}</label>
								<input
								id="contactEmailConfirm"
								type="email"
								placeholder="jouw@email.nl"
								value={contactEmailConfirm}
									onChange={(e) => { setContactEmailConfirm(e.target.value); setAdviceErrors([]) }}
									className={`rounded-md border bg-background px-3 py-2 text-sm ${adviceAttempted && (contactEmail !== contactEmailConfirm || !contactEmailConfirm) ? 'border-red-500 ring-1 ring-red-500' : ''}`}
							/>
								{adviceAttempted && contactEmail !== contactEmailConfirm && (
									<p className="text-xs text-red-600">{t('advice.errors.emailsMismatch')}</p>
								)}
								{adviceAttempted && !contactEmailConfirm && contactEmail && (
									<p className="text-xs text-red-600">{t('advice.errors.emailConfirmMissing')}</p>
								)}
						</div>
					</div>
					<div className="grid gap-2">
						<textarea
							placeholder={t('advice.notePlaceholder')}
							value={contactNote}
							onChange={(e) => { setContactNote(e.target.value) }}
							rows={4}
							className="rounded-md border bg-background px-3 py-2 text-sm"
						/>
						<p className="text-xs text-muted-foreground">{t('advice.noteHelpText')}</p>
					</div>
					<div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
						<button
							className="inline-flex items-center justify-center rounded-lg border bg-background px-5 py-2.5 text-base font-medium hover:bg-orange-50 active:bg-orange-100"
							onClick={() => changeStep('tests')}
						>
							{t('actions.back')}
						</button>
						{(() => {
							const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
							const firstOk = contactFirstName.trim().length >= 2
							const lastOk = contactLastName.trim().length >= 2
							const dobOk = Boolean(contactDob)
							return (
								<button
									className="inline-flex items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 px-5 py-3 text-base font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={isSubmitting}
									onClick={() => {
										const errs: string[] = []
										if (!firstOk) errs.push('advice.errors.firstRequired')
										if (!lastOk) errs.push('advice.errors.lastRequired')
										if (!dobOk) errs.push('advice.errors.dobRequired')
										if (!emailOk) errs.push('advice.errors.emailListInvalid')
										if (errs.length > 0) {
											setAdviceErrors(errs)
											setAdviceAttempted(true)
											window.scrollTo({ top: 0, behavior: 'smooth' })
											return
										}
										setAdviceErrors([])
										setAdviceAttempted(false)
										handleRequestAdvice()
									}}
								>
									{isSubmitting ? (
										<>
											<svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
											</svg>
											{t('actions.sending') || 'Versturen...'}
										</>
									) : (
										t('actions.requestAdvice')
									)}
								</button>
							)
						})()}
					</div>
				</div>
				</div>
			)}

			{step === 'success' && (
				<div className="space-y-4 sm:space-y-5">
					<div className="rounded-xl border bg-linear-to-br from-green-50/50 to-emerald-50/50 border-green-200/50 p-6 sm:p-8 space-y-5">
						<div className="flex items-center justify-center gap-3">
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
								<svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
						</div>
						
						<div className="space-y-2 text-center">
							<h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-800">{t('advice.modal.sentTitle')}</h2>
							<p className="text-sm text-muted-foreground">{t('advice.modal.sentText')}</p>
						</div>
					</div>

					{ (
						<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
							<div className="flex items-center gap-2 text-orange-600">
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span className="text-sm font-medium">{t('advice.modal.successConfirmation')}</span>
							</div>
							<p className="text-sm text-muted-foreground">
								{t('advice.modal.successMessage')}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
		</div>
	)
}

export default App
