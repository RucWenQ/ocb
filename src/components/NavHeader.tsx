import { useLocation } from 'react-router-dom'
import { pageForPath, stepForPage, stepLabelForPage, TOTAL_STEPS } from '../utils/flow'

export default function NavHeader() {
  const location = useLocation()
  const page = pageForPath(location.pathname) ?? 1
  const step = stepForPage(page)
  const stepLabel = stepLabelForPage(page)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-800">心理学实验</p>
          <p className="text-xs text-slate-500">{stepLabel}</p>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
          第{step}步 / 共{TOTAL_STEPS}步
        </p>
      </div>
    </header>
  )
}
