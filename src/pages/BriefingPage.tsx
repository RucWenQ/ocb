import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { departmentNeeds, purchaseBrief, scenarioParagraphs } from '../data/purchaseBrief'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'

export default function BriefingPage() {
  usePageTimer('briefing')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [openedDeptId, setOpenedDeptId] = useState<string | null>(null)

  const handleNext = async () => {
    await submitData('briefing', { acknowledged: true })
    setCurrentPage(3)
    navigate('/ai-editor')
  }

  return (
    <section className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border-l-4 border-slate-700 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          在本研究中，请你想象自己是一家小型互联网公司的<b>行政专员</b>，日常工作包括办公物资管理、
          会议筹备等。
        </p>
        <p className="mt-2">请认真阅读以下工作情境，在后续环节中你将使用AI助理来完成相关任务。</p>
      </div>

      <article className="rounded-xl border border-slate-200 p-4">
        <h1 className="text-xl font-semibold text-slate-900">情境描述</h1>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
          {scenarioParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-slate-200 p-4">
        <h2 className="text-base font-semibold text-slate-900">各部门需求明细</h2>
        <div className="mt-3 space-y-2">
          {departmentNeeds.map((dept) => {
            const open = openedDeptId === dept.id
            return (
              <div key={dept.id} className="overflow-hidden rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOpenedDeptId((prev) => (prev === dept.id ? null : dept.id))}
                  className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
                >
                  <span className="text-sm font-medium text-slate-800">{dept.name}</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                    {dept.headcount}人
                  </span>
                </button>
                {open && (
                  <ul className="list-disc space-y-2 px-8 py-3 text-sm text-slate-700">
                    {dept.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </article>

      <article className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h2 className="text-base font-semibold text-slate-900">月度例会信息</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li>会议时间：{purchaseBrief.meetingTime}</li>
          <li>参会人数：{purchaseBrief.participants}</li>
          <li>地点：{purchaseBrief.room}</li>
          <li>需准备：{purchaseBrief.meetingNeeds.join('、')}等</li>
        </ul>
      </article>

      <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
        本月行政部剩余预算：¥{purchaseBrief.budget.toLocaleString('zh-CN')}
      </div>

      <p className="text-sm text-slate-600">
        由于需求较多，公司为每位员工配备了AI助理来协助工作。接下来请先设置你的AI助理，然后将采购需求发送给它处理。
      </p>

      <button
        type="button"
        onClick={handleNext}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        下一步：设置AI助理 →
      </button>
    </section>
  )
}
