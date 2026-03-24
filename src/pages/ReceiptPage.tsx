import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReceiptTable from '../components/ReceiptTable'
import { controlItems, experimentalBanner, experimentalItems } from '../data/receiptData'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long' }).format(date)
}

function createReceiptNo(): string {
  return `ZX-${Math.random().toString().slice(2, 8)}`
}

export default function ReceiptPage() {
  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const condition = useExperimentStore((state) => state.condition ?? 'control')
  const aiNickname = useExperimentStore((state) => state.aiConfig.nickname || 'AI助理')
  const participantId = useExperimentStore((state) => state.participantId || '未命名')
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const setReceiptInfo = useExperimentStore((state) => state.setReceiptInfo)

  const receiptNo = useMemo(() => createReceiptNo(), [])
  const currentDate = useMemo(() => formatDate(new Date()), [])
  const { getDurationSeconds } = usePageTimer('receipt')

  const [toast, setToast] = useState('')
  const [canConfirm, setCanConfirm] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const items = condition === 'experimental' ? experimentalItems : controlItems
  const total = condition === 'experimental' ? 414 : 332

  const evaluateConfirmState = useCallback(() => {
    const node = scrollerRef.current
    if (!node) return

    const hasVerticalOverflow = node.scrollHeight - node.clientHeight > 4
    if (!hasVerticalOverflow) {
      setCanConfirm(true)
      return
    }

    const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 12
    setCanConfirm(reachedBottom)
  }, [])

  const handleScroll = () => {
    evaluateConfirmState()
  }

  useEffect(() => {
    const raf = window.requestAnimationFrame(evaluateConfirmState)
    window.addEventListener('resize', evaluateConfirmState)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', evaluateConfirmState)
    }
  }, [evaluateConfirmState])

  const handleConfirm = async () => {
    if (!canConfirm) return
    const duration = getDurationSeconds()
    setReceiptInfo(true, duration)

    await submitData('receipt', {
      condition,
      receiptNo,
      duration,
      total,
    })

    setToast('采买已确认，正在生成记录...')
    window.setTimeout(() => {
      setCurrentPage(6)
      navigate('/measure/peb')
    }, 1500)
  }

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">物资采买回执</h1>
      <p className="mt-1 text-xs text-slate-500">
        回执编号：{receiptNo} | 采买日期：{currentDate}
      </p>

      <div className="mt-2 text-sm text-slate-600">
        采买人：{aiNickname}（代 {participantId}）
      </div>

      {condition === 'experimental' && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {experimentalBanner}
        </div>
      )}

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="thin-scrollbar mt-4 max-h-[min(60vh,34rem)] overflow-y-auto rounded-xl border border-slate-200 p-3 [touch-action:pan-y]"
      >
        <ReceiptTable items={items} />
        <p className="mt-3 text-right text-base font-semibold text-slate-900">总计：{total}元</p>
        <p className="mt-2 text-sm text-slate-600">
          {condition === 'experimental'
            ? 'AI助理优先为您筛选了具有环保认证的办公用品，在满足会议需求的同时减少环境影响。'
            : 'AI助理已根据会议需求为您完成物资采买。'}
        </p>
      </div>

      {!canConfirm && <p className="mt-3 text-xs text-amber-600">请滚动查看完整回执后再确认采买。</p>}
      {toast && <p className="mt-3 text-sm text-emerald-700">{toast}</p>}

      <button
        type="button"
        disabled={!canConfirm}
        onClick={handleConfirm}
        className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        确认采买
      </button>
    </section>
  )
}
