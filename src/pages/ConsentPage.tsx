import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePageTimer } from "../hooks/usePageTimer";
import { useExperimentStore } from "../store/experimentStore";
import { assignCondition } from "../utils/randomize";
import type { Demographics } from "../types/experiment";

const educationOptions = ["高中及以下", "大专", "本科", "硕士", "博士"];
const workOptions = ["无", "1年以下", "1-3年", "3-5年", "5年以上"];
const phonePattern = /^\d{11}$/;
const phoneRegistryKey = "experiment_registered_phones_v1";

const consentText = [
  "感谢您参与本实验。实验时长约10分钟。",
  "您的数据将仅用于学术研究，所有信息将严格保密。",
  "您的选择没有好坏对错之分，请根据自己的真实想法完成实验。",
  "如有疑问，请联系22339080@zju.edu.cn",
];

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function getRegisteredPhones(): string[] {
  try {
    const raw = localStorage.getItem(phoneRegistryKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function isPhoneRegisteredLocally(phone: string): boolean {
  return getRegisteredPhones().includes(phone);
}

function markPhoneRegisteredLocally(phone: string) {
  const phones = getRegisteredPhones();
  if (phones.includes(phone)) return;
  phones.push(phone);
  localStorage.setItem(phoneRegistryKey, JSON.stringify(phones));
}

async function isPhoneRegistered(phone: string): Promise<boolean> {
  const checkEndpoint = import.meta.env.VITE_PHONE_CHECK_ENDPOINT as
    | string
    | undefined;
  const endpoint = checkEndpoint ?? "/api/participants/check-phone";
  if (endpoint) {
    try {
      const response = await fetch(
        `${endpoint}?phone=${encodeURIComponent(phone)}`,
      );
      if (response.ok) {
        const payload = (await response.json()) as {
          exists?: boolean;
          phoneExists?: boolean;
          isRegistered?: boolean;
        };
        if (payload.exists || payload.phoneExists || payload.isRegistered) {
          return true;
        }
      }
    } catch {
      // Fall back to local checking when remote duplicate-check service is unavailable.
    }
  }
  return isPhoneRegisteredLocally(phone);
}

export default function ConsentPage() {
  usePageTimer("consent");

  const navigate = useNavigate();
  const location = useLocation();
  const beginParticipantSession = useExperimentStore(
    (state) => state.beginParticipantSession,
  );
  const setCurrentPage = useExperimentStore((state) => state.setCurrentPage);
  const setConsentData = useExperimentStore((state) => state.setConsentData);
  const demographicsFromStore = useExperimentStore(
    (state) => state.demographics,
  );
  const consentGivenFromStore = useExperimentStore(
    (state) => state.consentGiven,
  );

  const [consentGiven, setConsentGiven] = useState(consentGivenFromStore);
  const [demographics, setDemographics] = useState<Demographics>({
    ...demographicsFromStore,
    phone: demographicsFromStore.phone ?? "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [checkingPhone, setCheckingPhone] = useState(false);

  const isAgeValid = useMemo(
    () =>
      demographics.age !== null &&
      demographics.age >= 18 &&
      demographics.age <= 60,
    [demographics.age],
  );
  const normalizedPhone = useMemo(
    () => normalizePhone(demographics.phone),
    [demographics.phone],
  );
  const isPhoneValid = useMemo(
    () => phonePattern.test(normalizedPhone),
    [normalizedPhone],
  );
  const isFormComplete =
    consentGiven &&
    isPhoneValid &&
    demographics.gender &&
    isAgeValid &&
    demographics.education &&
    demographics.workExperience;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormComplete || checkingPhone) return;

    setPhoneError("");
    setCheckingPhone(true);
    try {
      const hasDuplicatePhone = await isPhoneRegistered(normalizedPhone);
      if (hasDuplicatePhone) {
        setPhoneError("该手机号已参与过本实验，请勿重复参加。");
        return;
      }

      const sanitizedDemographics: Demographics = {
        ...demographics,
        phone: normalizedPhone,
      };

      const forcedCondition = new URLSearchParams(location.search).get(
        "condition",
      );
      const condition = assignCondition(forcedCondition);

      beginParticipantSession(condition);
      setConsentData({
        consentGiven: true,
        demographics: sanitizedDemographics,
      });
      markPhoneRegisteredLocally(normalizedPhone);
      setCurrentPage(2);
      navigate("/briefing");
    } finally {
      setCheckingPhone(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* <h1 className="text-2xl font-semibold text-slate-900">知情同意书</h1> */}
      {/* <p className="mt-2 text-sm text-slate-600">
        请先阅读并同意以下说明。你可在任意时点退出实验，所有数据仅用于学术研究。
      </p> */}

      <div className="mt-5 rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">知情同意书</h2>
        </div>
        <div className="thin-scrollbar h-44 overflow-y-auto px-4 py-3 text-sm leading-relaxed text-slate-700">
          {consentText.map((paragraph) => (
            <p key={paragraph} className="mb-3">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(event) => setConsentGiven(event.target.checked)}
            />
            我同意参与本研究
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-900">基本信息</h2>
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          被试费将发放至您手机号对应的支付宝账号，您的个人信息将得到严格保密。
        </div>
        <label className="block text-sm text-slate-700">
          手机号
          <input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            value={demographics.phone}
            onChange={(event) => {
              setPhoneError("");
              setDemographics((prev) => ({
                ...prev,
                phone: event.target.value.replace(/\D/g, "").slice(0, 11),
              }));
            }}
            placeholder="请输入11位手机号"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-400"
          />
        </label>
        {!isPhoneValid && demographics.phone.trim() && (
          <p className="text-xs text-rose-600">请输入有效的11位手机号。</p>
        )}
        {phoneError && <p className="text-xs text-rose-600">{phoneError}</p>}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">性别</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-700">
            {["男", "女"].map((gender) => (
              <label key={gender} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value={gender}
                  checked={demographics.gender === gender}
                  onChange={(event) =>
                    setDemographics((prev) => ({
                      ...prev,
                      gender: event.target.value,
                    }))
                  }
                />
                {gender}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-700">
            年龄（18-60）
            <input
              type="number"
              min={18}
              max={60}
              value={demographics.age ?? ""}
              onChange={(event) =>
                setDemographics((prev) => ({
                  ...prev,
                  age: event.target.value ? Number(event.target.value) : null,
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-400"
            />
          </label>

          <label className="text-sm text-slate-700">
            学历
            <select
              value={demographics.education}
              onChange={(event) =>
                setDemographics((prev) => ({
                  ...prev,
                  education: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-400"
            >
              <option value="">请选择</option>
              {educationOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm text-slate-700">
          工作经验
          <select
            value={demographics.workExperience}
            onChange={(event) =>
              setDemographics((prev) => ({
                ...prev,
                workExperience: event.target.value,
              }))
            }
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-400"
          >
            <option value="">请选择</option>
            {workOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {!isAgeValid && demographics.age !== null && (
          <p className="text-xs text-rose-600">年龄需在18到60岁之间。</p>
        )}

        <button
          type="submit"
          disabled={!isFormComplete || checkingPhone}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {checkingPhone ? "正在校验手机号..." : "开始实验 →"}
        </button>
      </form>
    </section>
  );
}
