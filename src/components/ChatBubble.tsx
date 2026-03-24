interface ChatBubbleProps {
  role: 'system' | 'user' | 'assistant'
  content: string
  avatar?: string
  asCard?: boolean
}

export default function ChatBubble({ role, content, avatar = '🤖', asCard = false }: ChatBubbleProps) {
  if (role === 'system') {
    return <p className="text-center text-xs text-slate-500">{content}</p>
  }

  const assistant = role === 'assistant'

  return (
    <div className={`flex items-end gap-2 ${assistant ? 'justify-start' : 'justify-end'}`}>
      {assistant && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-sm">{avatar}</div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm leading-relaxed sm:max-w-[70%] ${
          asCard
            ? 'border border-brand-200 bg-brand-50 text-slate-800'
            : assistant
              ? 'rounded-bl-md bg-white text-slate-800 shadow-sm'
              : 'rounded-br-md bg-brand-600 text-white'
        }`}
      >
        {content.split('\n').map((line, idx) => (
          <p key={`${line}-${idx}`} className={idx === 0 ? '' : 'mt-1'}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
