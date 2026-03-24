export const SCALE_SEQUENCE = ['peb', 'ocb'] as const
export type ScaleId = (typeof SCALE_SEQUENCE)[number]

export const TOTAL_PAGES = 8

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
  2: '背景说明',
  3: 'AI助理设置',
  4: 'AI对话',
  5: '采买回执',
  6: '量表作答 1/2',
  7: '量表作答 2/2',
  8: '实验结束',
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

export function nextScaleId(scaleId: string): ScaleId | null {
  const idx = SCALE_SEQUENCE.indexOf(scaleId as ScaleId)
  if (idx < 0 || idx === SCALE_SEQUENCE.length - 1) return null
  return SCALE_SEQUENCE[idx + 1]
}
