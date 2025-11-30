import { useTranslation } from 'react-i18next'

type Props = {
  className?: string
}

export default function LanguageSwitcher({ className }: Props) {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage || i18n.language || 'nl').slice(0, 2)

  const change = (lng: 'nl' | 'en') => {
    if (lng !== current) void i18n.changeLanguage(lng)
  }

  const btn = (lng: 'nl' | 'en', label: string) => (
    <button
      type="button"
      onClick={() => change(lng)}
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border transition-colors ${
        current === lng
          ? 'bg-orange-500 text-white border-orange-600'
          : 'bg-background text-foreground border-muted hover:bg-orange-50'
      }`}
      aria-pressed={current === lng}
    >
      {label}
    </button>
  )

  return (
    <div className={className}>
      <div className="inline-flex gap-1" role="group" aria-label="Language switcher">
        {btn('nl', 'NL')}
        {btn('en', 'EN')}
      </div>
    </div>
  )
}
