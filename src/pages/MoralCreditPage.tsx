import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LikertScale from '../components/LikertScale'
import { injectAiNickname, moralCreditItems } from '../data/scales/moralCreditScale'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'

type MoralCreditState = Record<(typeof moralCreditItems)[number]['id'], number | null>

const initialState: MoralCreditState = {
  mc1: null,
  mc2: null,
  mc3: null,
  mc4: null,
  mc5: null,
}

export default function MoralCreditPage() {
  usePageTimer('moralCredit')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const aiNickname = useExperimentStore((state) => state.aiConfig.nickname || 'AI助理')
  const saved = useExperimentStore((state) => state.dvResponses.moralCredit as MoralCreditState | undefined)
  const saveDVResponse = useExperimentStore((state) => state.saveDVResponse)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [values, setValues] = useState<MoralCreditState>(saved ?? initialState)
  const [invalidIds, setInvalidIds] = useState<string[]>([])

  const renderedItems = useMemo(
    () =>
      moralCreditItems.map((item) => ({
        id: item.id,
        text: injectAiNickname(item.textTemplate, aiNickname),
      })),
    [aiNickname],
  )
  const allAnswered = useMemo(() => renderedItems.every((item) => values[item.id] !== null), [renderedItems, values])

  const handleNext = async () => {
    if (!allAnswered) {
      setInvalidIds(renderedItems.filter((item) => values[item.id] === null).map((item) => item.id))
      return
    }

    setInvalidIds([])
    saveDVResponse('moralCredit', values)
    await submitData('measure-moral-credit', values)
    setCurrentPage(13)
    navigate('/measure/manip-check')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>请回忆刚才你的AI助理 {aiNickname} 为你完成采购的过程。</p>
        <p className="mt-2">
          想象每个人的内心都有一个"道德账户"，就像银行账户一样。做了好事，道德积分就会增加；积累到一定额度，就会被认为是一个有道德的人。
        </p>
        <p className="mt-2">请评价以下描述在多大程度上符合你的想法或感受。</p>
        <p className="mt-2">量表范围：1=完全不同意，4=说不准，7=完全同意。</p>
      </div>

      <LikertScale
        items={renderedItems}
        points={7}
        anchors={{ low: '完全不同意', mid: '说不准', high: '完全同意' }}
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
