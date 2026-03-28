import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertScale from '../components/LikertScale'
import { moralDisengagementItems } from '../data/scales/moralDisengagementScale'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import type { MoralDisengagementScaleState } from '../types/experiment'
import { seededShuffle } from '../utils/shuffle'

export default function MoralDisengagementPage() {
  usePageTimer('moralDisengagement')

  const navigate = useNavigate()
  const participantId = useExperimentStore((state) => state.participantId)
  const scale = useExperimentStore((state) => state.moralDisengagementScale)
  const setScaleValue = useExperimentStore((state) => state.setMoralDisengagementValue)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [invalidIds, setInvalidIds] = useState<string[]>([])

  const renderedItems = useMemo(
    () => seededShuffle([...moralDisengagementItems], `${participantId || 'participant'}:moral-disengagement`),
    [participantId],
  )
  const allAnswered = useMemo(() => {
    return renderedItems.every((item) => scale[item.id] !== null)
  }, [renderedItems, scale])
  const values = useMemo<Record<string, number | null>>(() => ({ ...scale }), [scale])

  const handleNext = async () => {
    if (!allAnswered) {
      setInvalidIds(renderedItems.filter((item) => scale[item.id] === null).map((item) => item.id))
      return
    }

    setInvalidIds([])
    setCurrentPage(11)
    navigate('/measure/moral-identity')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>此时此刻，您是否同意以下陈述，请选择符合您当前想法的选项。</p>
      </div>

      <LikertScale
        items={renderedItems.map((item) => ({ id: item.id, text: item.text }))}
        points={7}
        anchors={{ low: '非常不赞同', mid: '不确定', high: '非常赞同' }}
        values={values}
        invalidIds={invalidIds}
        onChange={(id, value) => {
          setScaleValue(id as keyof MoralDisengagementScaleState, value)
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
