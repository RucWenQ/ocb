export interface AvatarOption {
  id: string;
  emoji: string;
  tone: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "a1", emoji: "\u{1F916}", tone: "bg-blue-100" },
  { id: "a2", emoji: "\u{1F468}\u200D\u{1F4BB}", tone: "bg-cyan-100" },
  { id: "a3", emoji: "\u{1F469}\u200D\u{1F4BC}", tone: "bg-amber-100" },
  { id: "a4", emoji: "\u{1F9D1}\u200D\u{1F4BB}", tone: "bg-indigo-100" },
  { id: "a5", emoji: "\u{1F4A1}", tone: "bg-yellow-100" },
  { id: "a6", emoji: "\u{1F47E}", tone: "bg-emerald-100" },
  { id: "a7", emoji: "\u{1F680}", tone: "bg-rose-100" },
  { id: "a8", emoji: "\u{1F9E0}", tone: "bg-orange-100" },
  { id: "a9", emoji: "\u{1F31F}", tone: "bg-sky-100" },
];
