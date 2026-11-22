"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { INSURANCE_AND_INCOME_TAX } from "@/constants/rates";
import {
  calculateSavings,
  type InterestCalcType,
  type SavingsProductType,
  type SavingsTaxType,
} from "@/lib/calculators/savings";
import { formatKRW, formatPercent } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const DEPOSIT_PRESETS: PresetOption[] = [
  { label: "+1천만", amount: 10_000_000 },
  { label: "+500만", amount: 5_000_000 },
  { label: "+100만", amount: 1_000_000 },
];

const INSTALLMENT_PRESETS: PresetOption[] = [
  { label: "+50만", amount: 500_000 },
  { label: "+20만", amount: 200_000 },
  { label: "+10만", amount: 100_000 },
];

export function SavingsCalculator() {
  const [productType, setProductType] =
    useState<SavingsProductType>("deposit");
  const [amount, setAmount] = useState<number>(30_000_000);
  const [months, setMonths] = useState<number>(12);
  const [annualRate, setAnnualRate] = useState<number>(3.5);
  const [interestType, setInterestType] = useState<InterestCalcType>("simple");
  const [taxType, setTaxType] = useState<SavingsTaxType>("general");

  const result = useMemo(
    () =>
      calculateSavings({
        productType,
        amount,
        months,
        annualRate,
        interestType,
        taxType,
      }),
    [productType, amount, months, annualRate, interestType, taxType]
  );

  const handleProductChange = (next: SavingsProductType) => {
    if (next === productType) return;
    setProductType(next);
    setAmount(next === "deposit" ? 30_000_000 : 500_000);
  };

  const getSummaryText = () =>
    [
      "[Beesvia Fin 예금·적금 세후이자 계산 결과]",
      `• 상품 유형: ${productType === "deposit" ? "정기예금" : "정기적금"} (${interestType === "simple" ? "단리" : "월복리"}, 연 ${annualRate}%, ${months}개월)`,
      `• 원금 합계: ${formatKRW(result.totalPrincipal)}`,
      `• 세전 이자: ${formatKRW(result.grossInterest)}`,
      `• 이자소득세(${result.taxRate}%): -${formatKRW(result.taxAmount)}`,
      `▶ 세후 만기 수령액: ${formatKRW(result.netMaturityAmount)} (세후 이자 ${formatKRW(result.netInterest)})`,
      "https://fin.beesvia.com/finance/savings",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Input Card */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">상품 유형</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "deposit", label: "정기예금 (거치식)" },
                { value: "installment", label: "정기적금 (적립식)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleProductChange(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  productType === opt.value
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
            id="sav-amount"
            label={
              productType === "deposit" ? "예치 원금" : "월 납입 금액"
            }
            value={amount}
            onChange={setAmount}
          />
          <PresetButtons
            presets={
              productType === "deposit" ? DEPOSIT_PRESETS : INSTALLMENT_PRESETS
            }
            onAdd={(amt) => setAmount((prev) => prev + amt)}
            onReset={() => setAmount(0)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="sav-months"
              className="text-sm font-semibold text-slate-800"
            >
              가입 기간 (개월)
            </label>
            <div className="relative">
              <input
                id="sav-months"
                type="number"
                min={1}
                max={240}
                value={months}
                onChange={(e) =>
                  setMonths(
                    Math.min(240, Math.max(1, Number(e.target.value) || 1))
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-right font-mono text-base font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-500">
                개월
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sav-rate"
              className="text-sm font-semibold text-slate-800"
            >
              연 이자율 (%)
            </label>
            <div className="relative">
              <input
                id="sav-rate"
                type="number"
                step={0.1}
                min={0}
                max={30}
                value={annualRate}
                onChange={(e) =>
                  setAnnualRate(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-8 text-right font-mono text-base font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">이자 방식</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "simple", label: "단리" },
                { value: "compound", label: "월복리" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setInterestType(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  interestType === opt.value
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
          <span className="text-sm font-semibold text-slate-800">과세 구분</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                {
                  value: "general",
                  label: `일반과세 (${INSURANCE_AND_INCOME_TAX.savingsTaxRates.general}%)`,
                },
                {
                  value: "preferential",
                  label: `세금우대 (${INSURANCE_AND_INCOME_TAX.savingsTaxRates.preferential}%)`,
                },
                {
                  value: "exempt",
                  label: `비과세 (${INSURANCE_AND_INCOME_TAX.savingsTaxRates.exempt}%)`,
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTaxType(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                  taxType === opt.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="flex flex-col gap-5 lg:col-span-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              세후 만기 수령액
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-100">
              {interestType === "simple" ? "단리" : "월복리"} · 세율{" "}
              {formatPercent(result.taxRate, 1)}
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatKRW(result.netMaturityAmount)}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            원금 {formatKRW(result.totalPrincipal)} + 세후 이자{" "}
            {formatKRW(result.netInterest)}
          </p>
        </div>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            이자 및 세금 상세 내역
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-3 font-medium text-slate-600">원금 합계</td>
                <td className="py-3 text-right font-mono font-semibold whitespace-nowrap">
                  {formatKRW(result.totalPrincipal)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">세전 이자</td>
                <td className="py-3 text-right font-mono font-semibold whitespace-nowrap">
                  {formatKRW(result.grossInterest)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  이자소득세 ({formatPercent(result.taxRate, 1)})
                </td>
                <td className="py-3 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.taxAmount)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">세후 이자</td>
                <td className="py-3 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                  {formatKRW(result.netInterest)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                <td className="pt-3.5">세후 만기 수령액</td>
                <td className="pt-3.5 text-right font-mono text-base text-blue-700 whitespace-nowrap">
                  {formatKRW(result.netMaturityAmount)}
                </td>
              </tr>
            </tfoot>
          </table>

          {taxType !== "general" && result.taxSavedAmount > 0 && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-900">
              일반과세(15.4%, 세금 {formatKRW(result.generalTaxAmount)}) 대비{" "}
              <strong>{formatKRW(result.taxSavedAmount)}</strong>의 절세 효과가
              있습니다.
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <CopyResultButton getSummaryText={getSummaryText} />
          </div>
        </div>
      </div>
    </div>
  );
}
