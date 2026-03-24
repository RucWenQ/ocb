import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LikertScale from '../components/LikertScale'
import ScenarioQuestion from '../components/ScenarioQuestion'
import SliderQuestion from '../components/SliderQuestion'
import ocbScaleRaw from '../data/scales/ocb.json'
import pebScaleRaw from '../data/scales/peb.json'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import { nextScaleId } from '../utils/flow'

type ItemType = 'likert' | 'scenario' | 'slider' | 'multiple'

interface ScaleItem {
  id: string
  text: string
  type?: ItemType
  options?: string[]
  min?: number
  max?: number
}

interface ScaleConfig {
  id: string
  title: string
  instruction: string
  type?: ItemType | 'mixed'
  points?: number
  anchors?: [string, string]
  items: ScaleItem[]
}

const scales: Record<string, ScaleConfig> = {
  peb: pebScaleRaw as ScaleConfig,
  ocb: ocbScaleRaw as ScaleConfig,
}

function isAnswered(item: ScaleItem, value: unknown): boolean {
  const type = item.type ?? 'likert'
  if (type === 'multiple') return Array.isArray(value) && value.length > 0
  if (type === 'slider') return typeof value === 'number'
  return typeof value === 'number' || typeof value === 'string'
}

export default function MeasurePage() {
  const { scaleId } = useParams<{ scaleId: string }>()
  usePageTimer(`measure-${scaleId ?? 'unknown'}`)

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const saveDVResponse = useExperimentStore((state) => state.saveDVResponse)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const existingResponses = useExperimentStore((state) => state.dvResponses[scaleId ?? ''] as Record<string, unknown> | undefined)

  const scale = scaleId ? scales[scaleId] : undefined
  const [answers, setAnswers] = useState<Record<string, unknown>>(existingResponses ?? {})

  const allAnswered = useMemo(() => {
    if (!scale) return false
    return scale.items.every((item) => isAnswered(item, answers[item.id]))
  }, [answers, scale])

  if (!scale || !scaleId) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-600">量表不存在，正在返回流程页面。</p>
        <button
          type="button"
          onClick={() => navigate('/debrief')}
          className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white"
        >
          前往结束页
        </button>
      </section>
    )
  }

  const handleNext = async () => {
    if (!allAnswered) return
    saveDVResponse(scale.id, answers)
    await submitData(`measure-${scale.id}`, answers)

    const nextId = nextScaleId(scale.id)
    if (nextId) {
      setCurrentPage(nextId === 'peb' ? 6 : 7)
      navigate(`/measure/${nextId}`)
      return
    }

    setCurrentPage(8)
    navigate('/debrief')
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">{scale.title}</h1>
      <p className="mt-2 text-sm text-slate-600">{scale.instruction}</p>

      <div className="mt-5 space-y-5">
        {scale.items.map((item, index) => {
          const itemType = item.type ?? (scale.type === 'mixed' ? 'likert' : scale.type ?? 'likert')
          const value = answers[item.id]

          return (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-medium text-slate-800">
                {index + 1}. {item.text}
              </p>

              {itemType === 'likert' && (
                <LikertScale
                  points={scale.points ?? 7}
                  value={typeof value === 'number' ? value : undefined}
                  anchors={scale.anchors}
                  onChange={(next) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [item.id]: next,
                    }))
                  }
                />
              )}

              {itemType === 'scenario' && (
                <ScenarioQuestion
                  options={item.options ?? []}
                  value={typeof value === 'string' ? value : undefined}
                  onChange={(next) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [item.id]: next,
                    }))
                  }
                />
              )}

              {itemType === 'slider' && (
                <SliderQuestion
                  min={item.min ?? 0}
                  max={item.max ?? 100}
                  value={typeof value === 'number' ? value : undefined}
                  onChange={(next) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [item.id]: next,
                    }))
                  }
                />
              )}

              {itemType === 'multiple' && (
                <div className="space-y-2">
                  {(item.options ?? []).map((option) => {
                    const selected = Array.isArray(value) ? value.includes(option) : false
                    return (
                      <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            setAnswers((prev) => {
                              const current = Array.isArray(prev[item.id]) ? (prev[item.id] as string[]) : []
                              const next = event.target.checked
                                ? [...current, option]
                                : current.filter((entry) => entry !== option)
                              return { ...prev, [item.id]: next }
                            })
                          }}
                        />
                        {option}
                      </label>
                    )
                  })}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <button
        type="button"
        disabled={!allAnswered}
        onClick={handleNext}
        className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        下一页
      </button>
    </section>
  )
}
