interface ShoppingSummaryProps {
  categories: Array<{ id: string; category: string }>
  selections: Record<string, { name: string; price: string } | null>
  canConfirm?: boolean
  onConfirm?: () => void
}

function parsePrice(price: string): number {
  const value = Number(price.replace(/[^\d.]/g, ''))
  return Number.isFinite(value) ? value : 0
}

export default function ShoppingSummary({
  categories,
  selections,
  canConfirm = false,
  onConfirm,
}: ShoppingSummaryProps) {
  const total = categories.reduce((sum, category) => {
    const selected = selections[category.id]
    return sum + (selected ? parsePrice(selected.price) : 0)
  }, 0)

  return (
    <aside className="sticky bottom-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">🛒 购物小结</h2>
      <div className="mt-2 space-y-1 text-sm">
        {categories.map((category) => {
          const selected = selections[category.id]
          return (
            <p key={category.id} className="flex items-start justify-between gap-2">
              <span className="w-20 shrink-0 text-slate-700">{category.category}：</span>
              {selected ? (
                <span className="flex-1 text-right text-slate-800">
                  {selected.name} {selected.price}
                </span>
              ) : (
                <span className="flex-1 text-right text-slate-400">（未选择）</span>
              )}
            </p>
          )
        })}
      </div>

      <div className="my-3 border-t border-slate-200" />
      <p className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>合计</span>
        <span>¥{total.toFixed(1)}</span>
      </p>

      {canConfirm && onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          className="mt-3 w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          确认下单 →
        </button>
      )}
    </aside>
  )
}
