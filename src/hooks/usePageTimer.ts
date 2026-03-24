import { useCallback, useEffect, useRef } from 'react'
import { useExperimentStore } from '../store/experimentStore'

export function usePageTimer(pageId?: string) {
  const startRef = useRef<number>(Date.now())
  const recordPageDuration = useExperimentStore((state) => state.recordPageDuration)

  const getDurationSeconds = useCallback(() => {
    return Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
  }, [])

  useEffect(() => {
    startRef.current = Date.now()

    return () => {
      if (!pageId) return
      recordPageDuration(pageId, getDurationSeconds())
    }
  }, [getDurationSeconds, pageId, recordPageDuration])

  return {
    getDurationSeconds,
    restart: () => {
      startRef.current = Date.now()
    },
  }
}
