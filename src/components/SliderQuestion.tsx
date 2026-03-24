interface SliderQuestionProps {
  min: number
  max: number
  value?: number
  onChange: (value: number) => void
}

export default function SliderQuestion({ min, max, value, onChange }: SliderQuestionProps) {
  const displayValue = value ?? Math.floor((min + max) / 2)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>{min}</span>
        <span className="font-medium text-brand-700">{displayValue}</span>
        <span>{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={displayValue}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
      />
    </div>
  )
}
