import { useCallback, useEffect, useRef } from "react";
import { useExperimentStore } from "../store/experimentStore";

export function usePageTimer(pageId?: string) {
  const startRef = useRef<number>(0);
  const recordPageDuration = useExperimentStore((state) => state.recordPageDuration);

  const getDurationSeconds = useCallback(() => {
    const startTime = startRef.current || Date.now();
    return Math.max(1, Math.round((Date.now() - startTime) / 1000));
  }, []);

  useEffect(() => {
    startRef.current = Date.now();

    return () => {
      if (!pageId) return;
      recordPageDuration(pageId, getDurationSeconds());
    };
  }, [getDurationSeconds, pageId, recordPageDuration]);

  return {
    getDurationSeconds,
    restart: () => {
      startRef.current = Date.now();
    },
  };
}
