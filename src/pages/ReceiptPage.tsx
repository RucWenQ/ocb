import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AVATAR_OPTIONS } from "../data/avatarOptions";
import { receiptDataByCondition } from "../data/receiptData";
import { useDataSubmit } from "../hooks/useDataSubmit";
import { usePageTimer } from "../hooks/usePageTimer";
import { useExperimentStore } from "../store/experimentStore";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeReceiptText(value: unknown): string {
  if (typeof value !== "string") return "-";
  return value
    .replace(/[()（）]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

  const [receiptNo] = useState(createReceiptNo);
  const [currentDate] = useState(() => formatDate(new Date()));
  const { getDurationSeconds } = usePageTimer("receipt");

  const receiptData =
    receiptDataByCondition[condition] ??
    receiptDataByCondition.control ??
    Object.values(receiptDataByCondition)[0];

  const assistantName = aiConfig.nickname || "AI助理";
  const assistantAvatar =
    AVATAR_OPTIONS.find((item) => item.id === aiConfig.avatarId)?.emoji ?? "🤖";

  const safeItems = Array.isArray(receiptData?.items) ? receiptData.items : [];

  const grouped = new Map<
    string,
    Array<{ name: string; spec: string; quantity: string; subtotal: number }>
  >();

  safeItems.forEach((item) => {
    const name = normalizeReceiptText(item?.name ?? "未命名物品");
    const spec = normalizeReceiptText(item?.spec ?? "-");
    const quantity = normalizeReceiptText(item?.quantity ?? "-");
    const subtotal = toNumber(item?.subtotal);
    const category = item?.category ?? "其他";
    const existing = grouped.get(category) ?? [];
    existing.push({ name, spec, quantity, subtotal });
    grouped.set(category, existing);
  });

  const groupedSections = Array.from(grouped.entries()).map(
    ([category, items]) => ({
      category,
      items,
    }),
  );

  const listedTotal = toNumber(receiptData?.total, Number.NaN);
  const totalAmount = Number.isFinite(listedTotal)
    ? listedTotal
    : safeItems.reduce((sum, item) => sum + toNumber(item?.subtotal), 0);

  const listedRemaining = toNumber(receiptData?.remaining, Number.NaN);
  const remainingAmount = Number.isFinite(listedRemaining)
    ? listedRemaining
    : Math.max(0, toNumber(receiptData?.budget, 0) - totalAmount);

  const footnote =
    receiptData?.footnote ?? "AI助理已根据各部门需求和会议安排完成物资采购。";

  const handleNext = async () => {
    const duration = getDurationSeconds();
    setReceiptInfo(true, duration);

    await submitData("receipt", {
      condition,
      receiptNo,
      duration,
      total: totalAmount,
      remaining: remainingAmount,
    });

    setCurrentPage(6);
    navigate("/measure/filler-scale");
  };

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-900">采购回执</h1>
      <p className="mt-2 text-sm text-slate-600">
        以下是 {assistantName} 的采购结果。
      </p>

      <div className="thin-scrollbar mt-4 max-h-[min(68vh,42rem)] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-end gap-2">
          <div className="w-12 shrink-0 text-center">
            <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm">
              {assistantAvatar}
            </div>
            <p className="mt-1 truncate text-[10px] leading-tight text-slate-500">
              {assistantName}
            </p>
          </div>

          <div className="max-w-[82%] rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-slate-800 sm:max-w-[70%]">
            <div className="rounded-xl border border-slate-300 bg-white p-4">
              <h2 className="text-center text-base font-semibold text-slate-900">
                采购回执单
              </h2>
              <div className="mt-3 grid gap-2 border-y border-slate-200 py-3 text-xs text-slate-700 sm:grid-cols-2">
                <p>回执编号：{receiptNo}</p>
                <p>采购日期：{currentDate}</p>
                <p>采购人：{assistantName}</p>
                <p>采购单位：行政部</p>
              </div>

              {condition === "experimental" && receiptData?.banner && (
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {receiptData.banner}
                </p>
              )}

              <div className="mt-3 space-y-3">
                {groupedSections.map((section) => (
                  <div
                    key={section.category}
                    className="overflow-hidden rounded-lg border border-slate-200"
                  >
                    <div className="bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {section.category}
                    </div>
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-3 py-1.5 text-left font-medium">
                            物资
                          </th>
                          <th className="px-3 py-1.5 text-left font-medium">
                            规格说明
                          </th>
                          <th className="px-3 py-1.5 text-center font-medium">
                            数量
                          </th>
                          <th className="px-3 py-1.5 text-right font-medium">
                            小计
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item) => (
                          <tr
                            key={`${section.category}-${item.name}-${item.spec}`}
                          >
                            <td className="border-t border-slate-100 px-3 py-1.5 text-slate-700">
                              {item.name}
                            </td>
                            <td className="border-t border-slate-100 px-3 py-1.5 text-slate-600">
                              {item.spec}
                            </td>
                            <td className="border-t border-slate-100 px-3 py-1.5 text-center text-slate-700">
                              {item.quantity}
                            </td>
                            <td className="border-t border-slate-100 px-3 py-1.5 text-right text-slate-800">
                              ¥{item.subtotal.toLocaleString("zh-CN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="flex items-center justify-between font-semibold text-slate-900">
                  <span>总计</span>
                  <span>¥{totalAmount.toLocaleString("zh-CN")}</span>
                </p>
                <p className="mt-1 flex items-center justify-between text-slate-700">
                  <span>预算剩余</span>
                  <span>¥{remainingAmount.toLocaleString("zh-CN")}</span>
                </p>
              </div>

              <p className="mt-3 text-xs leading-6 text-slate-600">
                {footnote}
              </p>
            </div>
          </div>
        </div>
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
