"use client";

import { useEffect, useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import {
  calculateDsr,
  type RepaymentMethod,
  type StressRateOption,
} from "@/lib/calculators/dsr";
import { DSR_LIMITS } from "@/constants/rates";
import { formatKRW, formatKoreanUnit, formatPercent } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const INCOME_PRESETS: PresetOption[] = [
  { label: "+5천만", amount: 50_000_000 },
  { label: "+1천만", amount: 10_000_000 },
  { label: "+500만", amount: 5_000_000 },
];

const LOAN_PRESETS: PresetOption[] = [
  { label: "+1억", amount: 100_000_000 },
  { label: "+5천만", amount: 50_000_000 },
  { label: "+1천만", amount: 10_000_000 },
];

export function DsrCalculator() {
  const [annualIncome, setAnnualIncome] = useState<number>(70_000_000);
  const [loanAmount, setLoanAmount] = useState<number>(350_000_000);
  const [interestRate, setInterestRate] = useState<number>(4.2);
  const [loanYears, setLoanYears] = useState<number>(30);
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>(
    "equalPrincipalInterest"
  );
  const [stressRate, setStressRate] = useState<StressRateOption>(0.75);
  const [existingAnnualDebtService, setExistingAnnualDebtService] =
    useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const qIncome = Number(sp.get("income"));
    const qLoan = Number(sp.get("loan"));
    const qPrice = Number(sp.get("price"));
    const qRate = Number(sp.get("rate"));
    const qYears = Number(sp.get("years"));
    const qStress = Number(sp.get("stress"));

    if (Number.isFinite(qIncome) && qIncome > 0) setAnnualIncome(Math.round(qIncome));
    if (Number.isFinite(qLoan) && qLoan > 0) setLoanAmount(Math.round(qLoan));
    else if (Number.isFinite(qPrice) && qPrice > 0) {
      setLoanAmount(Math.round(qPrice * 0.6));
    }
    if (Number.isFinite(qRate) && qRate > 0 && qRate <= 20) setInterestRate(qRate);
    if (Number.isFinite(qYears) && qYears >= 1 && qYears <= 50) setLoanYears(Math.round(qYears));
    if (qStress === 0 || qStress === 0.75 || qStress === 1.5) setStressRate(qStress);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    url.searchParams.set("income", String(Math.round(annualIncome)));
    url.searchParams.set("loan", String(Math.round(loanAmount)));
    url.searchParams.set("rate", String(interestRate));
    url.searchParams.set("years", String(loanYears));
    url.searchParams.set("stress", String(stressRate));
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [hydrated, annualIncome, loanAmount, interestRate, loanYears, stressRate]);

  const result = useMemo(
    () =>
      calculateDsr({
        annualIncome,
        loanAmount,
        interestRate,
        loanYears,
        repaymentMethod,
        stressRate,
        existingAnnualDebtService,
      }),
    [
      annualIncome,
      loanAmount,
      interestRate,
      loanYears,
      repaymentMethod,
      stressRate,
      existingAnnualDebtService,
    ]
  );

  // 게이지 바 최대 스케일 60% 기준 비율
  const gaugeWidthPercent = Math.min(100, (result.dsrRatio / 60) * 100);
  const statusLabel =
    result.status === "safe"
      ? `1금융권(${DSR_LIMITS.tier1BankLimit}%) 이내 안정`
      : result.status === "caution"
        ? `1금융권 한도(${DSR_LIMITS.tier1BankLimit}%) 초과 · 2금융권(${DSR_LIMITS.tier2BankLimit}%) 이내`
        : `2금융권 한도(${DSR_LIMITS.tier2BankLimit}%) 초과`;

  const statusColorClass =
    result.status === "safe"
      ? "bg-emerald-500"
      : result.status === "caution"
        ? "bg-amber-500"
        : "bg-rose-500";

  const getSummaryText = () =>
    [
      "[Beesvia Fin DSR·대출 상환액 계산 결과]",
      `• 세전 연소득: ${formatKRW(annualIncome)}`,
      `• 신규 대출: ${formatKRW(loanAmount)} (연 ${interestRate}%, ${loanYears}년, ${repaymentMethod === "equalPrincipalInterest" ? "원리금균등" : "원금균등"})`,
      `• 스트레스 DSR 가산금리: +${stressRate}% (심사 금리 ${result.appliedDsrRate}%)`,
      `• 신규 대출 월 평균 상환액(실제 금리): ${formatKRW(result.actualMonthlyPaymentAvg)}`,
      `• 연간 총 원리금 상환액(DSR 기준): ${formatKRW(result.totalAnnualDebtService)}`,
      `▶ 예상 DSR 비율: ${formatPercent(result.dsrRatio, 2)} (${statusLabel})`,
      `• DSR 40% 기준 추가 대출 가능 여력: 약 ${formatKRW(result.estimatedAdditionalLoan)}`,
      "https://fin.beesvia.com/finance/dsr",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Input Card */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
        <div className="space-y-2">
          <CurrencyInput
            id="dsr-income"
            label="세전 연소득 (근로·사업소득)"
            value={annualIncome}
            onChange={setAnnualIncome}
          />
          <PresetButtons
            presets={INCOME_PRESETS}
            onAdd={(amt) => setAnnualIncome((prev) => prev + amt)}
            onReset={() => setAnnualIncome(0)}
          />
        </div>

        <div className="space-y-2">
          <CurrencyInput
            id="dsr-loan"
            label="신규 대출 신청 금액"
            value={loanAmount}
            onChange={setLoanAmount}
          />
          <PresetButtons
            presets={LOAN_PRESETS}
            onAdd={(amt) => setLoanAmount((prev) => prev + amt)}
            onReset={() => setLoanAmount(0)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="dsr-rate"
              className="text-sm font-semibold text-slate-800"
            >
              대출 금리 (연 %)
            </label>
            <div className="relative">
              <input
                id="dsr-rate"
                type="number"
                step={0.1}
                min={0}
                max={20}
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-8 text-right font-mono text-base font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
                %
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="dsr-years"
              className="text-sm font-semibold text-slate-800"
            >
              대출 기간 (년)
            </label>
            <div className="relative">
              <input
                id="dsr-years"
                type="number"
                step={1}
                min={1}
                max={50}
                value={loanYears}
                onChange={(e) =>
                  setLoanYears(
                    Math.min(50, Math.max(1, Number(e.target.value) || 1))
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-8 text-right font-mono text-base font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
                년
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">상환 방식</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "equalPrincipalInterest", label: "원리금균등상환" },
                { value: "equalPrincipal", label: "원금균등상환" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRepaymentMethod(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  repaymentMethod === opt.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            스트레스 DSR 가산금리 옵션
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {DSR_LIMITS.stressRatePresets.map((presetRate) => (
              <button
                key={presetRate}
                type="button"
                onClick={() => setStressRate(presetRate)}
                className={`rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                  stressRate === presetRate
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {presetRate === 0 ? "0% (미적용)" : `+${presetRate}%`}
              </button>
            ))}
          </div>
        </div>

        <CurrencyInput
          id="dsr-existing"
          label="기존 보유 대출 연간 원리금 상환액"
          value={existingAnnualDebtService}
          onChange={setExistingAnnualDebtService}
          helperText="신용대출·카드론·자동차 할부 등 기존 대출의 1년 총 상환액을 입력하세요."
        />
      </div>

      {/* Result Card */}
      <div className="flex flex-col gap-5 lg:col-span-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              예상 DSR 비율
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
                result.status === "safe"
                  ? "bg-emerald-600/80"
                  : result.status === "caution"
                    ? "bg-amber-600/80"
                    : "bg-rose-600/80"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatPercent(result.dsrRatio, 2)}
          </p>

          {/* DSR Visual Gauge Bar (0% ~ 60%+) */}
          <div className="mt-5 space-y-2">
            <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${statusColorClass}`}
                style={{ width: `${gaugeWidthPercent}%` }}
              />
              {/* 40% marker (40/60 = 66.67%) */}
              <div
                className="absolute inset-y-0 w-0.5 bg-white/80"
                style={{ left: "66.67%" }}
                title="1금융권 한도 40%"
              />
              {/* 50% marker (50/60 = 83.33%) */}
              <div
                className="absolute inset-y-0 w-0.5 bg-amber-300/80"
                style={{ left: "83.33%" }}
                title="2금융권 한도 50%"
              />
            </div>
            <div className="relative flex justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span className="font-semibold text-white">1금융 한도 40%</span>
              <span className="font-semibold text-amber-300">2금융 50%</span>
              <span>60%+</span>
            </div>
          </div>
        </div>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            상환액 및 대출 여력 분석
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  신규 대출 월 평균 상환액 (실제 {interestRate}%)
                </td>
                <td className="py-3 text-right font-mono font-bold text-slate-900">
                  {formatKRW(result.actualMonthlyPaymentAvg)}
                </td>
              </tr>
              {repaymentMethod === "equalPrincipal" && (
                <tr>
                  <td className="py-3 font-medium text-slate-600">
                    1회차 / 마지막 회차 월 상환액
                  </td>
                  <td className="py-3 text-right font-mono text-xs text-slate-700">
                    {formatKRW(result.actualFirstMonthPayment)} →{" "}
                    {formatKRW(result.actualLastMonthPayment)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  신규 대출 연간 원리금 (스트레스 {result.appliedDsrRate}%)
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.newLoanDsrAnnualPayment)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  연간 총 원리금 상환액 (기존 포함)
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.totalAnnualDebtService)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  DSR 40% 기준 남은 연간 상환 여력
                </td>
                <td className="py-3 text-right font-mono font-semibold text-emerald-700">
                  {formatKRW(result.remainingCapacityAnnual)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
            {result.dsrRatio <= 40 ? (
              <p>
                <strong className="text-emerald-700">추가 대출 여력:</strong>{" "}
                현재 입력하신 금리·기간 조건 기준으로 1금융권 DSR 40% 한도
                내에서 약{" "}
                <strong className="text-slate-900">
                  {formatKoreanUnit(result.estimatedAdditionalLoan)}
                </strong>{" "}
                가량의 추가 대출 여력이 남아 있습니다.
              </p>
            ) : (
              <p>
                <strong className="text-rose-700">한도 초과 안내:</strong>{" "}
                1금융권 DSR 40% 기준을 초과했습니다. 대출 기간을 늘리거나
                신청 금액을 줄이고, 기존 신용대출·마이너스통장을 정리하면 DSR
                비율을 낮출 수 있습니다.
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <CopyResultButton getSummaryText={getSummaryText} />
          </div>
        </div>
      </div>
    </div>
  );
}
