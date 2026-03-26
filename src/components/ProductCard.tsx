import type { ShoppingOption } from '../data/shoppingData'

interface ProductCardProps {
  product: ShoppingOption
  selected: boolean
  onSelect: () => void
}

export default function ProductCard({ product, selected, onSelect }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full rounded-xl border p-4 text-center transition ${
        selected
          ? 'border-2 border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-400'
      }`}
    >
      {selected && (
        <span className="absolute right-2 top-2 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs font-semibold text-white">
          ✓
        </span>
      )}
      <p className="text-4xl">{product.icon}</p>
      <p className="mt-2 text-base font-semibold text-slate-800">{product.name}</p>
      <p className="mt-1 min-h-[2.5rem] text-xs leading-5 text-slate-500">{product.desc}</p>
      <p className="mt-3 text-lg font-semibold text-orange-600">{product.price}</p>
    </button>
  )
}
