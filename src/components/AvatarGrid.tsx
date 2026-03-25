export interface AvatarOption {
  id: string;
  emoji: string;
  tone: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "a1", emoji: "🤖", tone: "bg-blue-100" },
  { id: "a2", emoji: "🧠", tone: "bg-cyan-100" },
  { id: "a3", emoji: "💡", tone: "bg-amber-100" },
  { id: "a4", emoji: "🔮", tone: "bg-indigo-100" },
  { id: "a5", emoji: "⚡", tone: "bg-yellow-100" },
  { id: "a6", emoji: "🌟", tone: "bg-emerald-100" },
  { id: "a7", emoji: "🎯", tone: "bg-rose-100" },
  { id: "a8", emoji: "🔧", tone: "bg-orange-100" },
  { id: "a9", emoji: "📊", tone: "bg-sky-100" },
];

interface AvatarGridProps {
  selectedId: string;
  onSelect: (avatarId: string) => void;
}

export default function AvatarGrid({ selectedId, onSelect }: AvatarGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AVATAR_OPTIONS.map((avatar) => {
        const selected = avatar.id === selectedId;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`rounded-xl border p-3 transition ${
              selected
                ? "border-brand-600 bg-brand-50 shadow-soft"
                : "border-slate-200 bg-white hover:border-brand-300"
            }`}
          >
            <div
              className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-2xl ${avatar.tone}`}
            >
              {avatar.emoji}
            </div>
          </button>
        );
      })}
    </div>
  );
}
