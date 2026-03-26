import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AVATAR_OPTIONS } from "../components/AvatarGrid";
import ChatBubble from "../components/ChatBubble";
import { receiptDataByCondition } from "../data/receiptData";
import { useDataSubmit } from "../hooks/useDataSubmit";
import { usePageTimer } from "../hooks/usePageTimer";
import { useExperimentStore } from "../store/experimentStore";

interface RenderMessage {
  id: string;
  role: "assistant";
  content: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(date);
}

function createReceiptNo(): string {
  return `ZX-${Math.random().toString().slice(2, 8)}`;
}

export default function ReceiptPage() {
  const navigate = useNavigate();
  const submitData = useDataSubmit();
  const condition = useExperimentStore((state) => state.condition ?? "control");
  const aiConfig = useExperimentStore((state) => state.aiConfig);
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage);
  const setReceiptInfo = useExperimentStore((state) => state.setReceiptInfo);

  const receiptNo = useMemo(() => createReceiptNo(), []);
  const currentDate = useMemo(() => formatDate(new Date()), []);
  const { getDurationSeconds } = usePageTimer("receipt");
  const receiptData = receiptDataByCondition[condition];
  const assistantName = aiConfig.nickname || "AI助理";
  const assistantAvatar =
    AVATAR_OPTIONS.find((item) => item.id === aiConfig.avatarId)?.emoji ?? "🤖";

  const groupedLines = useMemo(() => {
    const grouped = new Map<string, string[]>();
    receiptData.items.forEach((item) => {
      const line = `- ${item.name}（${item.quantity}，¥${item.subtotal.toLocaleString("zh-CN")}）`;
      const existing = grouped.get(item.category) ?? [];
      existing.push(line);
      grouped.set(item.category, existing);
    });
    return Array.from(grouped.entries()).map(([category, lines]) => ({
      category,
      lines,
    }));
  }, [receiptData.items]);

  const assistantMessages = useMemo<RenderMessage[]>(() => {
    const messages: RenderMessage[] = [
      {
        id: "intro",
        role: "assistant",
        content: `我已完成本次采购，明细如下。\n回执编号：${receiptNo}\n采买日期：${currentDate}`,
      },
    ];

    if (condition === "experimental" && receiptData.banner) {
      messages.push({
        id: "banner",
        role: "assistant",
        content: receiptData.banner,
      });
    }

    groupedLines.forEach((group) => {
      messages.push({
        id: group.category,
        role: "assistant",
        content: `${group.category}\n${group.lines.join("\n")}`,
      });
    });

    messages.push({
      id: "summary",
      role: "assistant",
      content: `总计：¥${receiptData.total.toLocaleString("zh-CN")}\n预算剩余：¥${receiptData.remaining.toLocaleString("zh-CN")}`,
    });

    messages.push({
      id: "footnote",
      role: "assistant",
      content: receiptData.footnote,
    });

    return messages;
  }, [
    condition,
    currentDate,
    groupedLines,
    receiptData.banner,
    receiptData.footnote,
    receiptData.remaining,
    receiptData.total,
    receiptNo,
  ]);

  const handleNext = async () => {
    const duration = getDurationSeconds();
    setReceiptInfo(true, duration);

    await submitData("receipt", {
      condition,
      receiptNo,
      duration,
      total: receiptData.total,
      remaining: receiptData.remaining,
    });

    setCurrentPage(6);
    navigate("/measure/ocb-scenarios");
  };

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">采买回执</h1>
      <p className="mt-2 text-sm text-slate-600">
        以下为 {assistantName} 告知的采购结果。
      </p>

      <div className="thin-scrollbar mt-4 max-h-[min(60vh,34rem)] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        {assistantMessages.map((message) => (
          <ChatBubble
            key={message.id}
            role={message.role}
            content={message.content}
            avatar={assistantAvatar}
            assistantName={assistantName}
            asCard
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        下一步
      </button>
    </section>
  );
}
