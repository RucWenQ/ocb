import type { FormEvent } from "react";

interface ChatInputProps {
  value: string;
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function ChatInput({
  value,
  disabled = false,
  loading = false,
  onChange,
  onSend,
}: ChatInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || loading) return;
    onSend();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2"
    >
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={1}
        placeholder={disabled ? "对话已结束" : "输入你的消息..."}
        className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
      />
      <button
        type="submit"
        disabled={disabled || loading || !value.trim()}
        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "发送中..." : "发送"}
      </button>
    </form>
  );
}
