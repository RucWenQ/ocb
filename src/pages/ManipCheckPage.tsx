import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  manipCheckCore,
  manipMeetingTypeQuestion,
} from "../data/scales/manipulationCheck";
import { usePageTimer } from "../hooks/usePageTimer";
import { useExperimentStore } from "../store/experimentStore";
import { RatingButtons } from "../components/LikertScale";

interface ManipCheckState {
  mc_eco_perception: number | null;
  mc_eco_degree: number | null;
  mc_meeting_type: string;
}

const initialState: ManipCheckState = {
  mc_eco_perception: null,
  mc_eco_degree: null,
  mc_meeting_type: "",
};

export default function ManipCheckPage() {
  usePageTimer("manipCheck");

  const navigate = useNavigate();
  const saved = useExperimentStore(
    (state) => state.dvResponses.manipCheck as ManipCheckState | undefined,
  );
  const saveDVResponse = useExperimentStore((state) => state.saveDVResponse);
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage);
  const [values, setValues] = useState<ManipCheckState>(saved ?? initialState);
  const [showError, setShowError] = useState(false);

  const allAnswered = useMemo(() => {
    return (
      manipCheckCore.every((item) => values[item.id] !== null) &&
      Boolean(values.mc_meeting_type)
    );
  }, [values]);

  const handleSubmit = async () => {
    if (!allAnswered) {
      setShowError(true);
      return;
    }

    setShowError(false);
    const payload: Record<string, unknown> = { ...values };
    saveDVResponse("manipCheck", payload);
    setCurrentPage(14);
    navigate("/debrief");
  };

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p>请根据你刚才看到的采购结果，回答以下问题。</p>
      </div>

      <div className="space-y-4">
        {manipCheckCore.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="mb-3 text-sm text-slate-800">{item.text}</p>
            <RatingButtons
              value={values[item.id]}
              onChange={(next) =>
                setValues((prev) => ({ ...prev, [item.id]: next }))
              }
              showAnchors
              anchors={item.anchors}
            />
          </article>
        ))}

        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm text-slate-800">
            {manipMeetingTypeQuestion.text}
          </p>
          <div className="space-y-2">
            {manipMeetingTypeQuestion.options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name={manipMeetingTypeQuestion.id}
                  value={option}
                  checked={values.mc_meeting_type === option}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      mc_meeting_type: event.target.value,
                    }))
                  }
                />
                {option}
              </label>
            ))}
          </div>
        </article>
      </div>

      {showError && (
        <p className="text-sm text-rose-600">请完成所有题目后再进入下一页。</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        下一步
      </button>
    </section>
  );
}
