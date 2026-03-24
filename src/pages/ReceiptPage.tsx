import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReceiptTable from '../components/ReceiptTable'
import { receiptDataByCondition } from '../data/receiptData'
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
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const setReceiptInfo = useExperimentStore((state) => state.setReceiptInfo)

  const receiptNo = useMemo(() => createReceiptNo(), [])
  const currentDate = useMemo(() => formatDate(new Date()), [])
  const { getDurationSeconds } = usePageTimer('receipt')

  const [toast, setToast] = useState('')
  const [canConfirm, setCanConfirm] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const receiptData = receiptDataByCondition[condition]

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
      total: receiptData.total,
      remaining: receiptData.remaining,
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
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
        <p>采购人：{aiNickname}</p>
        <p>采购单位：行政部</p>
      </div>

      {condition === 'experimental' && receiptData.banner && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {receiptData.banner}
        </div>
      )}

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="thin-scrollbar mt-4 max-h-[min(60vh,34rem)] overflow-y-auto rounded-xl border border-slate-200 p-3 [touch-action:pan-y]"
      >
        <ReceiptTable items={receiptData.items} showEcoColumn={condition === 'experimental'} />
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="flex items-center justify-between font-semibold text-slate-900">
            <span>总计</span>
            <span>¥{receiptData.total.toLocaleString('zh-CN')}</span>
          </p>
          <p className="mt-2 flex items-center justify-between text-slate-700">
            <span>预算剩余</span>
            <span>¥{receiptData.remaining.toLocaleString('zh-CN')}</span>
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-600">{receiptData.footnote}</p>
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
