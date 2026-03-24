import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AVATAR_OPTIONS } from '../components/AvatarGrid'
import ChatBubble from '../components/ChatBubble'
import ChatInput from '../components/ChatInput'
import { meetingBrief, meetingPlanMessage } from '../data/meetingBrief'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'

interface RenderMessage {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
  asCard?: boolean
}

const COMPLETE_TEXT = '采买已完成！请点击下方按钮查看详细回执。'

function greetingByStyle(style: 'professional' | 'friendly' | 'concise', nickname: string) {
  if (style === 'friendly') {
    return `你好呀！我是${nickname}，已经准备好帮你一起处理采买任务啦。把会议筹备方案发给我吧～`
  }
  if (style === 'concise') {
    return `你好，我是${nickname}。请发送会议筹备方案，我将立即处理采买。`
  }
  return `你好！我是${nickname}，已经准备就绪。请把会议筹备方案发给我，我来帮你处理采买。`
}

function fallbackReply(userTurns: number): string {
  if (userTurns <= 1) {
    return '已收到会议方案。我会基于参会人数、预算与物资类别进行采买规划。'
  }
  if (userTurns <= 3) {
    return '我正在完成最终核对，确保预算与需求覆盖。稍后将同步回执。'
  }
  return COMPLETE_TEXT
}

export default function ChatPage() {
  usePageTimer('chat')

  const navigate = useNavigate()
  const submitData = useDataSubmit()
  const aiConfig = useExperimentStore((state) => state.aiConfig)
  const chatHistory = useExperimentStore((state) => state.chatHistory)
  const appendChatMessage = useExperimentStore((state) => state.appendChatMessage)
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage)

  const avatarEmoji = useMemo(() => {
    return AVATAR_OPTIONS.find((item) => item.id === aiConfig.avatarId)?.emoji ?? '🤖'
  }, [aiConfig.avatarId])

  const initialMessages: RenderMessage[] =
    chatHistory.length > 0
      ? chatHistory.map((msg, index) => ({
          id: `${msg.timestamp}-${index}`,
          role: msg.role,
          content: msg.content,
        }))
      : [{ id: 'system-start', role: 'system', content: '对话已开始' }]

  const [messages, setMessages] = useState<RenderMessage[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const [typing, setTyping] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [meetingSent, setMeetingSent] = useState(initialMessages.some((item) => item.asCard))
  const [userTurns, setUserTurns] = useState(chatHistory.filter((item) => item.role === 'user').length)
  const [conversationEnded, setConversationEnded] = useState(
    chatHistory.some((item) => item.content.includes('采买已完成')),
  )
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (chatHistory.length > 0) return
    const timer = window.setTimeout(() => {
      const welcome = greetingByStyle(aiConfig.personality, aiConfig.nickname || '你的AI助理')
      const assistantMessage: RenderMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: welcome,
      }
      setMessages((prev) => [...prev, assistantMessage])
      appendChatMessage({
        role: 'assistant',
        content: welcome,
        timestamp: new Date().toISOString(),
      })
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [aiConfig.nickname, aiConfig.personality, appendChatMessage, chatHistory.length])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const askAssistant = async (nextUserTurns: number, userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: {
            role: '企业AI办公助理',
            nickname: aiConfig.nickname || '助理',
            style: aiConfig.personality,
            instruction:
              '在2-3轮内收束对话，不透露具体采购物品。最终提醒用户查看回执。语气保持专业。',
          },
          messages: messages
            .filter((msg) => msg.role !== 'system')
            .map((msg) => ({ role: msg.role, content: msg.content })),
          userMessage,
          userTurns: nextUserTurns,
        }),
      })

      if (!response.ok) throw new Error('api failed')
      const data = (await response.json()) as { reply?: string }
      if (typeof data.reply === 'string' && data.reply.trim()) return data.reply.trim()
    } catch {
      return fallbackReply(nextUserTurns)
    }

    return fallbackReply(nextUserTurns)
  }

  const sendUserMessage = async (message: string, asCard = false) => {
    const text = message.trim()
    if (!text || typing || conversationEnded) return
    if (userTurns >= 4) {
      setConversationEnded(true)
      return
    }

    const nextUserTurns = userTurns + 1
    setUserTurns(nextUserTurns)

    const userEntry: RenderMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      asCard,
    }
    setMessages((prev) => [...prev, userEntry])
    appendChatMessage({
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    })

    setTyping(true)
    const reply = await askAssistant(nextUserTurns, text)
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    setTyping(false)

    const assistantEntry: RenderMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: reply,
    }
    setMessages((prev) => [...prev, assistantEntry])
    appendChatMessage({
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    })

    const containsComplete = reply.includes('采买已完成')
    if (containsComplete || nextUserTurns >= 4) {
      if (!containsComplete) {
        const finalEntry: RenderMessage = {
          id: `assistant-final-${Date.now()}`,
          role: 'assistant',
          content: COMPLETE_TEXT,
        }
        setMessages((prev) => [...prev, finalEntry])
        appendChatMessage({
          role: 'assistant',
          content: COMPLETE_TEXT,
          timestamp: new Date().toISOString(),
        })
      }
      setConversationEnded(true)
    }
  }

  const handleSend = async () => {
    const text = inputText
    setInputText('')
    await sendUserMessage(text)
  }

  const handleSendPlan = async () => {
    setMeetingSent(true)
    await sendUserMessage(meetingPlanMessage, true)
  }

  const handleToReceipt = async () => {
    await submitData('chat', { userTurns, ended: conversationEnded, chatHistory })
    setCurrentPage(5)
    navigate('/receipt')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-xl">{avatarEmoji}</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{aiConfig.nickname || 'AI助理'}</p>
            <p className="text-xs text-emerald-600">● 在线</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen((prev) => !prev)}
          className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          会议信息
        </button>
      </div>

      <div ref={listRef} className="thin-scrollbar h-[55vh] space-y-3 overflow-y-auto bg-slate-50 px-3 py-4 sm:px-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            role={message.role}
            content={message.content}
            avatar={avatarEmoji}
            asCard={message.asCard}
          />
        ))}

        {typing && (
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm">{avatarEmoji}</div>
            <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-sm">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-slate-200 p-3 sm:p-4">
        {!meetingSent && (
          <button
            type="button"
            onClick={handleSendPlan}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700 transition hover:bg-brand-100"
          >
            📋 发送会议筹备方案
          </button>
        )}

        <ChatInput
          value={inputText}
          disabled={conversationEnded}
          loading={typing}
          onChange={setInputText}
          onSend={handleSend}
        />

        {conversationEnded && (
          <button
            type="button"
            onClick={handleToReceipt}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            📄 查看采买回执 →
          </button>
        )}
      </div>

      {drawerOpen && (
        <aside className="fixed inset-y-0 right-0 z-40 w-80 border-l border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">会议信息</h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
            >
              关闭
            </button>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>会议时间：{meetingBrief.meetingTime}</p>
            <p>参会人数：{meetingBrief.participants}</p>
            <p>会议室：{meetingBrief.room}</p>
            <p>预算：{meetingBrief.budget}</p>
            <p>需采买物资：{meetingBrief.categories}</p>
          </div>
        </aside>
      )}
    </section>
  )
}
