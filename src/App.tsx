import { useState } from 'react'
import './App.css'
import Test4DKL, { type FourDKLResult } from './components/Test4DKL'
import Spinnenweb, { type SpinnenwebResult } from './components/Spinnenweb'
import { downloadCsv, printPage } from './utils/export'

type Step = 'landing' | 'tests' | 'quiz' | 'summary'

type AdviceOption = {
	key: string
	label: string
}

const ADVICE_OPTIONS: AdviceOption[] = [
	{ key: 'sleep_basics', label: 'Let beter op slaap en andere basisbehoeften (beweging, voeding)' },
	{ key: 'self_compassion', label: 'Wees minder hard voor jezelf (bijv. mindfulness) toepassen' },
	{ key: 'social_contacts', label: 'Investeer in sociale contacten' },
	{ key: 'poverty_cycle', label: 'Doorbreek de cirkel van armoede' },
	{ key: 'urgent_help', label: 'Snel psychologische hulp nodig' },
]

function App() {
	const [step, setStep] = useState<Step>('landing')
	const [adviceRanking, setAdviceRanking] = useState<string[]>(
		ADVICE_OPTIONS.map((o) => o.key),
	)
	const [numAppointments, setNumAppointments] = useState<number | null>(null)
	const [preferences, setPreferences] = useState<string[]>([])
	const [selectedTest, setSelectedTest] = useState<'4dkl' | 'spinnenweb' | ''>('')
	const [result4dkl, setResult4dkl] = useState<FourDKLResult | null>(null)
	const [resultSpinnenweb, setResultSpinnenweb] = useState<SpinnenwebResult | null>(null)
	const [contactEmail, setContactEmail] = useState<string>('')
	const [contactNote, setContactNote] = useState<string>('')
	const [adviceRequestSent, setAdviceRequestSent] = useState<boolean>(false)

	function moveAdvice(key: string, direction: 'up' | 'down') {
		setAdviceRanking((prev) => {
			const index = prev.indexOf(key)
			if (index === -1) return prev
			if (direction === 'up' && index === 0) return prev
			if (direction === 'down' && index === prev.length - 1) return prev
			const newOrder = [...prev]
			const swapWith = direction === 'up' ? index - 1 : index + 1
			;[newOrder[index], newOrder[swapWith]] = [newOrder[swapWith], newOrder[index]]
			return newOrder
		})
	}

	function resetQuiz() {
		setAdviceRanking(ADVICE_OPTIONS.map((o) => o.key))
		setNumAppointments(null)
		setPreferences([])
	}

	const isQuizComplete = adviceRanking.length === 5 && numAppointments !== null && preferences.length > 0

	function handleRequestAdvice() {
		// Verzamel resultaten voor een eventuele backend-integratie
		const payload = {
			contactEmail,
			contactNote,
			adviceRanking,
			numAppointments,
			preferences,
			selectedTest,
			result4dkl,
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
					<p className="text-muted-foreground">De mentaal StudentArts methode:</p>
					<p className="leading-relaxed text-foreground/90">
						Het aanvaarden van jouw klachten staat centraal (acceptatie). Je leert om het zinloze gevecht met (vervelende)
						emoties, gedachten en lichamelijke sensaties waar mogelijk te stoppen. Zo ontstaat er ruimte en aandacht voor
						dingen die echt belangrijk voor je zijn (commitment). Het doel is niet om alleen klachten op te lossen of te
						verminderen, maar vooral om mentaal veerkrachtiger te worden.
					</p>
					<h2 className="text-2xl font-medium tracking-tight">Hoe schakel je onze hulp in?</h2>
					<ol className="list-decimal pl-6 space-y-1">
						<li>
							Beantwoord de vragenlijsten. Je krijgt je eigen rapportage met daarin de testuitslagen.
						</li>
						<li>
							Na screening van de vragenlijst hoor je of je in aanmerking komt voor een afspraak met de psychologisch
							hulpverlener.
						</li>
						<li>
							Intake op basis vragenlijst: diagnose, verwijzing, maximaal 2 à 3 gesprekken.
						</li>
						<li>
							Vervolg POH GGZ behandeling voor levensvragen en lichte psychische klachten gemiddeld 2 tot 5 gesprekken.
						</li>
					</ol>
					<p className="leading-relaxed text-foreground/90">
						Zoek je uitgebreide psychologische hulp of heb je al ervaring met psychologische hulp, dan kun je beter direct een
						psychologenpraktijk zoeken. Kijk ook eens of Online psychologische hulp iets voor je kan zijn. Dit is vaak even
						effectief als een face-to-face contact!
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
					<h2 className="text-2xl font-semibold tracking-tight">Optionele tests</h2>
					<p className="text-muted-foreground">Kies een test om te starten of sla deze stap over.</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="rounded-xl border bg-card text-card-foreground shadow p-5 flex flex-col gap-3">
							<div className="flex items-start justify-between gap-2">
								<div>
									<h3 className="text-lg font-semibold">4DKL</h3>
									<p className="text-sm text-muted-foreground">Vierdimensionale Klachtenlijst (±5–10 min)</p>
								</div>
								<span className="inline-flex h-8 items-center rounded-full bg-orange-100 text-orange-700 px-3 text-xs font-medium dark:bg-orange-900/40 dark:text-orange-200">Mentaal welzijn</span>
							</div>
							<ul className="text-sm list-disc pl-5 space-y-1 text-foreground/90">
								<li>50 vragen over afgelopen week, schaal: nee → voortdurend</li>
								<li>Meet 4 schalen: Distress (16), Depressie (6), Angst (12), Somatisatie (16)</li>
								<li>Breed gebruikt in huisartsen- en bedrijfszorg</li>
							</ul>
							
							<div className="mt-auto flex justify-between items-center">
								{result4dkl && <span className="text-xs text-green-600">Ingevuld</span>}
								<button
									className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow"
									onClick={() => { setSelectedTest('4dkl'); setStep('quiz') }}
								>
									{result4dkl ? 'Wijzig 4DKL' : 'Start 4DKL'}
								</button>
							</div>
						</div>

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

			{step === 'quiz' && selectedTest === '4dkl' && (
				<Test4DKL
					onBack={() => setStep('tests')}
					onComplete={(res) => {
						setResult4dkl(res)
						setStep('tests')
					}}
				/>
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
					<p className="text-sm text-muted-foreground">Beantwoord eerst de algemene vragen. Daarna kun je optioneel een test kiezen.</p>

					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-3">
						<p className="text-sm font-medium text-muted-foreground">1. Welk advies is vooral op jou van toepassing?</p>
						<p className="text-sm text-muted-foreground">Zet de opties in volgorde van belangrijkheid (1 = belangrijkste).</p>
						<ul className="space-y-2">
							{adviceRanking.map((key, idx) => {
								const option = ADVICE_OPTIONS.find((o) => o.key === key)!
								return (
									<li key={key} className="flex items-center gap-3">
										<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 text-sm">
											{idx + 1}
										</span>
										<span className="flex-1">{option.label}</span>
										<span className="flex items-center gap-1">
											<button
												className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-orange-50 dark:hover:bg-orange-900/30 disabled:opacity-50"
												onClick={() => moveAdvice(key, 'up')}
												disabled={idx === 0}
												aria-label={`Verplaats ${option.label} omhoog`}
											>
												↑
											</button>
											<button
												className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-orange-50 dark:hover:bg-orange-900/30 disabled:opacity-50"
												onClick={() => moveAdvice(key, 'down')}
												disabled={idx === adviceRanking.length - 1}
												aria-label={`Verplaats ${option.label} omlaag`}
											>
												↓
											</button>
										</span>
									</li>
								)
							})}
						</ul>
					</div>

					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-3">
						<p className="text-sm font-medium text-muted-foreground">2. Schat in hoeveel afspraken denk je nodig te hebben?</p>
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
						<p className="text-sm font-medium text-muted-foreground">3. Welke behandeling(en) hebben jouw voorkeur?</p>
						<div className="flex flex-col gap-2">
							{[
								{ key: 'poh_ggz', label: 'Face to face met POH GGZ' },
								{ key: 'sport', label: 'Sport en bewegen' },
								{ key: 'group', label: 'Groepsbijeenkomst lotgenoten' },
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
							Verder naar optionele tests
						</button>
					</div>
				</div>
			)}

			{step === 'summary' && (
				<div className="space-y-4">
					<h2 className="text-2xl font-semibold tracking-tight">Samenvatting</h2>
					<p className="text-xs text-muted-foreground">Let op: interpretaties zijn indicatief en vervangen geen diagnose.</p>
					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
						<p className="text-sm font-medium text-muted-foreground">Gekozen test:</p>
						<p className="text-lg font-semibold">{selectedTest === '4dkl' ? '4DKL' : selectedTest === 'spinnenweb' ? 'Spinnenweb' : '-'}</p>
					</div>
					{result4dkl && (
						<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-2">
							<p className="text-sm font-medium text-muted-foreground">4DKL scores:</p>
							<ul className="grid sm:grid-cols-2 gap-2 text-sm">
								<li><span className="font-medium">Distress:</span> {result4dkl.distress}</li>
								<li><span className="font-medium">Depressie:</span> {result4dkl.depressie}</li>
								<li><span className="font-medium">Angst:</span> {result4dkl.angst}</li>
								<li><span className="font-medium">Somatisatie:</span> {result4dkl.somatisatie}</li>
							</ul>
							<p className="text-xs text-muted-foreground">Interpretatie volgt officiële handleiding; voeg cutoffs toe zodra beschikbaar.</p>
						</div>
					)}
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
					{/* Behandeladvies aanvragen */}
					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-3">
						<p className="text-sm font-medium text-muted-foreground">Vraag behandeladvies aan</p>
						<div className="grid gap-3">
							<input
								type="email"
								placeholder="jouw@email.nl"
								value={contactEmail}
								onChange={(e) => { setContactEmail(e.target.value); setAdviceRequestSent(false) }}
								className="rounded-md border bg-background px-3 py-2 text-sm"
							/>
							<textarea
								placeholder="Opmerkingen (optioneel)"
								value={contactNote}
								onChange={(e) => { setContactNote(e.target.value); setAdviceRequestSent(false) }}
								rows={4}
								className="rounded-md border bg-background px-3 py-2 text-sm"
							/>
							<div className="flex justify-end">
								<button
									className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow disabled:opacity-50"
									disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)}
									onClick={handleRequestAdvice}
								>
									Vraag behandeladvies aan
								</button>
							</div>
						</div>
						{adviceRequestSent && (
							<p className="text-xs text-green-600">Aanvraag verstuurd. We nemen contact met je op via e-mail.</p>
						)}
					</div>
					<div className="rounded-xl border bg-card text-card-foreground shadow p-5 space-y-3">
						<p className="text-sm font-medium text-muted-foreground">Jouw volgorde (1 = belangrijkste):</p>
						<ol className="space-y-2 list-none">
							{adviceRanking.map((key, idx) => {
								const option = ADVICE_OPTIONS.find((o) => o.key === key)!
								return (
									<li key={key} className="flex items-center gap-3">
										<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 text-sm">
											{idx + 1}
										</span>
										<span className="flex-1">{option.label}</span>
									</li>
								)
							})}
						</ol>
					</div>
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
					<div className="flex justify-between gap-3 pt-2">
						<div className="flex gap-2">
							<button
								className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
								onClick={() => {
								const rows: string[][] = [
									['Gekozen test', selectedTest || '-'],
									['Distress', result4dkl ? String(result4dkl.distress) : '-'],
									['Depressie', result4dkl ? String(result4dkl.depressie) : '-'],
									['Angst', result4dkl ? String(result4dkl.angst) : '-'],
									['Somatisatie', result4dkl ? String(result4dkl.somatisatie) : '-'],
								]
								if (resultSpinnenweb) {
									for (const [k, v] of Object.entries(resultSpinnenweb)) rows.push([k, String(v)])
								}
								downloadCsv('resultaten.csv', rows)
							}}
							>
								Exporteer CSV
							</button>
							<button
								className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
								onClick={printPage}
							>
								Print/PDF
							</button>
						</div>
						<button
							className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-900/30"
							onClick={() => setStep('quiz')}
						>
							Wijzig antwoorden
						</button>
						<button
							className="inline-flex items-center justify-center rounded-md bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 text-sm font-medium shadow"
							onClick={() => { resetQuiz(); setStep('landing') }}
						>
							Afronden
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
