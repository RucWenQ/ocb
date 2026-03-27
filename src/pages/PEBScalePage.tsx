import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertScale from '../components/LikertScale'
import { pebItems } from '../data/scales/pebScale'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import type { PebScaleState } from '../types/experiment'

export default function PEBScalePage() {
  usePageTimer('pebScale')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const pebScale = useExperimentStore((state) => state.pebScale)
  const setPebScaleValue = useExperimentStore((state) => state.setPebScaleValue)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [invalidIds, setInvalidIds] = useState<string[]>([])

  const allAnswered = useMemo(() => {
    return pebItems.every((item) => pebScale[item.id] !== null)
  }, [pebScale])
  const pebValues = useMemo<Record<string, number | null>>(() => ({ ...pebScale }), [pebScale])

  const handleNext = async () => {
    if (!allAnswered) {
      setInvalidIds(pebItems.filter((item) => pebScale[item.id] === null).map((item) => item.id))
      return
    }

    setInvalidIds([])
    await submitData('measure-peb-scale', pebScale)
    setCurrentPage(9)
    navigate('/measure/moral-disengagement')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">PEB意愿量表</h1>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>未来一个月，您进行如下行为的可能性有多高。</p>
        <p className="mt-1">1 = 完全不可能，4 = 不确定，7 = 完全可能</p>
      </div>

      <LikertScale
        items={pebItems.map((item) => ({ id: item.id, text: item.text }))}
        points={7}
        anchors={{ low: '完全不可能', mid: '不确定', high: '完全可能' }}
        values={pebValues}
        invalidIds={invalidIds}
        onChange={(id, value) => {
          setPebScaleValue(id as keyof PebScaleState, value)
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
