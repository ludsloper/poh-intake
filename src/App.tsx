import { useState } from 'react'
import './App.css'
import Spinnenweb, { type SpinnenwebResult } from './components/Spinnenweb'
// import utilities removed as export/print actions are no longer used

type Step = 'landing' | 'tests' | 'quiz' | 'summary'

// advies-vraag verwijderd

function App() {
    const [step, setStep] = useState<Step>('landing')
	const [numAppointments, setNumAppointments] = useState<number | null>(null)
    const [preferences, setPreferences] = useState<string[]>([])
	const [selectedTest, setSelectedTest] = useState<'spinnenweb' | ''>('')
	const [resultSpinnenweb, setResultSpinnenweb] = useState<SpinnenwebResult | null>(null)
	const [contactFirstName, setContactFirstName] = useState<string>('')
	const [contactLastName, setContactLastName] = useState<string>('')
	const [contactDob, setContactDob] = useState<string>('')
	const [contactEmail, setContactEmail] = useState<string>('')
	const [contactNote, setContactNote] = useState<string>('')
	const [adviceRequestSent, setAdviceRequestSent] = useState<boolean>(false)

    // advies-vraag verwijderd

    // resetQuiz niet meer gebruikt na UI-herstructurering

    const isQuizComplete = numAppointments !== null && preferences.length > 0

	function handleRequestAdvice() {
		// Verzamel resultaten voor een eventuele backend-integratie
        const payload = {
			contactFirstName,
			contactLastName,
			contactDob,
			contactEmail,
			contactNote,
			numAppointments,
			preferences,
			selectedTest,
			resultSpinnenweb,
		}
		console.log('Aanvraag behandeladvies:', payload)
		setAdviceRequestSent(true)
	}

	return (
		<div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6 bg-gradient-to-b from-orange-50 via-amber-50 to-white dark:from-orange-900/20 dark:via-amber-900/10 dark:to-background rounded-2xl">
			{step === 'landing' && (
				<div className="space-y-4">
					<h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Student Mentaal </h1>
					<h2 className="text-2xl font-medium tracking-tight">Hoe schakel je onze hulp verantwoord in?</h2>
					<ol className="list-decimal pl-6 space-y-1">
						<li>
							Vul de vragenlijst in. Je ontvangt direct een persoonlijk rapport met je testuitslagen.
						</li>
						<li>
							Onze huisarts of POH‑GGZ screent je antwoorden. Je hoort snel of, en op welke manier, je in aanmerking komt voor een hulpverleningstraject.
						</li>

					</ol>
					<p className="leading-relaxed text-foreground/90">
						Zoek je meer gespecialiseerde psychologische zorg of ben je al in behandeling? Neem dan rechtstreeks contact op met een psychologenpraktijk. Bekijk ook of online psychologische hulp bij je past; dit is vaak even effectief als face-to-face contact.
					</p>
					<div className="flex justify-end gap-3 pt-2">
						<button
							className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow"
							onClick={() => setStep('quiz')}
						>
							Start
						</button>
					</div>
				</div>
			)}

			{step === 'tests' && (
				<div className="space-y-5">
					<h2 className="text-2xl font-semibold tracking-tight">Spinnenweb (optioneel)</h2>
					<p className="text-muted-foreground">Vul het Spinnenweb in (optioneel) of afronden.</p>
					<div className="grid gap-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow p-5 flex flex-col gap-3">
							<div className="flex items-start justify-between gap-2">
								<div>
									<h3 className="text-lg font-semibold">Spinnenweb (Positieve Gezondheid)</h3>
									<p className="text-sm text-muted-foreground">Zelfscan over 6 levensdomeinen</p>
								</div>
								<span className="inline-flex h-8 items-center rounded-full bg-orange-100 text-orange-700 px-3 text-xs font-medium dark:bg-orange-900/40 dark:text-orange-200">Reflectie</span>
							</div>
							<ul className="text-sm list-disc pl-5 space-y-1 text-foreground/90">
								<li>Visueel spinnenweb over: lichamelijk, mentaal, zingeving, kwaliteit van leven, meedoen, dagelijks functioneren</li>
								<li>Helpt bij inzicht en gesprek over wat voor jou belangrijk is</li>
							</ul>
							<div className="mt-auto flex justify-between items-center">
								{resultSpinnenweb && <span className="text-xs text-green-600">Ingevuld</span>}
								<button
									className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow"
									onClick={() => { setSelectedTest('spinnenweb'); setStep('quiz') }}
								>
									{resultSpinnenweb ? 'Wijzig Spinnenweb' : 'Start Spinnenweb'}
								</button>
							</div>
						</div>
					</div>
					<div className="flex justify-between pt-2">
						<button
							className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
							onClick={() => setStep('landing')}
						>
							Terug
						</button>
						<button
							className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow"
							onClick={() => setStep('summary')}
						>
							Afronden
						</button>
					</div>
				</div>
			)}

            

			{step === 'quiz' && selectedTest === 'spinnenweb' && (
				<Spinnenweb
					onBack={() => setStep('tests')}
					onComplete={(res) => {
						setResultSpinnenweb(res)
						setStep('tests')
					}}
				/>
			)}

            {step === 'quiz' && selectedTest === '' && (
				<div className="space-y-4">
					<h2 className="text-2xl font-semibold tracking-tight">Algemene vragen</h2>
					<p className="text-sm text-muted-foreground">Beantwoord eerst de algemene vragen. Daarna kun je (optioneel) het Spinnenweb invullen.</p>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">1. Schat in hoeveel afspraken denk je nodig te hebben?</p>
						<div className="grid grid-cols-9 gap-2">
							{Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
								<label
									key={n}
									className={`${numAppointments === n ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'hover:bg-orange-50 dark:hover:bg-orange-900/20'} inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium`}
								>
									<input
										type="radio"
										name="numAppointments"
										value={n}
										checked={numAppointments === n}
										onChange={() => setNumAppointments(n)}
										className="sr-only"
									/>
									<span>{n}</span>
								</label>
							))}
						</div>
					</div>

					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">2. Welke behandeling(en) hebben jouw voorkeur?</p>
						<div className="flex flex-col gap-2">
							{[
								{ key: 'poh_ggz', label: 'Face to face met POH GGZ' },
								{ key: 'sport', label: 'Sport en bewegen' },
								{ key: 'group', label: '"Groepsbijeenkomst lotgenoten' },
								{ key: 'online', label: 'Online apps en coaching' },
							].map((opt) => {
								const checked = preferences.includes(opt.key)
								return (
									<label
										key={opt.key}
										className={`${checked ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'hover:bg-orange-50 dark:hover:bg-orange-900/20'} flex items-center gap-2 rounded-md border px-3 py-2`}
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
											}}
											className="sr-only"
										/>
										<span>{opt.label}</span>
									</label>
								)
							})}
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<button
							className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
							onClick={() => setStep('landing')}
						>
							Terug
						</button>
						<button
							className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow disabled:opacity-50"
							onClick={() => setStep('tests')}
							disabled={!isQuizComplete}
						>
							Verder naar Spinnenweb
						</button>
					</div>
				</div>
			)}

			{step === 'summary' && (
				<div className="space-y-4">
					<h2 className="text-2xl font-semibold tracking-tight">Samenvatting</h2>
					<p className="text-xs text-muted-foreground">Let op: interpretaties zijn indicatief en vervangen geen diagnose.</p>
					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
						<p className="text-sm font-medium text-muted-foreground">Spinnenweb (optioneel)</p>
						<p className="text-lg font-semibold">{resultSpinnenweb ? 'Ingevuld' : '-'}</p>
					</div>
					{resultSpinnenweb && (
						<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
							<p className="text-sm font-medium text-muted-foreground">Spinnenweb scores:</p>
							<ul className="grid sm:grid-cols-2 gap-2 text-sm">
								{Object.entries(resultSpinnenweb).map(([k, v]) => (
									<li key={k}><span className="font-medium">{k}:</span> {v}</li>
								))}
							</ul>
						</div>
					)}
				<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
						<p className="text-sm font-medium text-muted-foreground">Geschat aantal afspraken:</p>
						<p className="text-lg font-semibold">{numAppointments ?? '-'}</p>
					</div>
					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
						<p className="text-sm font-medium text-muted-foreground">Voorkeursbehandeling(en):</p>
						<ul className="flex flex-wrap gap-2">
							{preferences.length === 0 && <li className="text-sm text-muted-foreground">-</li>}
							{preferences.includes('poh_ggz') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">Face to face met POH GGZ</li>}
							{preferences.includes('sport') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">Sport en bewegen</li>}
							{preferences.includes('group') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">Groepsbijeenkomst lotgenoten</li>}
							{preferences.includes('online') && <li className="px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-sm">Online apps en coaching</li>}
						</ul>
					</div>

				{/* Behandeladvies aanvragen - onderaan en als enige actieknop */}
				<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-4">
					<p className="text-sm font-medium text-muted-foreground">Vraag behandeladvies aan</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="flex flex-col gap-1">
							<label htmlFor="contactFirstName" className="text-xs font-medium text-muted-foreground">Voornaam</label>
							<input
								id="contactFirstName"
								type="text"
								placeholder="Voornaam"
								value={contactFirstName}
								onChange={(e) => { setContactFirstName(e.target.value); setAdviceRequestSent(false) }}
								className="rounded-md border bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="contactLastName" className="text-xs font-medium text-muted-foreground">Achternaam</label>
							<input
								id="contactLastName"
								type="text"
								placeholder="Achternaam"
								value={contactLastName}
								onChange={(e) => { setContactLastName(e.target.value); setAdviceRequestSent(false) }}
								className="rounded-md border bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="contactDob" className="text-xs font-medium text-muted-foreground">Geboortedatum</label>
							<input
								id="contactDob"
								type="date"
								value={contactDob}
								onChange={(e) => { setContactDob(e.target.value); setAdviceRequestSent(false) }}
								className="rounded-md border bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label htmlFor="contactEmail" className="text-xs font-medium text-muted-foreground">E-mailadres</label>
							<input
								id="contactEmail"
								type="email"
								placeholder="jouw@email.nl"
								value={contactEmail}
								onChange={(e) => { setContactEmail(e.target.value); setAdviceRequestSent(false) }}
								className="rounded-md border bg-background px-3 py-2 text-sm"
							/>
						</div>
					</div>
					<div className="grid gap-2">
						<textarea
							placeholder="Opmerkingen (optioneel)"
							value={contactNote}
							onChange={(e) => { setContactNote(e.target.value); setAdviceRequestSent(false) }}
							rows={4}
							className="rounded-md border bg-background px-3 py-2 text-sm"
						/>
						<p className="text-xs text-muted-foreground">Vul je naam, geboortedatum en e-mailadres in zodat we je aanvraag goed kunnen koppelen.</p>
					</div>
					<div className="flex justify-end">
						{(() => {
							const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
							const firstOk = contactFirstName.trim().length >= 2
							const lastOk = contactLastName.trim().length >= 2
							const dobOk = Boolean(contactDob)
							const canSubmit = emailOk && firstOk && lastOk && dobOk
							return (
								<button
									className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow disabled:opacity-50"
									disabled={!canSubmit}
									onClick={handleRequestAdvice}
								>
									Vraag behandeladvies aan
								</button>
							)
						})()}
					</div>
					{/* modal popup voor bevestiging */}
					{adviceRequestSent && (
						<div className="fixed inset-0 z-50 flex items-center justify-center">
							<div className="absolute inset-0 bg-black/40" onClick={() => setAdviceRequestSent(false)} />
							<div className="relative z-10 w-full max-w-sm rounded-xl border bg-white p-6 shadow-lg dark:bg-background">
								<h3 className="text-lg font-semibold">Aanvraag verstuurd</h3>
								<p className="mt-1 text-sm text-muted-foreground">We nemen spoedig contact met je op via e-mail.</p>
								<div className="mt-4 flex justify-end">
									<button
										className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
										onClick={() => setAdviceRequestSent(false)}
									>
										Sluiten
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
				</div>
			)}
		</div>
	)
}

export default App
