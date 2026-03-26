import { RatingButtons } from './LikertScale'

interface ScenarioRatingOption {
  id: string
  text: string
}

interface ScenarioRatingCardProps {
  scenarioId: string
  title: string
  description: string
  options: ScenarioRatingOption[]
  values: Record<string, number | null>
  onChange: (optionId: string, value: number) => void
  invalidOptionIds?: string[]
}

export default function ScenarioRatingCard({
  title,
  description,
  options,
  values,
  onChange,
  invalidOptionIds = [],
}: ScenarioRatingCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{title}</span>
      </div>
      <div className="bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">{description}</div>
      <div className="divide-y divide-slate-200">
        {options.map((option, index) => {
          const invalid = invalidOptionIds.includes(option.id)
          return (
            <div
              key={option.id}
              className={`px-4 py-3 ${invalid ? 'bg-rose-50 animate-[pulse_1s_ease-in-out_1]' : 'bg-white'}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <p className="text-sm text-slate-800 md:w-3/5">{option.text}</p>
                <div className="md:w-2/5">
                  <RatingButtons
                    value={values[option.id] ?? null}
                    onChange={(value) => onChange(option.id, value)}
                    showAnchors={index === 0}
                    anchors={{ low: '完全不可能', mid: '说不准', high: '非常可能' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
