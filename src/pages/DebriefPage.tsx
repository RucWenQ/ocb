import { useState } from 'react'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'

type SubmitStatus = 'idle' | 'submitting' | 'done'

export default function DebriefPage() {
  usePageTimer('debrief')

  const submitData = useDataSubmit()
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const participantId = useExperimentStore((state) => state.participantId)
  const condition = useExperimentStore((state) => state.condition)
  const demographics = useExperimentStore((state) => state.demographics)
  const aiConfig = useExperimentStore((state) => state.aiConfig)
  const chatHistory = useExperimentStore((state) => state.chatHistory)
  const receiptViewDuration = useExperimentStore((state) => state.receiptViewDuration)
  const dvResponses = useExperimentStore((state) => state.dvResponses)
  const pageDurations = useExperimentStore((state) => state.pageDurations)

  const handleFinish = async () => {
    if (status !== 'idle') return
    setStatus('submitting')

    await submitData('final', {
      completedAt: new Date().toISOString(),
      participantId,
      condition,
      demographics,
      aiConfig,
      chatHistory,
      receiptViewDuration,
      dvResponses,
      pageDurations,
    })

    setStatus('done')
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">实验结束，感谢参与</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        本研究旨在考察AI辅助决策场景中的后续行为倾向。你看到的任务信息用于模拟真实办公环境，感谢你的耐心作答。
      </p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          被试编号：<span className="font-semibold text-slate-900">{participantId || '未生成'}</span>
        </p>
        <p className="mt-1">请保留该编号用于核对补偿。</p>
      </div>

      <button
        type="button"
        onClick={handleFinish}
        disabled={status !== 'idle'}
        className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {status === 'idle' && '提交最终数据并完成实验'}
        {status === 'submitting' && '提交中...'}
        {status === 'done' && '提交完成，可关闭页面'}
      </button>
    </section>
  )
}
