interface LikertItem {
  id: string
  text: string
}

interface LikertScaleProps {
  items: LikertItem[]
  points: 7
  anchors: {
    low: string
    mid: string
    high: string
  }
  values: Record<string, number | null>
  onChange: (id: string, value: number) => void
  invalidIds?: string[]
}

interface RatingButtonsProps {
  value: number | null
  onChange: (value: number) => void
  showAnchors?: boolean
  anchors?: {
    low: string
    mid: string
    high: string
  }
}

export function RatingButtons({ value, onChange, showAnchors = false, anchors }: RatingButtonsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {Array.from({ length: 7 }, (_, idx) => idx + 1).map((point) => {
          const selected = value === point
          return (
            <button
              key={point}
              type="button"
              onClick={() => onChange(point)}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs transition sm:h-9 sm:w-9 sm:text-sm ${
                selected
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
              }`}
            >
              {point}
            </button>
          )
        })}
      </div>

      {showAnchors && anchors && (
        <div className="mt-1 grid grid-cols-7 text-[11px] text-slate-500">
          <span>{anchors.low}</span>
          <span />
          <span />
          <span className="text-center">{anchors.mid}</span>
          <span />
          <span />
          <span className="text-right">{anchors.high}</span>
        </div>
      )}
    </div>
  )
}

export default function LikertScale({
  items,
  points,
  anchors,
  values,
  onChange,
  invalidIds = [],
}: LikertScaleProps) {
  if (points !== 7) {
    throw new Error('LikertScale currently supports only 7-point scale.')
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const invalid = invalidIds.includes(item.id)
        return (
          <article
            key={item.id}
            className={`rounded-xl border p-3 transition ${
              index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
            } ${invalid ? 'border-rose-400 ring-1 ring-rose-200 animate-[pulse_1s_ease-in-out_1]' : 'border-slate-200'}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <p className="text-sm text-slate-800 md:w-3/5">{item.text}</p>
              <div className="md:w-2/5">
                <RatingButtons
                  value={values[item.id] ?? null}
                  onChange={(value) => onChange(item.id, value)}
                  showAnchors={index === 0}
                  anchors={anchors}
                />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
