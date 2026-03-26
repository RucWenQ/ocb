import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScenarioRatingCard from '../components/ScenarioRatingCard'
import { ocbScenarios } from '../data/scenarios'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import type { OcbScenarioKey } from '../types/experiment'
import { seededShuffle } from '../utils/shuffle'

type InvalidMap = Record<OcbScenarioKey, string[]>

const emptyInvalidMap: InvalidMap = {
  scenario1: [],
  scenario2: [],
  scenario3: [],
}

function orderKeyForScenario(scenarioId: OcbScenarioKey) {
  return `${scenarioId}_order` as const
}

export default function OCBScenarioPage() {
  usePageTimer('ocbScenarios')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const participantId = useExperimentStore((state) => state.participantId)
  const ocbScenariosState = useExperimentStore((state) => state.ocbScenarios)
  const setOcbScenarioRating = useExperimentStore((state) => state.setOcbScenarioRating)
  const setOcbScenarioOrder = useExperimentStore((state) => state.setOcbScenarioOrder)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const [invalidMap, setInvalidMap] = useState<InvalidMap>(emptyInvalidMap)

  const renderedScenarios = useMemo(() => {
    return ocbScenarios.map((scenario) => {
      const orderKey = orderKeyForScenario(scenario.id)
      const existingOrder = ocbScenariosState[orderKey]
      const hasValidStoredOrder = existingOrder.length === scenario.options.length

      if (hasValidStoredOrder) {
        const orderedOptions = [...scenario.options].sort((a, b) => {
          const aKey = a.optionKey.replace('opt', '')
          const bKey = b.optionKey.replace('opt', '')
          return existingOrder.indexOf(aKey) - existingOrder.indexOf(bKey)
        })
        return { ...scenario, options: orderedOptions }
      }

      const seeded = seededShuffle(
        scenario.options,
        `${participantId || 'participant'}:${scenario.id}`,
      )
      return { ...scenario, options: seeded }
    })
  }, [ocbScenariosState, participantId])

  useEffect(() => {
    renderedScenarios.forEach((scenario) => {
      const orderKey = orderKeyForScenario(scenario.id)
      if (ocbScenariosState[orderKey].length > 0) return
      setOcbScenarioOrder(
        scenario.id,
        scenario.options.map((option) => option.optionKey.replace('opt', '')),
      )
    })
  }, [ocbScenariosState, renderedScenarios, setOcbScenarioOrder])

  const allAnswered = useMemo(() => {
    return renderedScenarios.every((scenario) =>
      scenario.options.every((option) => {
        return ocbScenariosState[scenario.id][option.optionKey] !== null
      }),
    )
  }, [ocbScenariosState, renderedScenarios])

  const handleNext = async () => {
    if (!allAnswered) {
      const nextInvalidMap: InvalidMap = {
        scenario1: [],
        scenario2: [],
        scenario3: [],
      }

      renderedScenarios.forEach((scenario) => {
        scenario.options.forEach((option) => {
          if (ocbScenariosState[scenario.id][option.optionKey] === null) {
            nextInvalidMap[scenario.id].push(option.id)
          }
        })
      })

      setInvalidMap(nextInvalidMap)
      return
    }

    setInvalidMap(emptyInvalidMap)
    await submitData('measure-ocb-scenarios', ocbScenariosState)
    setCurrentPage(7)
    navigate('/measure/shopping-task')
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>
          请继续以行政专员的身份，阅读以下三个工作场景。对于每个场景中列出的几种做法，请分别评价你做出该行为的可能性有多大。
        </p>
        <p className="mt-1">1 = 完全不可能，4 = 说不准，7 = 非常可能</p>
      </div>

      <div className="space-y-4">
        {renderedScenarios.map((scenario) => {
          const values = Object.fromEntries(
            scenario.options.map((option) => [option.id, ocbScenariosState[scenario.id][option.optionKey]]),
          ) as Record<string, number | null>

          return (
            <ScenarioRatingCard
              key={scenario.id}
              scenarioId={scenario.id}
              title={scenario.title}
              description={scenario.description}
              options={scenario.options}
              values={values}
              invalidOptionIds={invalidMap[scenario.id]}
              onChange={(optionId, value) => {
                const option = scenario.options.find((item) => item.id === optionId)
                if (!option) return
                setOcbScenarioRating(scenario.id, option.optionKey, value)
                if (invalidMap[scenario.id].length > 0) {
                  setInvalidMap((prev) => ({
                    ...prev,
                    [scenario.id]: prev[scenario.id].filter((id) => id !== optionId),
                  }))
                }
              }}
            />
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        下一步
      </button>
    </section>
  )
}
