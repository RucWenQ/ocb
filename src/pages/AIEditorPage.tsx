import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AvatarGrid, { AVATAR_OPTIONS } from '../components/AvatarGrid'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import type { Personality } from '../types/experiment'

const personalityOptions: Array<{ id: Personality; title: string; desc: string; icon: string }> = [
  { id: 'professional', title: '专业严谨', desc: '注重准确性，用语正式规范', icon: '🎯' },
  { id: 'friendly', title: '亲切随和', desc: '语气温暖友好，像朋友一样交流', icon: '😊' },
  { id: 'concise', title: '简洁高效', desc: '言简意赅，直击重点', icon: '⚡' },
]

export default function AIEditorPage() {
  usePageTimer('ai-editor')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const aiConfig = useExperimentStore((state) => state.aiConfig)
  const updateAIConfig = useExperimentStore((state) => state.updateAIConfig)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)

  const [nickname, setNickname] = useState(aiConfig.nickname)
  const [avatarId, setAvatarId] = useState(aiConfig.avatarId)
  const [personality, setPersonality] = useState<Personality>(aiConfig.personality)
  const [creativity, setCreativity] = useState(aiConfig.creativity)
  const [detailLevel, setDetailLevel] = useState(aiConfig.detailLevel)
  const [customPrompt, setCustomPrompt] = useState(aiConfig.customPrompt)

  const selectedAvatar = useMemo(
    () => AVATAR_OPTIONS.find((item) => item.id === avatarId) ?? AVATAR_OPTIONS[0],
    [avatarId],
  )
  const nicknameValid = nickname.trim().length >= 2 && nickname.trim().length <= 10
  const canSubmit = Boolean(avatarId) && nicknameValid

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    const payload = {
      nickname: nickname.trim(),
      avatarId,
      personality,
      creativity,
      detailLevel,
      customPrompt,
    }

    updateAIConfig(payload)
    await submitData('ai-editor', payload)

    setCurrentPage(4)
    navigate('/chat')
  }

  return (
    <section className="grid gap-5 lg:grid-cols-5">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
        <h1 className="text-2xl font-semibold text-slate-900">创建你的AI助理</h1>
        <p className="mt-2 text-sm text-slate-600">
          请设置你的AI助理。你可以自定义它的名称、头像和工作风格，设置完成后将用它来协助完成采购任务。
        </p>

        <div className="mt-5 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">1. 头像选择</h2>
            <div className="mt-2">
              <AvatarGrid selectedId={avatarId} onSelect={setAvatarId} />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">2. 昵称</h2>
            <input
              type="text"
              maxLength={10}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="给你的AI助理起个名字"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <p className="mt-1 text-xs text-slate-500">例如：小智、阿布、工作搭子（2-10个字符）</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">3. 沟通风格</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {personalityOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPersonality(item.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    personality === item.id
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 bg-white hover:border-brand-300'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800">
                    {item.icon} {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-700">
              创造性：{creativity}
              <input
                type="range"
                min={0}
                max={100}
                value={creativity}
                onChange={(event) => setCreativity(Number(event.target.value))}
                className="mt-2 w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>保守</span>
                <span>大胆</span>
              </div>
            </label>

            <label className="text-sm text-slate-700">
              回复详细度：{detailLevel}
              <input
                type="range"
                min={0}
                max={100}
                value={detailLevel}
                onChange={(event) => setDetailLevel(Number(event.target.value))}
                className="mt-2 w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>精简</span>
                <span>详尽</span>
              </div>
            </label>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">5. 自定义提示词（可选）</h2>
            <textarea
              value={customPrompt}
              rows={4}
              onChange={(event) => setCustomPrompt(event.target.value)}
              placeholder="可选：在这里写下你对AI助理的特别要求或注意事项..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <p className="mt-1 text-xs text-slate-500">例如：请注意预算控制，优先选择性价比高的商品。</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          设置完成，开始对话 →
        </button>
      </form>

      <aside className="lg:col-span-2">
        <div className="top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:animate-pulse-shadow">
          <h2 className="text-sm font-semibold text-slate-800">实时预览</h2>
          <div className="mt-4 text-center">
            <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full text-5xl ${selectedAvatar.tone}`}>
              {selectedAvatar.emoji}
            </div>
            <p className="mt-3 text-xl font-semibold text-slate-900">{nickname.trim() || '你的AI助理'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {personalityOptions.find((item) => item.id === personality)?.title}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>创造性</span>
                <span>{creativity}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${creativity}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>回复详细度</span>
                <span>{detailLevel}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${detailLevel}%` }} />
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">你的AI助理已就绪</p>
        </div>
      </aside>
    </section>
  )
}
