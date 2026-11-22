"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import {
  calculateGiftTax,
  DONOR_RELATION_MAP,
  type DonorRelation,
} from "@/lib/calculators/gift-tax";
import { GIFT_TAX } from "@/constants/rates";
import { formatKRW, formatPercent } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const GIFT_PRESETS: PresetOption[] = [
  { label: "+1억", amount: 100_000_000 },
  { label: "+5천만", amount: 50_000_000 },
  { label: "+1천만", amount: 10_000_000 },
  { label: "+500만", amount: 5_000_000 },
];

export function GiftTaxCalculator() {
  const [relation, setRelation] = useState<DonorRelation>(
    "linealAscendantAdult"
  );
  const [giftAmount, setGiftAmount] = useState<number>(150_000_000);
  const [priorGiftAmount, setPriorGiftAmount] = useState<number>(0);
  const [isGenerationSkipping, setIsGenerationSkipping] =
    useState<boolean>(false);
  const [isSelfReport, setIsSelfReport] = useState<boolean>(true);

  const result = useMemo(
    () =>
      calculateGiftTax({
        relation,
        giftAmount,
        priorGiftAmount,
        isGenerationSkipping,
        isSelfReport,
      }),
    [
      relation,
      giftAmount,
      priorGiftAmount,
      isGenerationSkipping,
      isSelfReport,
    ]
  );

  const getSummaryText = () =>
    [
      "[Beesvia Fin 증여세 모의 계산 결과]",
      `• 증여자 관계: ${DONOR_RELATION_MAP[relation].label} (공제 한도 ${formatKRW(result.deductionLimit)})`,
      `• 이번 증여재산가액: ${formatKRW(giftAmount)}`,
      `• 10년 이내 기증여 합산액: ${formatKRW(priorGiftAmount)}`,
      `• 과세표준: ${formatKRW(result.taxBase)} (${result.bracketLabel})`,
      `• 산출세액: ${formatKRW(result.baseCalculatedTax)}${isGenerationSkipping ? ` + 세대생략 할증 ${formatKRW(result.generationSkippingSurcharge)}` : ""}`,
      `• 자진신고 세액공제(3%): -${formatKRW(result.selfReportDiscount)}`,
      `▶ 최종 납부할 증여세액: ${formatKRW(result.finalTax)}`,
      "https://fin.beesvia.com/tax/gift-tax",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Input Card */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            증여자 관계 (수증자 기준)
          </span>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(DONOR_RELATION_MAP) as DonorRelation[]).map((key) => {
              const info = DONOR_RELATION_MAP[key];
              const active = relation === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRelation(key)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-sm font-semibold">{info.label}</span>
                  <span
                    className={`mt-0.5 text-xs ${
                      active ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    {info.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <CurrencyInput
            id="gift-amount"
            label="이번 증여재산가액"
            value={giftAmount}
            onChange={setGiftAmount}
          />
          <PresetButtons
            presets={GIFT_PRESETS}
            onAdd={(amt) => setGiftAmount((prev) => prev + amt)}
            onReset={() => setGiftAmount(0)}
          />
        </div>

        <CurrencyInput
          id="prior-gift-amount"
          label="10년 이내 기증여재산 합산액"
          value={priorGiftAmount}
          onChange={setPriorGiftAmount}
          helperText="동일 그룹 증여자로부터 최근 10년 내 이미 증여받은 금액이 있다면 입력하세요."
        />

        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={isSelfReport}
              onChange={(e) => setIsSelfReport(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div className="text-sm">
              <span className="font-semibold text-slate-800">
                기한 내 자진신고 세액공제 ({GIFT_TAX.selfReportDiscountRate}%)
              </span>
              <p className="text-xs text-slate-500">
                증여일이 속한 달의 말일부터 3개월 이내 신고 시 산출세액{" "}
                {GIFT_TAX.selfReportDiscountRate}% 공제
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 border-t border-slate-200 pt-2.5">
            <input
              type="checkbox"
              checked={isGenerationSkipping}
              onChange={(e) => setIsGenerationSkipping(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div className="text-sm">
              <span className="font-semibold text-slate-800">
                세대생략 할증과세 ({GIFT_TAX.generationSkippingSurchargeRate}%)
              </span>
              <p className="text-xs text-slate-500">
                조부모 → 손주 등 자녀를 건너뛰고 직계비속에게 증여 시 적용
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Result Card */}
      <div className="flex flex-col gap-5 lg:col-span-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              최종 납부할 증여세액
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-100">
              {result.bracketLabel}
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatKRW(result.finalTax)}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            증여재산공제 {formatKRW(result.appliedDeduction)} 적용 · 과세표준{" "}
            {formatKRW(result.taxBase)}
          </p>
        </div>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            세액 산출 상세 내역
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  합산 증여재산가액
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.totalGiftAmount)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  증여재산공제 (한도 {formatKRW(result.deductionLimit)})
                </td>
                <td className="py-3 text-right font-mono font-semibold text-emerald-700">
                  -{formatKRW(result.appliedDeduction)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">과세표준</td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.taxBase)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">
                  적용 세율 / 누진공제액
                </td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatPercent(result.taxRate, 0)} /{" "}
                  {formatKRW(result.progressiveDeduction)}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-medium text-slate-600">산출세액</td>
                <td className="py-3 text-right font-mono font-semibold">
                  {formatKRW(result.baseCalculatedTax)}
                </td>
              </tr>
              {isGenerationSkipping && (
                <tr>
                  <td className="py-3 font-medium text-amber-700">
                    세대생략 할증세액 (+30%)
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-amber-700">
                    +{formatKRW(result.generationSkippingSurcharge)}
                  </td>
                </tr>
              )}
              {isSelfReport && (
                <tr>
                  <td className="py-3 font-medium text-emerald-700">
                    자진신고 세액공제 (-3%)
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-emerald-700">
                    -{formatKRW(result.selfReportDiscount)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                <td className="pt-3.5">최종 납부할 증여세액</td>
                <td className="pt-3.5 text-right font-mono text-base text-blue-700">
                  {formatKRW(result.finalTax)}
                </td>
              </tr>
            </tfoot>
          </table>

          {priorGiftAmount > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              ※ 10년 이내 기증여재산에 대해 이미 납부한 증여세(기납부세액)가
              있다면 최종 납부세액에서 해당 금액만큼 추가로 차감됩니다.
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <CopyResultButton getSummaryText={getSummaryText} />
          </div>
        </div>
      </div>
    </div>
  );
}
