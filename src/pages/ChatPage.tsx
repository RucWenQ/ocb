import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { AVATAR_OPTIONS } from "../data/avatarOptions";
import { departmentNeeds, purchaseBrief } from "../data/purchaseBrief";
import { useDataSubmit } from "../hooks/useDataSubmit";
import { usePageTimer } from "../hooks/usePageTimer";
import { useExperimentStore } from "../store/experimentStore";
import { buildSystemPrompt } from "../services/chatPrompts";
import { streamQwenChat, type QwenMessage } from "../services/qwenApi";

interface RenderMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  asCard?: boolean;
}

interface RequirementCard {
  id: string;
  title: string;
  lines: string[];
  sendText: string;
}

function fallbackReply(
  userTurns: number,
  condition: "experimental" | "control",
): string {
  if (userTurns <= 1) {
    return "收到，我已记录你的需求，正在整理各部门与会议采购内容。";
  }
  if (userTurns === 2) {
    return condition === "experimental"
      ? "我正在比价与筛选，已优先选择更合适的替代方案。"
      : "我正在比价与筛选，优先保证质量和性价比。";
  }
  return "采购方案已整理完成，你可以继续补充需求，或直接进入下一步查看回执。";
}

function temperatureFromCreativity(creativity: number): number {
  return Number((0.2 + (creativity / 100) * 0.8).toFixed(2));
}

function maxTokensFromDetail(detailLevel: number): number {
  return 220 + Math.round(detailLevel * 4);
}

export default function ChatPage() {
  usePageTimer("chat");

  const navigate = useNavigate();
  const submitData = useDataSubmit();
  const aiConfig = useExperimentStore((state) => state.aiConfig);
  const condition = useExperimentStore((state) => state.condition ?? "control");
  const chatHistory = useExperimentStore((state) => state.chatHistory);
  const appendChatMessage = useExperimentStore((state) => state.appendChatMessage);
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage);

  const assistantName = aiConfig.nickname || "AI助理";
  const avatarEmoji =
    AVATAR_OPTIONS.find((item) => item.id === aiConfig.avatarId)?.emoji ?? "🤖";

  const requirementCards = useMemo<RequirementCard[]>(() => {
    const budgetCard: RequirementCard = {
      id: "budget",
      title: "整体预算",
      lines: [`本月行政部剩余预算：¥${purchaseBrief.budget.toLocaleString("zh-CN")}`],
      sendText: `整体预算要求：本月行政部剩余预算为 ¥${purchaseBrief.budget.toLocaleString("zh-CN")}，请在预算内完成全部采购。`,
    };

    const departmentCards = departmentNeeds.map((dept) => ({
      id: dept.id,
      title: `${dept.name}（${dept.headcount}人）`,
      lines: dept.items,
      sendText: `${dept.name}需求（${dept.headcount}人）：\n${dept.items
        .map((item) => `- ${item}`)
        .join("\n")}`,
    }));

    const meetingCard: RequirementCard = {
      id: "meeting",
      title: "月度例会需求",
      lines: [
        `会议时间：${purchaseBrief.meetingTime}`,
        `参会人数：${purchaseBrief.participants}`,
        `会议地点：${purchaseBrief.room}`,
        `需准备：${purchaseBrief.meetingNeeds.join("、")}`,
      ],
      sendText: `月度例会信息：\n- 会议时间：${purchaseBrief.meetingTime}\n- 参会人数：${purchaseBrief.participants}\n- 会议地点：${purchaseBrief.room}\n- 需准备：${purchaseBrief.meetingNeeds.join("、")}`,
    };

    return [budgetCard, ...departmentCards, meetingCard];
  }, []);

  const initialMessages: RenderMessage[] =
    chatHistory.length > 0
      ? chatHistory.map((msg, index) => ({
          id: `${msg.timestamp}-${index}`,
          role: msg.role,
          content: msg.content,
        }))
      : [{ id: "system-start", role: "system", content: "对话已开始" }];

  const [messages, setMessages] = useState<RenderMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);
  const [sentCardIds, setSentCardIds] = useState<string[]>(() => {
    const userMessages = chatHistory
      .filter((item) => item.role === "user")
      .map((item) => item.content.trim());
    return requirementCards
      .filter((card) => userMessages.includes(card.sendText.trim()))
      .map((card) => card.id);
  });
  const listRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(0);

  const nextMessageId = (prefix: string) => {
    messageIdRef.current += 1;
    return `${prefix}-${messageIdRef.current}`;
  };

  const userTurns = useMemo(
    () => messages.filter((item) => item.role === "user").length,
    [messages],
  );

  const allRequirementsSent = useMemo(
    () => requirementCards.every((card) => sentCardIds.includes(card.id)),
    [requirementCards, sentCardIds],
  );

  useEffect(() => {
    if (chatHistory.length > 0) return;
    const timer = window.setTimeout(() => {
      const welcome = `你好，我是${assistantName}，是你的AI助理，你可以将工作内容发送给我，交由我来处理。`;
      const assistantMessage: RenderMessage = {
        id: nextMessageId("assistant"),
        role: "assistant",
        content: welcome,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      appendChatMessage({
        role: "assistant",
        content: welcome,
        timestamp: new Date().toISOString(),
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [assistantName, appendChatMessage, chatHistory.length]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const askAssistant = async (
    nextUserTurns: number,
    conversationMessages: QwenMessage[],
    onDelta: (delta: string) => void,
  ): Promise<string> => {
    const systemPrompt = buildSystemPrompt({
      nickname: aiConfig.nickname || "AI助理",
      personality: aiConfig.personality,
      condition,
      customPrompt: aiConfig.customPrompt,
    });

    const qwenMessages: QwenMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversationMessages,
    ];

    try {
      const text = await streamQwenChat(qwenMessages, {
        model: (import.meta.env.VITE_QWEN_MODEL as string | undefined) ?? "qwen-plus",
        temperature: temperatureFromCreativity(aiConfig.creativity),
        maxTokens: maxTokensFromDetail(aiConfig.detailLevel),
        onDelta,
      });
      if (text) return text;
    } catch {
      return fallbackReply(nextUserTurns, condition);
    }

    return fallbackReply(nextUserTurns, condition);
  };

  const sendUserMessage = async (message: string, asCard = false) => {
    const text = message.trim();
    if (!text || typing) return;

    const matchedCard = requirementCards.find(
      (card) => card.sendText.trim() === text,
    );
    if (matchedCard) {
      setSentCardIds((prev) =>
        prev.includes(matchedCard.id) ? prev : [...prev, matchedCard.id],
      );
    }

    const nextUserTurns = userTurns + 1;
    const userEntry: RenderMessage = {
      id: nextMessageId("user"),
      role: "user",
      content: text,
      asCard,
    };

    setMessages((prev) => [...prev, userEntry]);
    appendChatMessage({
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    });

    const conversationForApi: QwenMessage[] = [
      ...messages
        .filter((msg) => msg.role === "assistant" || msg.role === "user")
        .map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: text },
    ];

    const assistantTempId = nextMessageId("assistant-temp");
    setMessages((prev) => [
      ...prev,
      { id: assistantTempId, role: "assistant", content: "" },
    ]);

    setTyping(true);
    let streamed = "";

    const reply = await askAssistant(nextUserTurns, conversationForApi, (delta) => {
      streamed += delta;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantTempId ? { ...msg, content: streamed } : msg,
        ),
      );
    });

    setTyping(false);

    const normalizedReply = (
      reply ||
      streamed ||
      fallbackReply(nextUserTurns, condition)
    ).trim();

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantTempId ? { ...msg, content: normalizedReply } : msg,
      ),
    );

    appendChatMessage({
      role: "assistant",
      content: normalizedReply,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSend = async () => {
    const text = inputText;
    setInputText("");
    await sendUserMessage(text);
  };

  const handleSendCard = async (card: RequirementCard) => {
    if (typing || sentCardIds.includes(card.id)) return;
    setSentCardIds((prev) => [...prev, card.id]);
    await sendUserMessage(card.sendText, true);
  };

  const handleToReceipt = async () => {
    await submitData("chat", {
      userTurns,
      endedByUser: true,
      messages: messages.filter((msg) => msg.role !== "system"),
    });

    setCurrentPage(5);
    navigate("/receipt");
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-xl">
              {avatarEmoji}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{assistantName}</p>
              <p className="text-xs text-emerald-600">● 在线</p>
            </div>
          </div>
        </div>

        <div
          ref={listRef}
          className="thin-scrollbar h-[55vh] space-y-3 overflow-y-auto bg-slate-50 px-3 py-4 sm:px-4"
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              role={message.role}
              content={message.content}
              avatar={avatarEmoji}
              assistantName={assistantName}
              asCard={message.asCard}
            />
          ))}

          {typing && (
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm">
                {avatarEmoji}
              </div>
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
          <ChatInput
            value={inputText}
            loading={typing}
            onChange={setInputText}
            onSend={handleSend}
          />

          {allRequirementsSent && (
            <button
              type="button"
              onClick={handleToReceipt}
              disabled={typing || userTurns === 0}
              className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              下一步 →
            </button>
          )}
        </div>
      </div>

      <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          你可以按任意顺序将右侧采购信息发送到对话中。
        </div>

        <div className="thin-scrollbar max-h-[68vh] space-y-3 overflow-y-auto pr-1">
          {requirementCards.map((card) => (
            <article
              key={card.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <h2 className="text-sm font-semibold text-slate-900">{card.title}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-700">
                {card.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSendCard(card)}
                disabled={typing || sentCardIds.includes(card.id)}
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {sentCardIds.includes(card.id) ? "已发送" : "发送到对话"}
              </button>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}
