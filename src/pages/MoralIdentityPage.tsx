import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertScale from '../components/LikertScale'
import { moralIdentityItems, moralIdentityTraits } from '../data/scales/moralIdentityScale'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import type { MoralIdentityScaleState } from '../types/experiment'

export default function MoralIdentityPage() {
  usePageTimer('moralIdentity')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const scale = useExperimentStore((state) => state.moralIdentityScale)
  const setScaleValue = useExperimentStore((state) => state.setMoralIdentityValue)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [invalidIds, setInvalidIds] = useState<string[]>([])

  const allAnswered = useMemo(() => {
    return moralIdentityItems.every((item) => scale[item.id] !== null)
  }, [scale])
  const values = useMemo<Record<string, number | null>>(() => ({ ...scale }), [scale])

  const handleNext = async () => {
    if (!allAnswered) {
      setInvalidIds(moralIdentityItems.filter((item) => scale[item.id] === null).map((item) => item.id))
      return
    }

    setInvalidIds([])
    await submitData('measure-moral-identity', scale)
    setCurrentPage(11)
    navigate('/debrief')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">道德认同</h1>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>下面是一些描述一个人品质特征的词语：</p>
        <p className="mt-1 text-slate-800">{moralIdentityTraits.join('、')}</p>
        <p className="mt-2">
          请你想象有这样一个人，这个人可能是你，也可能是你的家人、朋友甚至是陌生人。你不仅要想象这个人具有上述特征，还要想象这个人在日常生活中的所思所想、情绪体验和行为表现。通过想象，当你感觉自己对这个人的了解非常清晰后，请回答下面的问题。
        </p>
        <p className="mt-1">1 = 非常不符合，4 = 说不上符合还是不符合，7 = 非常符合</p>
      </div>

      <LikertScale
        items={moralIdentityItems.map((item) => ({ id: item.id, text: item.text }))}
        points={7}
        anchors={{ low: '非常不符合', mid: '说不上符合还是不符合', high: '非常符合' }}
        values={values}
        invalidIds={invalidIds}
        onChange={(id, value) => {
          setScaleValue(id as keyof MoralIdentityScaleState, value)
          if (invalidIds.includes(id)) {
            setInvalidIds((prev) => prev.filter((itemId) => itemId !== id))
          }
        }}
      />

      <button
        type="button"
        onClick={handleNext}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        下一步
      </button>
    </section>
  )
}
