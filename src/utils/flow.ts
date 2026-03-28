export const TOTAL_PAGES = 14
export const TOTAL_STEPS = 14

const pageRouteMap: Record<number, string> = {
  1: '/consent',
  2: '/briefing',
  3: '/ai-editor',
  4: '/chat',
  5: '/receipt',
  6: '/measure/filler-scale',
  7: '/measure/ocb-scenarios',
  8: '/measure/shopping-task',
  9: '/measure/peb-scale',
  10: '/measure/moral-disengagement',
  11: '/measure/moral-identity',
  12: '/measure/moral-credit',
  13: '/measure/manip-check',
  14: '/debrief',
}

const pageLabelMap: Record<number, string> = {
  1: '知情同意',
  2: '情境阅读',
  3: '设置AI助理',
  4: 'AI协助采购',
  5: '确认回执',
  6: '填充任务',
  7: '情境判断',
  8: '购物任务',
  9: '环保行为',
  10: '道德推脱',
  11: '道德认同',
  12: '道德信用',
  13: '操纵检查',
  14: '完成',
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
  if (pathname === '/measure/filler-scale') return 6
  if (pathname === '/measure/ocb-scenarios') return 7
  if (pathname === '/measure/shopping-task') return 8
  if (pathname === '/measure/peb-scale') return 9
  if (pathname === '/measure/moral-disengagement') return 10
  if (pathname === '/measure/moral-identity') return 11
  if (pathname === '/measure/moral-credit') return 12
  if (pathname === '/measure/manip-check') return 13
  if (pathname === '/debrief') return 14
  return null
}

export function stepForPage(page: number): number {
  return Math.min(Math.max(page, 1), TOTAL_STEPS)
}

export function stepLabelForPage(page: number): string {
  return labelForPage(stepForPage(page))
}
