import { useMemo, useState } from 'react'
import { FOUR_DKL_ITEMS, type FourDKLItem } from '../data/4dkl-items'

type Dimension = 'distress' | 'depressie' | 'angst' | 'somatisatie'

export type FourDKLResult = Record<Dimension, number>

type Item = FourDKLItem & { dim: Dimension }

const SCALE = [
	{ value: 0, label: 'Nee' },
	{ value: 1, label: 'Soms' },
	{ value: 2, label: 'Regelmatig' },
	{ value: 3, label: 'Vaak' },
	{ value: 4, label: 'Heel vaak/Voortdurend' },
]

// Items worden uit data-bestand geladen (plaats de officiële teksten daar)
const ITEMS: Item[] = FOUR_DKL_ITEMS as Item[]

export default function Test4DKL({
	onBack,
	onComplete,
}: {
	onBack: () => void
	onComplete: (result: FourDKLResult) => void
}) {
	const [answers, setAnswers] = useState<Record<string, number>>({})

	const remaining = ITEMS.length - Object.keys(answers).length
	const canSubmit = remaining === 0

	const result = useMemo<FourDKLResult>(() => {
		return ITEMS.reduce(
			(acc, item) => {
				const v = answers[item.id] ?? 0
				acc[item.dim] += v
				return acc
			},
			{ distress: 0, depressie: 0, angst: 0, somatisatie: 0 },
		)
	}, [answers])

	return (
		<div className="space-y-4">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">4DKL</h2>
					<p className="text-sm text-muted-foreground">Beantwoord de 50 items over de afgelopen week.</p>
				</div>
				<span className="text-sm text-muted-foreground">Nog {remaining} te gaan</span>
			</div>

			<div className="grid gap-3">
				{ITEMS.map((item, idx) => (
					<div key={item.id} className="rounded-xl border bg-card text-card-foreground shadow p-4">
						<p className="text-sm font-medium mb-2">
							{idx + 1}. {item.text}
						</p>
						<div className="grid grid-cols-5 gap-2">
							{SCALE.map((opt) => {
								const checked = answers[item.id] === opt.value
								return (
									<label
										key={opt.value}
										className={`${checked ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'hover:bg-orange-50 dark:hover:bg-orange-900/20'} inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm`}
									>
										<input
											type="radio"
											name={item.id}
											value={opt.value}
											checked={checked}
											onChange={() => setAnswers((p) => ({ ...p, [item.id]: opt.value }))}
											className="sr-only"
										/>
										<span>{opt.label}</span>
									</label>
								)
							})}
						</div>
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
					onClick={() => onComplete(result)}
				>
					Afronden
				</button>
			</div>
		</div>
	)
}


