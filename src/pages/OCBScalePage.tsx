import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertScale from '../components/LikertScale'
import { ocbItems } from '../data/scales/ocbScale'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import type { OcbScaleState } from '../types/experiment'

export default function OCBScalePage() {
  usePageTimer('ocbScale')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const ocbScale = useExperimentStore((state) => state.ocbScale)
  const setOcbScaleValue = useExperimentStore((state) => state.setOcbScaleValue)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [invalidIds, setInvalidIds] = useState<string[]>([])

  const allAnswered = useMemo(() => {
    return ocbItems.every((item) => ocbScale[item.id] !== null)
  }, [ocbScale])
  const ocbValues = useMemo<Record<string, number | null>>(() => ({ ...ocbScale }), [ocbScale])

  const handleNext = async () => {
    if (!allAnswered) {
      setInvalidIds(ocbItems.filter((item) => ocbScale[item.id] === null).map((item) => item.id))
      return
    }

    setInvalidIds([])
    await submitData('measure-ocb-scale', ocbScale)
    setCurrentPage(10)
    navigate('/debrief')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">OCB意愿量表</h1>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>请继续以行政专员的身份思考。在接下来的工作中，你在多大程度上愿意做以下事情？</p>
        <p className="mt-1">1 = 非常不愿意，4 = 一般，7 = 非常愿意</p>
      </div>

      <LikertScale
        items={ocbItems.map((item) => ({ id: item.id, text: item.text }))}
        points={7}
        anchors={{ low: '非常不愿意', mid: '一般', high: '非常愿意' }}
        values={ocbValues}
        invalidIds={invalidIds}
        onChange={(id, value) => {
          setOcbScaleValue(id as keyof OcbScaleState, value)
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
