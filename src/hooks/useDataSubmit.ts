import { useCallback } from 'react'
import { useExperimentStore } from '../store/experimentStore'

interface SubmissionPayload {
  participantId: string
  condition: string | null
  startTime: string
  pageId: string
  timestamp: string
  data: unknown
}

export function useDataSubmit() {
  const participantId = useExperimentStore((state) => state.participantId)
  const condition = useExperimentStore((state) => state.condition)
  const startTime = useExperimentStore((state) => state.startTime)

  return useCallback(
    async (pageId: string, data: unknown): Promise<void> => {
      const payload: SubmissionPayload = {
        participantId,
        condition,
        startTime,
        pageId,
        timestamp: new Date().toISOString(),
        data,
      }

      try {
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`submit failed: ${response.status}`)
        }
      } catch {
        const key = 'experiment_submission_fallback'
        const current = localStorage.getItem(key)
        const queue = current ? (JSON.parse(current) as SubmissionPayload[]) : []
        queue.push(payload)
        localStorage.setItem(key, JSON.stringify(queue))
      }

      console.log('[submit]', payload)
    },
    [participantId, condition, startTime],
  )
}
