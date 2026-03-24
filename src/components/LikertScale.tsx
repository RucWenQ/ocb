interface LikertScaleProps {
  points: number
  value?: number
  onChange: (value: number) => void
  anchors?: [string, string]
}

export default function LikertScale({ points, value, onChange, anchors }: LikertScaleProps) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-2 sm:grid-cols-7">
        {Array.from({ length: points }, (_, idx) => idx + 1).map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onChange(point)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              value === point
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
            }`}
          >
            {point}
          </button>
        ))}
      </div>
      {anchors && (
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>{anchors[0]}</span>
          <span>{anchors[1]}</span>
        </div>
      )}
    </div>
  )
}
