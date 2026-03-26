import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'

type SubmitStatus = 'submitting' | 'success' | 'error'

function buildRedirectUrl(baseUrl: string, participantId: string): string {
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}id=${encodeURIComponent(participantId)}`
}

export default function DebriefPage() {
  usePageTimer('debrief')

  const participantId = useExperimentStore((state) => state.participantId)
  const condition = useExperimentStore((state) => state.condition ?? 'control')
  const startTime = useExperimentStore((state) => state.startTime)
  const demographics = useExperimentStore((state) => state.demographics)
  const aiConfig = useExperimentStore((state) => state.aiConfig)
  const chatHistory = useExperimentStore((state) => state.chatHistory)
  const receiptConfirmed = useExperimentStore((state) => state.receiptConfirmed)
  const receiptViewDuration = useExperimentStore((state) => state.receiptViewDuration)
  const ocbScenarios = useExperimentStore((state) => state.ocbScenarios)
  const shoppingChoices = useExperimentStore((state) => state.shoppingChoices)
  const pebScale = useExperimentStore((state) => state.pebScale)
  const ocbScale = useExperimentStore((state) => state.ocbScale)
  const pageDurations = useExperimentStore((state) => state.pageDurations)
  const [status, setStatus] = useState<SubmitStatus>('submitting')

  const endTime = useMemo(() => new Date().toISOString(), [])
  const totalDuration = useMemo(() => {
    if (!startTime) return 0
    const startMs = new Date(startTime).getTime()
    const endMs = new Date(endTime).getTime()
    return Math.max(1, Math.round((endMs - startMs) / 1000))
  }, [endTime, startTime])

  const finalPayload = useMemo(
    () => ({
      participantId,
      condition,
      startTime,
      endTime,
      totalDuration,
      demographics: {
        gender: demographics.gender,
        age: demographics.age,
        education: demographics.education,
        workExperience: demographics.workExperience,
      },
      aiConfig: {
        nickname: aiConfig.nickname,
        avatarId: aiConfig.avatarId,
        personality: aiConfig.personality,
        creativity: aiConfig.creativity,
        detailLevel: aiConfig.detailLevel,
        customPrompt: aiConfig.customPrompt,
      },
      chatHistory,
      receiptConfirmed,
      receiptViewDuration,
      dv: {
        ocbScenarios,
        shoppingChoices,
        pebScale,
        ocbScale,
      },
      pageDurations,
    }),
    [
      aiConfig.avatarId,
      aiConfig.creativity,
      aiConfig.customPrompt,
      aiConfig.detailLevel,
      aiConfig.nickname,
      aiConfig.personality,
      chatHistory,
      condition,
      demographics.age,
      demographics.education,
      demographics.gender,
      demographics.workExperience,
      endTime,
      ocbScale,
      ocbScenarios,
      pageDurations,
      participantId,
      pebScale,
      receiptConfirmed,
      receiptViewDuration,
      shoppingChoices,
      startTime,
      totalDuration,
    ],
  )

  const submitFinalData = useCallback(async () => {
    setStatus('submitting')
    const endpoint = (import.meta.env.VITE_FINAL_SUBMIT_ENDPOINT as string | undefined) ?? '/api/final-submit'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      })
      if (!response.ok) {
        throw new Error(`submit failed: ${response.status}`)
      }
      setStatus('success')
    } catch {
      localStorage.setItem('experiment_final_submission_fallback', JSON.stringify(finalPayload))
      setStatus('error')
    }
  }, [finalPayload])

  useEffect(() => {
    void submitFinalData()
  }, [submitFinalData])

  const redirectUrlRaw = import.meta.env.VITE_REDIRECT_URL as string | undefined
  const redirectUrl = redirectUrlRaw && participantId ? buildRedirectUrl(redirectUrlRaw, participantId) : ''

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-emerald-300 bg-emerald-50 text-3xl text-emerald-600 animate-[pulse_2s_ease-in-out_infinite]">
        ✓
      </div>

      <h1 className="mt-4 text-center text-2xl font-semibold text-slate-900">实验完成，感谢您的参与！</h1>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>本研究旨在探讨人工智能辅助决策对个体后续行为倾向的影响。</p>
        <p className="mt-2">
          在实验中，AI助理为您生成的采购回执是由研究者预先设定的内容，并非AI的真实决策结果。购物任务环节也是模拟设置，不会产生实际交易。
        </p>
        <p className="mt-2">
          您的所有数据将严格保密，仅用于学术研究目的。如果您对本研究有任何疑问，请联系研究者：research@example.com
        </p>
      </div>

      <p className="mt-4 text-center text-sm text-slate-700">
        您的参与编号：<span className="font-semibold text-slate-900">{participantId || '未生成'}</span>
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        {status === 'submitting' && (
          <p className="flex items-center justify-center gap-2 text-slate-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
            正在提交数据...
          </p>
        )}
        {status === 'success' && <p className="text-center text-emerald-700">✅ 数据已成功提交</p>}
        {status === 'error' && (
          <div className="space-y-2 text-center">
            <p className="text-rose-600">❌ 提交失败</p>
            <button
              type="button"
              onClick={() => void submitFinalData()}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              重试
            </button>
          </div>
        )}
      </div>

      {redirectUrl && (
        <a
          href={redirectUrl}
          className="mt-4 block w-full rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brand-700"
        >
          返回问卷平台 →
        </a>
      )}
    </section>
  )
}
