import { AVATAR_OPTIONS } from "../data/avatarOptions";

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
