import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertScale from '../components/LikertScale'
import { fillerItems } from '../data/scales/fillerScale'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'

type FillerScaleState = Record<(typeof fillerItems)[number]['id'], number | null>

const initialState: FillerScaleState = {
  filler1: null,
  filler2: null,
  filler3: null,
  filler4: null,
  filler5: null,
  filler6: null,
  filler7: null,
  filler8: null,
}

export default function FillerScalePage() {
  usePageTimer('fillerScale')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const saved = useExperimentStore((state) => state.dvResponses.fillerScale as FillerScaleState | undefined)
  const saveDVResponse = useExperimentStore((state) => state.saveDVResponse)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [values, setValues] = useState<FillerScaleState>(saved ?? initialState)
  const [invalidIds, setInvalidIds] = useState<string[]>([])

  const allAnswered = useMemo(() => fillerItems.every((item) => values[item.id] !== null), [values])

  const handleNext = async () => {
    if (!allAnswered) {
      setInvalidIds(fillerItems.filter((item) => values[item.id] === null).map((item) => item.id))
      return
    }

    setInvalidIds([])
    saveDVResponse('fillerScale', values)
    await submitData('measure-filler-scale', values)
    setCurrentPage(7)
    navigate('/measure/ocb-scenarios')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>请根据你刚才使用AI助理处理采购任务的真实体验，评价以下陈述。</p>
        <p className="mt-1">量表范围：1=非常不同意，4=一般，7=非常同意。</p>
      </div>

      <LikertScale
        items={fillerItems.map((item) => ({ id: item.id, text: item.text }))}
        points={7}
        anchors={{ low: '非常不同意', mid: '一般', high: '非常同意' }}
        values={values}
        invalidIds={invalidIds}
        onChange={(id, value) => {
          setValues((prev) => ({ ...prev, [id]: value }))
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
