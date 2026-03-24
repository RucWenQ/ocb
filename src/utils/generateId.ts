export function generateParticipantId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  }

  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `P-${Date.now().toString(36).toUpperCase()}-${randomPart}`
}
