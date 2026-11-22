"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { INSURANCE_AND_INCOME_TAX } from "@/constants/rates";
import { calculateNetPay, type PayType } from "@/lib/calculators/net-pay";
import { formatKRW, formatPercent } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const ANNUAL_PRESETS: PresetOption[] = [
  { label: "+1천만", amount: 10_000_000 },
  { label: "+500만", amount: 5_000_000 },
  { label: "+100만", amount: 1_000_000 },
];

const MONTHLY_PRESETS: PresetOption[] = [
  { label: "+100만", amount: 1_000_000 },
  { label: "+50만", amount: 500_000 },
  { label: "+10만", amount: 100_000 },
];

export function NetPayCalculator() {
  const [payType, setPayType] = useState<PayType>("annual");
  const [grossAmount, setGrossAmount] = useState<number>(50_000_000);
  const [nonTaxableAmount, setNonTaxableAmount] = useState<number>(
    INSURANCE_AND_INCOME_TAX.defaultNonTaxableMeal
  );
  const [dependents, setDependents] = useState<number>(1);
  const [childrenUnder20, setChildrenUnder20] = useState<number>(0);

  const result = useMemo(
    () =>
      calculateNetPay({
        payType,
        grossAmount,
        nonTaxableAmount,
        dependents,
        childrenUnder20,
      }),
    [payType, grossAmount, nonTaxableAmount, dependents, childrenUnder20]
  );

  const handlePayTypeChange = (nextType: PayType) => {
    if (nextType === payType) return;
    setPayType(nextType);
    setGrossAmount((prev) =>
      nextType === "monthly" ? Math.round(prev / 12) : prev * 12
    );
  };

  const getSummaryText = () =>
    [
      "[Beesvia Fin 연봉 실수령액 계산 결과]",
      `• 기준 급여: ${payType === "annual" ? `연봉 ${formatKRW(grossAmount)}` : `월급 ${formatKRW(grossAmount)}`} (비과세 ${formatKRW(nonTaxableAmount)})`,
      `• 부양가족: ${dependents}명 (20세 이하 자녀 ${childrenUnder20}명)`,
      `• 월 세전 급여: ${formatKRW(result.monthlyGross)}`,
      `• 4대보험 합계: -${formatKRW(result.totalInsurance)} (국민연금 ${formatKRW(result.nationalPension)}, 건보+장기요양 ${formatKRW(result.healthInsurance + result.longTermCare)}, 고용 ${formatKRW(result.employmentInsurance)})`,
      `• 소득세+지방소득세: -${formatKRW(result.totalTax)}`,
      `▶ 월 예상 실수령액: ${formatKRW(result.monthlyNetPay)} (연 ${formatKRW(result.annualNetPay)})`,
      "https://fin.beesvia.com/salary/net-pay",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Input Card */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            급여 입력 기준
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "annual", label: "연봉 (퇴직금 별도)" },
                { value: "monthly", label: "월급 (세전)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePayTypeChange(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  payType === opt.value
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
          <CurrencyInput
            id="netpay-gross"
            label={payType === "annual" ? "세전 연봉" : "세전 월급"}
            value={grossAmount}
            onChange={setGrossAmount}
          />
          <PresetButtons
            presets={payType === "annual" ? ANNUAL_PRESETS : MONTHLY_PRESETS}
            onAdd={(amt) => setGrossAmount((prev) => prev + amt)}
            onReset={() => setGrossAmount(0)}
          />
        </div>

        <CurrencyInput
          id="netpay-nontaxable"
          label="월 비과세액 (식대 등)"
          value={nonTaxableAmount}
          onChange={setNonTaxableAmount}
          helperText="기본 식대 비과세 한도는 월 20만 원입니다."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="netpay-dependents"
              className="text-sm font-semibold text-slate-800"
            >
              부양가족 수 (본인 포함)
            </label>
            <select
              id="netpay-dependents"
              value={dependents}
              onChange={(e) => {
                const next = Number(e.target.value);
                setDependents(next);
                if (childrenUnder20 >= next) {
                  setChildrenUnder20(Math.max(0, next - 1));
                }
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {Array.from({ length: 11 }, (_, idx) => idx + 1).map((n) => (
                <option key={n} value={n}>
                  {n}명 {n === 1 ? "(본인만)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="netpay-children"
              className="text-sm font-semibold text-slate-800"
            >
              20세 이하 자녀 수
            </label>
            <select
              id="netpay-children"
              value={childrenUnder20}
              onChange={(e) => setChildrenUnder20(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {Array.from({ length: 10 }, (_, idx) => idx).map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="flex flex-col gap-5 lg:col-span-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              월 예상 실수령액
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-100">
              공제율 {formatPercent(result.effectiveDeductionRate, 1)}
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatKRW(result.monthlyNetPay)}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            연 환산 실수령액 {formatKRW(result.annualNetPay)} · 월 공제 합계{" "}
            {formatKRW(result.totalDeduction)}
          </p>
        </div>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            월 급여 공제 상세 내역
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  월 세전 급여 (비과세 제외 과세 {formatKRW(result.monthlyTaxable)})
                </td>
                <td className="py-2.5 text-right font-mono font-semibold whitespace-nowrap">
                  {formatKRW(result.monthlyGross)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  국민연금 ({INSURANCE_AND_INCOME_TAX.nationalPensionRate}%)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.nationalPension)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  건강보험 ({INSURANCE_AND_INCOME_TAX.healthInsuranceRate}%)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.healthInsurance)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  장기요양보험 (건보료의{" "}
                  {INSURANCE_AND_INCOME_TAX.longTermCareRateOfHealth}%)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.longTermCare)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  고용보험 ({INSURANCE_AND_INCOME_TAX.employmentInsuranceRate}%)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.employmentInsurance)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  근로소득세 (간이세액 근사)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.incomeTax)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  지방소득세 (소득세의 10%)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.localIncomeTax)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 font-semibold text-slate-700">
                <td className="pt-3">월 공제액 합계</td>
                <td className="pt-3 text-right font-mono text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.totalDeduction)}
                </td>
              </tr>
              <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                <td className="pt-3">월 예상 실수령액</td>
                <td className="pt-3 text-right font-mono text-base text-blue-700 whitespace-nowrap">
                  {formatKRW(result.monthlyNetPay)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-5 flex justify-end">
            <CopyResultButton getSummaryText={getSummaryText} />
          </div>
        </div>
      </div>
    </div>
  );
}
