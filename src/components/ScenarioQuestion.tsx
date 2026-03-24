interface ScenarioQuestionProps {
  options: string[]
  value?: string
  onChange: (value: string) => void
}

export default function ScenarioQuestion({ options, value, onChange }: ScenarioQuestionProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`w-full rounded-xl border p-3 text-left text-sm transition ${
            value === option
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
