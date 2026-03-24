interface ProgressBarProps {
  current: number
  total: number
  label: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  )
}
