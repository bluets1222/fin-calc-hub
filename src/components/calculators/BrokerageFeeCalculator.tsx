"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import {
  calculateBrokerageFee,
  getBrokerageMaxSpec,
  type BrokeragePropertyType,
  type DealType,
  type VatType,
} from "@/lib/calculators/brokerage-fee";
import { BROKERAGE_FEE } from "@/constants/rates";
import { formatKRW, formatPercent } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const DEAL_PRESETS: PresetOption[] = [
  { label: "+1억", amount: 100_000_000 },
  { label: "+5천만", amount: 50_000_000 },
  { label: "+1천만", amount: 10_000_000 },
  { label: "+500만", amount: 5_000_000 },
];

const RENT_PRESETS: PresetOption[] = [
  { label: "+50만", amount: 500_000 },
  { label: "+20만", amount: 200_000 },
  { label: "+10만", amount: 100_000 },
  { label: "+5만", amount: 50_000 },
];

export function BrokerageFeeCalculator() {
  const [dealType, setDealType] = useState<DealType>("sale");
  const [propertyType, setPropertyType] =
    useState<BrokeragePropertyType>("house");
  const [amount, setAmount] = useState<number>(500_000_000);
  const [monthlyRent, setMonthlyRent] = useState<number>(1_000_000);
  const [vatType, setVatType] = useState<VatType>("general");
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(0.4);

  const previewBaseAmount = useMemo(() => {
    if (dealType !== "monthly") return amount;
    const standard = amount + monthlyRent * 100;
    return standard < 50_000_000 ? amount + monthlyRent * 70 : standard;
  }, [dealType, amount, monthlyRent]);

  const maxSpec = useMemo(
    () => getBrokerageMaxSpec(propertyType, dealType, previewBaseAmount),
    [propertyType, dealType, previewBaseAmount]
  );

  const result = useMemo(
    () =>
      calculateBrokerageFee({
        dealType,
        propertyType,
        amount,
        monthlyRent,
        vatType,
        customRate: useCustomRate ? customRate : null,
      }),
    [dealType, propertyType, amount, monthlyRent, vatType, useCustomRate, customRate]
  );

  const getSummaryText = () =>
    [
      "[Beesvia Fin 부동산 중개보수(복비) 계산 결과]",
      `• 거래 유형: ${dealType === "sale" ? "매매·교환" : dealType === "jeonse" ? "전세" : "월세"} / ${propertyType === "house" ? "주택" : propertyType === "officetel" ? "오피스텔" : "주택 외"}`,
      `• 기준 금액: ${formatKRW(result.baseAmount)}${result.isConvertedRentApplied ? ` (환산보증금 ×${result.conversionMultiplier})` : ""}`,
      `• 적용 요율: ${formatPercent(result.appliedRate, 2)} (법정 상한 ${formatPercent(result.maxRate, 2)})`,
      `• 중개보수: ${formatKRW(result.brokerageFee)}${result.isLimitApplied && result.limitAmount ? ` (한도액 ${formatKRW(result.limitAmount)} 적용)` : ""}`,
      `• 부가가치세(${result.vatRate}%): ${formatKRW(result.vatAmount)}`,
      `▶ 총 예상 비용: ${formatKRW(result.totalCost)}`,
      "https://fin.beesvia.com/real-estate/brokerage-fee",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Input Card */}
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">거래 유형</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "sale", label: "매매·교환" },
                { value: "jeonse", label: "전세" },
                { value: "monthly", label: "월세" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setDealType(opt.value);
                  setUseCustomRate(false);
                }}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  dealType === opt.value
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
          <span className="text-sm font-semibold text-slate-800">물건 종류</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "house", label: "주택" },
                { value: "officetel", label: "오피스텔" },
                { value: "other", label: "주택 외(상가·토지)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setPropertyType(opt.value);
                  setUseCustomRate(false);
                }}
                className={`rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                  propertyType === opt.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <CurrencyInput
            id="brokerage-amount"
            label={
              dealType === "sale"
                ? "매매가 (거래금액)"
                : dealType === "jeonse"
                  ? "전세 보증금"
                  : "월세 보증금"
            }
            value={amount}
            onChange={setAmount}
          />
          <PresetButtons
            presets={DEAL_PRESETS}
            onAdd={(amt) => setAmount((prev) => prev + amt)}
            onReset={() => setAmount(0)}
          />
        </div>

        {dealType === "monthly" && (
          <div className="space-y-2.5">
            <CurrencyInput
              id="brokerage-rent"
              label="월세 금액"
              value={monthlyRent}
              onChange={setMonthlyRent}
              helperText={`자동 환산보증금: ${formatKRW(result.baseAmount)} (×${result.conversionMultiplier} 적용)`}
            />
            <PresetButtons
              presets={RENT_PRESETS}
              onAdd={(amt) => setMonthlyRent((prev) => prev + amt)}
              onReset={() => setMonthlyRent(0)}
            />
          </div>
        )}

        {/* 협의 요율 조정 */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={useCustomRate}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseCustomRate(checked);
                  if (checked) {
                    setCustomRate(maxSpec.maxRate);
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span>협의 요율 직접 조정</span>
            </label>
            <span className="text-xs font-semibold text-blue-700">
              상한 {formatPercent(maxSpec.maxRate, 2)}
            </span>
          </div>

          {useCustomRate && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="range"
                  min={0.05}
                  max={maxSpec.maxRate}
                  step={0.01}
                  value={Math.min(customRate, maxSpec.maxRate)}
                  onChange={(e) => setCustomRate(Number(e.target.value))}
                  className="w-full accent-slate-900"
                  aria-label="협의 요율 슬라이더"
                />
                <input
                  type="number"
                  min={0}
                  max={maxSpec.maxRate}
                  step={0.01}
                  value={Math.min(customRate, maxSpec.maxRate)}
                  onChange={(e) =>
                    setCustomRate(
                      Math.min(maxSpec.maxRate, Math.max(0, Number(e.target.value) || 0))
                    )
                  }
                  className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right font-mono text-sm font-semibold text-slate-900"
                  aria-label="협의 요율 직접 입력"
                />
              </div>
              <p className="text-xs text-slate-500">
                법정 상한요율({formatPercent(maxSpec.maxRate, 2)}) 이내에서
                공인중개사와 협의한 요율을 입력해 보세요.
              </p>
            </div>
          )}
        </div>

        {/* 부가가치세 선택 */}
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            중개사무소 부가가치세 구분
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                {
                  value: "general",
                  label: `일반과세 (${BROKERAGE_FEE.vatRates.general}%)`,
                },
                {
                  value: "simple",
                  label: `간이과세 (${BROKERAGE_FEE.vatRates.simple}%)`,
                },
                {
                  value: "exempt",
                  label: `면세·미청구 (${BROKERAGE_FEE.vatRates.exempt}%)`,
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVatType(opt.value)}
                className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                  vatType === opt.value
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
              총 예상 중개 비용 (부가세 포함)
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-100">
              {result.bracketLabel}
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatKRW(result.totalCost)}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            {useCustomRate ? "협의" : "최대"} 중개보수{" "}
            {formatKRW(result.brokerageFee)} + 부가세 {formatKRW(result.vatAmount)}
          </p>
        </div>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            세부 산출 내역
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  {result.isConvertedRentApplied
                    ? `환산보증금 (×${result.conversionMultiplier})`
                    : "적용 거래금액"}
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.baseAmount)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  법정 상한요율 / 적용 요율
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatPercent(result.maxRate, 2)} /{" "}
                  <span className="text-blue-700">
                    {formatPercent(result.appliedRate, 2)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  한도액 적용 여부
                </td>
                <td className="py-3 text-right font-semibold">
                  {result.limitAmount ? (
                    result.isLimitApplied ? (
                      <span className="text-emerald-700">
                        적용됨 (상한 {formatKRW(result.limitAmount)})
                      </span>
                    ) : (
                      <span className="text-slate-600">
                        미도달 (상한 {formatKRW(result.limitAmount)})
                      </span>
                    )
                  ) : (
                    <span className="text-slate-500">한도액 없음</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  {useCustomRate ? "협의 중개보수" : "최대 중개보수"}
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.brokerageFee)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  부가가치세 ({result.vatRate}%)
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.vatAmount)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                <td className="pt-3.5">총 예상 비용</td>
                <td className="pt-3.5 text-right font-mono text-base text-blue-700">
                  {formatKRW(result.totalCost)}
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
