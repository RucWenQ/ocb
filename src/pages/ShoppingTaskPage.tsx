import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { shoppingCategories } from '../data/shoppingData'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import type { ShoppingCategoryKey } from '../types/experiment'
import { seededShuffle } from '../utils/shuffle'

export default function ShoppingTaskPage() {
  usePageTimer('shoppingTask')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const participantId = useExperimentStore((state) => state.participantId)
  const shoppingChoices = useExperimentStore((state) => state.shoppingChoices)
  const setShoppingChoice = useExperimentStore((state) => state.setShoppingChoice)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)

  const renderedCategories = useMemo(() => {
    return shoppingCategories.map((category) => ({
      ...category,
      options: seededShuffle(category.options, `${participantId || 'participant'}:${category.id}`),
    }))
  }, [participantId])

  const allSelected = useMemo(() => {
    return shoppingCategories.every((category) => shoppingChoices[category.id] !== null)
  }, [shoppingChoices])

  const handleConfirm = async () => {
    if (!allSelected) return
    await submitData('measure-shopping-task', shoppingChoices)
    setCurrentPage(9)
    navigate('/measure/peb-scale')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        忙碌的一天结束了。你回到家后发现一些日用品需要补充，于是打开手机上的超市App准备下单。请在以下每组商品中选择你最想购买的一项。
      </div>

      <div className="space-y-5">
        {renderedCategories.map((category) => (
          <article key={category.id} className="space-y-3 border-b border-slate-200 pb-4 last:border-none">
            <h2 className="text-sm font-semibold text-slate-800">
              {category.category}
              <span className="ml-2 font-normal text-slate-500">· {category.prompt}</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {category.options.map((option) => (
                <ProductCard
                  key={option.id}
                  product={option}
                  selected={shoppingChoices[category.id] === option.id}
                  onSelect={() =>
                    setShoppingChoice(
                      category.id as ShoppingCategoryKey,
                      option.id,
                    )
                  }
                />
              ))}
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!allSelected}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        确认下单 →
      </button>
    </section>
  )
}
