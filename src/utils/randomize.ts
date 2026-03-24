import type { Condition } from '../types/experiment'

const VALID_CONDITIONS = new Set<Condition>(['experimental', 'control'])

export function assignCondition(forcedCondition: string | null): Condition {
  if (forcedCondition && VALID_CONDITIONS.has(forcedCondition as Condition)) {
    return forcedCondition as Condition
  }

  return Math.random() < 0.5 ? 'experimental' : 'control'
}
