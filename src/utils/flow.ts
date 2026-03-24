export const SCALE_SEQUENCE = ['peb', 'ocb'] as const
export type ScaleId = (typeof SCALE_SEQUENCE)[number]

export const TOTAL_PAGES = 8
export const TOTAL_STEPS = 6

const pageRouteMap: Record<number, string> = {
  1: '/consent',
  2: '/briefing',
  3: '/ai-editor',
  4: '/chat',
  5: '/receipt',
  6: '/measure/peb',
  7: '/measure/ocb',
  8: '/debrief',
}

const pageLabelMap: Record<number, string> = {
  1: '知情同意',
 2: '情境阅读',
 3: '设置AI助理',
 4: 'AI协助采购',
 5: '确认回执',
 6: '问卷',
 7: '问卷',
  8: '实验结束',
}

const stepLabelMap: Record<number, string> = {
  1: '知情同意',
  2: '情境阅读',
  3: '设置AI助理',
  4: 'AI协助采购',
  5: '确认回执',
  6: '问卷',
}

export function pathForPage(page: number): string {
  return pageRouteMap[page] ?? '/consent'
}

export function labelForPage(page: number): string {
  return pageLabelMap[page] ?? '实验流程'
}

export function pageForPath(pathname: string): number | null {
  if (pathname === '/consent') return 1
  if (pathname === '/briefing') return 2
  if (pathname === '/ai-editor') return 3
  if (pathname === '/chat') return 4
  if (pathname === '/receipt') return 5
  if (pathname === '/measure/peb') return 6
  if (pathname === '/measure/ocb') return 7
  if (pathname === '/debrief') return 8
  return null
}

export function stepForPage(page: number): number {
  if (page <= 1) return 1
  if (page === 2) return 2
  if (page === 3) return 3
  if (page === 4) return 4
  if (page === 5) return 5
  return 6
}

export function stepLabelForPage(page: number): string {
  return stepLabelMap[stepForPage(page)] ?? '实验流程'
}

export function nextScaleId(scaleId: string): ScaleId | null {
  const idx = SCALE_SEQUENCE.indexOf(scaleId as ScaleId)
  if (idx < 0 || idx === SCALE_SEQUENCE.length - 1) return null
  return SCALE_SEQUENCE[idx + 1]
}
