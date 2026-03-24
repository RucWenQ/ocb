import { useNavigate } from "react-router-dom";
import { meetingBrief, meetingBriefParagraphs } from "../data/meetingBrief";
import { useDataSubmit } from "../hooks/useDataSubmit";
import { usePageTimer } from "../hooks/usePageTimer";
import { useExperimentStore } from "../store/experimentStore";

export default function BriefingPage() {
  usePageTimer("briefing");

  const navigate = useNavigate();
  const submitData = useDataSubmit();
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage);

  const handleNext = async () => {
    await submitData("briefing", { acknowledged: true });
    setCurrentPage(3);
    navigate("/ai-editor");
  };

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h1 className="text-xl font-semibold text-slate-900">实验说明</h1>
        {/* <p className="mt-2 text-xs text-slate-500">日期：{today}</p> */}
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
          {/* <p>在本阶段，你将进入一个模拟任务情境，并使用 AI 助手完成一次物资采买决策。</p> */}
          {/* <p>请根据页面提示进行操作，不需要追求“正确答案”，按真实想法作答即可。</p> */}
          {/* <ol className="list-decimal space-y-1 pl-5">
            <li>阅读任务背景与会议信息。</li>
            <li>设置你的 AI 助手参数。</li>
            <li>与 AI 对话并查看采买结果。</li>
            <li>完成后续问卷测量。</li>
          </ol> */}
          {meetingBriefParagraphs.slice(1).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border-l-4 border-brand-600 bg-brand-50 p-4">
        <h2 className="text-sm font-semibold text-brand-700">采买任务信息</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li>会议时间：{meetingBrief.meetingTime}</li>
          <li>参会人数：{meetingBrief.participants}</li>
          <li>会议室：{meetingBrief.room}</li>
          <li>预算：{meetingBrief.budget}</li>
          <li>需采买物资：{meetingBrief.categories}</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        我已了解上述信息，下一步→
      </button>
    </section>
  );
}
