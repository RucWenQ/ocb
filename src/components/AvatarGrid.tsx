export interface AvatarOption {
  id: string
  emoji: string
  name: string
  tone: string
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'a1', emoji: '🤖', name: '标准助手', tone: 'bg-blue-100' },
  { id: 'a2', emoji: '🧠', name: '智识助手', tone: 'bg-cyan-100' },
  { id: 'a3', emoji: '💡', name: '创意助手', tone: 'bg-amber-100' },
  { id: 'a4', emoji: '🔮', name: '策略助手', tone: 'bg-indigo-100' },
  { id: 'a5', emoji: '⚡', name: '效率助手', tone: 'bg-yellow-100' },
  { id: 'a6', emoji: '🌟', name: '服务助手', tone: 'bg-emerald-100' },
  { id: 'a7', emoji: '🎯', name: '执行助手', tone: 'bg-rose-100' },
  { id: 'a8', emoji: '🔧', name: '运维助手', tone: 'bg-orange-100' },
  { id: 'a9', emoji: '📊', name: '分析助手', tone: 'bg-sky-100' },
]

interface AvatarGridProps {
  selectedId: string
  onSelect: (avatarId: string) => void
}

export default function AvatarGrid({ selectedId, onSelect }: AvatarGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AVATAR_OPTIONS.map((avatar) => {
        const selected = avatar.id === selectedId
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`rounded-xl border p-3 transition ${
              selected
                ? 'border-brand-600 bg-brand-50 shadow-soft'
                : 'border-slate-200 bg-white hover:border-brand-300'
            }`}
          >
            <div className={`mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full text-2xl ${avatar.tone}`}>
              {avatar.emoji}
            </div>
            <p className="text-xs text-slate-600">{avatar.name}</p>
          </button>
        )
      })}
    </div>
  )
}
