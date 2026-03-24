import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AVATAR_OPTIONS } from '../components/AvatarGrid'
import ChatBubble from '../components/ChatBubble'
import ChatInput from '../components/ChatInput'
import { departmentNeeds, purchaseBrief, purchaseSummaryCardMessage } from '../data/purchaseBrief'
import { useDataSubmit } from '../hooks/useDataSubmit'
import { usePageTimer } from '../hooks/usePageTimer'
import { useExperimentStore } from '../store/experimentStore'
import { streamQwenChat, type QwenMessage } from '../services/qwenApi'

interface RenderMessage {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
  asCard?: boolean
}

const COMPLETE_TEXT = '采买已完成！请点击下方按钮查看详细回执。'
const PRESET_FINAL_TEXT = '采购方案已经准备好了，请点击下方按钮查看详细回执~'

function greetingByStyle(style: 'professional' | 'friendly' | 'concise', nickname: string) {
  if (style === 'friendly') {
    return `你好呀！我是${nickname}，已准备好协助你处理月末采购任务。请发送采购需求汇总给我～`
  }
  if (style === 'concise') {
    return `你好，我是${nickname}。请发送采购需求汇总，我将立即处理。`
  }
  return `你好！我是${nickname}，已经准备就绪。请把采购需求汇总发给我，我来帮你处理。`
}

function fallbackReply(userTurns: number): string {
  if (userTurns <= 1) {
    return '我已收到全部采购需求，会先按部门与会议物资分类整理，再在预算内分配采购优先级。'
  }
  if (userTurns <= 3) {
    return '我正在完成比价与预算核对，确保各项需求都被覆盖。'
  }
  return PRESET_FINAL_TEXT
}

function styleDescription(style: 'professional' | 'friendly' | 'concise'): string {
  if (style === 'friendly') return '亲切随和'
  if (style === 'concise') return '简洁高效'
  return '专业严谨'
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
  const [summarySent, setSummarySent] = useState(initialMessages.some((item) => item.content.includes('月末综合采购需求')))
  const [userTurns, setUserTurns] = useState(chatHistory.filter((item) => item.role === 'user').length)
  const [conversationEnded, setConversationEnded] = useState(
    chatHistory.some((item) => item.content.includes('查看详细回执')),
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

  const askAssistant = async (
    nextUserTurns: number,
    userMessage: string,
    onDelta: (delta: string) => void,
  ): Promise<string> => {
    const systemPrompt = `你是一个企业AI办公助理，名叫"${aiConfig.nickname || '助理'}"。你的沟通风格是${styleDescription(
      aiConfig.personality,
    )}。

你目前正在帮助用户（智行科技的行政专员）完成月末综合物资采购任务。任务包括：
1. 处理来自产品研发部、市场营销部、财务部、人力资源部的办公耗材补充需求
2. 采购下周五月度例会（约35人）的会议物资
3. 总预算为2500元

你的工作流程：
- 第一轮：收到用户发送的需求汇总后，确认你已收到并理解所有需求，简要说明采购思路，并询问是否有特别偏好
- 第二轮：根据用户反馈，表示你已经开始整理采购清单并进行比价
- 第三轮：告知用户采购方案已生成，请用户查看回执

重要规则：
- 不要在对话中提及具体购买品牌或产品，不要提及环保、绿色、可持续等词汇
- 在2-3轮交互内自然收束，引导用户查看回执
- 保持${styleDescription(aiConfig.personality)}风格
- 每次回复不超过150字
- 不要主动询问超过1个问题`

    const conversationMessages: QwenMessage[] = messages
      .filter((msg) => msg.role === 'assistant' || msg.role === 'user')
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

    const qwenMessages: QwenMessage[] = [{ role: 'system', content: systemPrompt }, ...conversationMessages]
    if (nextUserTurns === 3) {
      qwenMessages.push({
        role: 'system',
        content: '请在本轮回复中自然地结束对话，告知用户采购方案已生成，请查看回执。',
      })
    }
    qwenMessages.push({ role: 'user', content: userMessage })

    try {
      const text = await streamQwenChat(qwenMessages, {
        model: 'qwen-plus',
        temperature: 0.7,
        maxTokens: 500,
        onDelta,
      })
      if (text) return text
    } catch {
      return fallbackReply(nextUserTurns)
    }

    return fallbackReply(nextUserTurns)
  }

  const sendUserMessage = async (message: string, asCard = false) => {
    const text = message.trim()
    if (!text || typing || conversationEnded) return
    const nextUserTurns = userTurns + 1
    if (nextUserTurns > 4) return

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

    setUserTurns(nextUserTurns)

    if (nextUserTurns === 4) {
      const forcedEntry: RenderMessage = {
        id: `assistant-force-${Date.now()}`,
        role: 'assistant',
        content: PRESET_FINAL_TEXT,
      }
      setMessages((prev) => [...prev, forcedEntry])
      appendChatMessage({
        role: 'assistant',
        content: PRESET_FINAL_TEXT,
        timestamp: new Date().toISOString(),
      })
      setConversationEnded(true)
      return
    }

    const assistantTempId = `assistant-temp-${Date.now()}`
    setMessages((prev) => [...prev, { id: assistantTempId, role: 'assistant', content: '' }])

    setTyping(true)
    let streamed = ''
    const reply = await askAssistant(nextUserTurns, text, (delta) => {
      streamed += delta
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantTempId
            ? {
                ...msg,
                content: streamed,
              }
            : msg,
        ),
      )
    })
    setTyping(false)

    const normalizedReply = (reply || streamed || fallbackReply(nextUserTurns)).trim()
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantTempId
          ? {
              ...msg,
              content: normalizedReply,
            }
          : msg,
      ),
    )
    appendChatMessage({
      role: 'assistant',
      content: normalizedReply,
      timestamp: new Date().toISOString(),
    })

    const shouldEnd =
      nextUserTurns >= 3 ||
      normalizedReply.includes('查看回执') ||
      normalizedReply.includes('采购方案已生成') ||
      normalizedReply.includes('查看详细回执')
    if (shouldEnd) {
      if (!normalizedReply.includes('回执')) {
        const finalEntry: RenderMessage = { id: `assistant-final-${Date.now()}`, role: 'assistant', content: COMPLETE_TEXT }
        setMessages((prev) => [...prev, finalEntry])
        appendChatMessage({ role: 'assistant', content: COMPLETE_TEXT, timestamp: new Date().toISOString() })
      }
      setConversationEnded(true)
    }
  }

  const handleSend = async () => {
    const text = inputText
    setInputText('')
    await sendUserMessage(text)
  }

  const handleSendSummary = async () => {
    setSummarySent(true)
    await sendUserMessage(purchaseSummaryCardMessage, true)
  }

  const handleToReceipt = async () => {
    await submitData('chat', {
      userTurns,
      ended: conversationEnded,
      messages: messages.filter((msg) => msg.role !== 'system'),
    })
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
          查看采购需求
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
        {!summarySent && (
          <button
            type="button"
            onClick={handleSendSummary}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-700 transition hover:bg-brand-100"
          >
            📋 发送采购需求汇总
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
            <h2 className="text-base font-semibold text-slate-900">采购需求</h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
            >
              关闭
            </button>
          </div>
          <div className="thin-scrollbar mt-4 max-h-[calc(100vh-6rem)] space-y-3 overflow-y-auto text-sm text-slate-700">
            {departmentNeeds.map((dept) => (
              <div key={dept.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-800">
                  {dept.name}（{dept.headcount}人）
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {dept.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p>会议时间：{purchaseBrief.meetingTime}</p>
              <p>参会人数：{purchaseBrief.participants}</p>
              <p>会议地点：{purchaseBrief.room}</p>
              <p>会议需求：{purchaseBrief.meetingNeeds.join('、')}</p>
              <p className="mt-1 font-medium text-slate-900">预算：¥{purchaseBrief.budget}</p>
            </div>
          </div>
        </aside>
      )}
    </section>
  )
}
