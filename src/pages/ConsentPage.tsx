import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import { assignCondition } from '../utils/randomize'
import type { Demographics } from '../types/experiment'

const educationOptions = ['高中及以下', '大专', '本科', '硕士', '博士']
const workOptions = ['无', '1年以下', '1-3年', '3-5年', '5年以上']

const consentText = [
  '感谢你参与本研究。本研究旨在了解不同办公任务场景下的决策与行为意向。',
  '全程预计15-20分钟。你可在任何时间退出且不会受到任何惩罚。',
  '我们仅收集匿名数据用于学术研究，所有信息将严格保密。',
  '研究过程中将包含AI辅助办公情境及问卷测量任务。',
  '如有疑问，请联系研究团队：research@example.com。',
]

export default function ConsentPage() {
  usePageTimer('consent')

  const navigate = useNavigate()
  const location = useLocation()
  const submitData = useDataSubmit()
  const initializeParticipant = useExperimentStore((state) => state.initializeParticipant)
  const setCondition = useExperimentStore((state) => state.setCondition)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)
  const setConsentData = useExperimentStore((state) => state.setConsentData)
  const demographicsFromStore = useExperimentStore((state) => state.demographics)
  const consentGivenFromStore = useExperimentStore((state) => state.consentGiven)

  const consentScrollRef = useRef<HTMLDivElement | null>(null)
  const [hasReadToBottom, setHasReadToBottom] = useState(false)
  const [consentGiven, setConsentGiven] = useState(consentGivenFromStore)
  const [demographics, setDemographics] = useState<Demographics>(demographicsFromStore)

  const isAgeValid = useMemo(
    () => demographics.age !== null && demographics.age >= 18 && demographics.age <= 60,
    [demographics.age],
  )
  const isFormComplete =
    hasReadToBottom &&
    consentGiven &&
    demographics.gender &&
    isAgeValid &&
    demographics.education &&
    demographics.workExperience

  const handleScroll = () => {
    const node = consentScrollRef.current
    if (!node) return
    const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 12
    if (reachedBottom) {
      setHasReadToBottom(true)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormComplete) return

    initializeParticipant()

    const forcedCondition = new URLSearchParams(location.search).get('condition')
    const condition = assignCondition(forcedCondition)

    setCondition(condition)
    setConsentData({
      consentGiven: true,
      demographics,
    })

    await submitData('consent', {
      consentGiven: true,
      demographics,
      forcedCondition,
      assignedCondition: condition,
    })

    setCurrentPage(2)
    navigate('/briefing')
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">研究参与知情同意书</h1>
      <p className="mt-2 text-sm text-slate-600">
        请先阅读并同意以下说明。你可在任意时点退出实验，所有数据仅用于学术研究。
      </p>

      <div className="mt-5 rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">研究参与知情同意书</h2>
        </div>
        <div
          ref={consentScrollRef}
          onScroll={handleScroll}
          className="thin-scrollbar h-44 overflow-y-auto px-4 py-3 text-sm leading-relaxed text-slate-700"
        >
          {consentText.map((paragraph) => (
            <p key={paragraph} className="mb-3">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={consentGiven}
              disabled={!hasReadToBottom}
              onChange={(event) => setConsentGiven(event.target.checked)}
            />
            我同意参与本研究
          </label>
          {!hasReadToBottom && <p className="mt-2 text-xs text-amber-600">请先滚动阅读到知情同意书底部。</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900">基本信息</h2>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">性别</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            {['男', '女', '其他'].map((gender) => (
              <label key={gender} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={demographics.gender === gender}
                  onChange={(event) =>
                    setDemographics((prev) => ({
                      ...prev,
                      gender: event.target.value,
                    }))
                  }
                />
                {gender}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-700">
            年龄（18-60）
            <input
              type="number"
              min={18}
              max={60}
              value={demographics.age ?? ''}
              onChange={(event) =>
                setDemographics((prev) => ({
                  ...prev,
                  age: event.target.value ? Number(event.target.value) : null,
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>

          <label className="text-sm text-slate-700">
            学历
            <select
              value={demographics.education}
              onChange={(event) =>
                setDemographics((prev) => ({
                  ...prev,
                  education: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-400"
            >
              <option value="">请选择</option>
              {educationOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm text-slate-700">
          工作经验
          <select
            value={demographics.workExperience}
            onChange={(event) =>
              setDemographics((prev) => ({
                ...prev,
                workExperience: event.target.value,
              }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-400"
          >
            <option value="">请选择</option>
            {workOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {!isAgeValid && demographics.age !== null && (
          <p className="text-xs text-rose-600">年龄需在18到60岁之间。</p>
        )}

        <button
          type="submit"
          disabled={!isFormComplete}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          开始实验 →
        </button>
      </form>
    </section>
  )
}
