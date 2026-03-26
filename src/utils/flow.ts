export const TOTAL_PAGES = 10
export const TOTAL_STEPS = 10

const pageRouteMap: Record<number, string> = {
  1: '/consent',
  2: '/briefing',
  3: '/ai-editor',
  4: '/chat',
  5: '/receipt',
  6: '/measure/ocb-scenarios',
  7: '/measure/shopping-task',
  8: '/measure/peb-scale',
  9: '/measure/ocb-scale',
  10: '/debrief',
}

const pageLabelMap: Record<number, string> = {
  1: '知情同意',
  2: '情境阅读',
  3: '设置AI助理',
  4: 'AI协助采购',
  5: '确认回执',
  6: '情境判断',
  7: '购物任务',
  8: '行为问卷',
  9: '工作问卷',
  10: '完成',
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
  if (pathname === '/measure/ocb-scenarios') return 6
  if (pathname === '/measure/shopping-task') return 7
  if (pathname === '/measure/peb-scale') return 8
  if (pathname === '/measure/ocb-scale') return 9
  if (pathname === '/debrief') return 10
  return null
}

export function stepForPage(page: number): number {
  return Math.min(Math.max(page, 1), TOTAL_STEPS)
}

export function stepLabelForPage(page: number): string {
  return labelForPage(stepForPage(page))
}
