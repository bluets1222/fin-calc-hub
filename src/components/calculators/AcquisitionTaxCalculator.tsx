"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import {
  calculateAcquisitionTax,
  type AreaType,
  type HouseCount,
  type PropertyType,
} from "@/lib/calculators/acquisition-tax";
import { formatKRW, formatPercent } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const PRICE_PRESETS: PresetOption[] = [
  { label: "+1억", amount: 100_000_000 },
  { label: "+5천만", amount: 50_000_000 },
  { label: "+1천만", amount: 10_000_000 },
  { label: "+500만", amount: 5_000_000 },
];

export function AcquisitionTaxCalculator() {
  const [propertyType, setPropertyType] = useState<PropertyType>("house");
  const [price, setPrice] = useState<number>(600_000_000);
  const [houseCount, setHouseCount] = useState<HouseCount>("1");
  const [isRegulatedArea, setIsRegulatedArea] = useState<boolean>(false);
  const [isFirstHome, setIsFirstHome] = useState<boolean>(false);
  const [areaType, setAreaType] = useState<AreaType>("under85");

  const result = useMemo(
    () =>
      calculateAcquisitionTax({
        propertyType,
        price,
        houseCount,
        isRegulatedArea,
        isFirstHome,
        areaType,
      }),
    [propertyType, price, houseCount, isRegulatedArea, isFirstHome, areaType]
  );

  const getSummaryText = () =>
    [
      "[Beesvia Fin 부동산 취득세 계산 결과]",
      `• 물건 구분: ${propertyType === "house" ? "주택" : "오피스텔"}`,
      `• 취득가액: ${formatKRW(price)}`,
      `• 적용 기준: ${result.taxCategoryLabel}`,
      `• 취득세(${formatPercent(result.acquisitionTaxRate, 2)}): ${formatKRW(result.acquisitionTax)}${result.firstHomeApplied ? ` (생애최초 감면 -${formatKRW(result.firstHomeDiscount)} 적용)` : ""}`,
      `• 지방교육세(${formatPercent(result.educationTaxRate, 2)}): ${formatKRW(result.educationTax)}`,
      `• 농어촌특별세(${formatPercent(result.ruralTaxRate, 2)}): ${formatKRW(result.ruralTax)}`,
      `▶ 총 납부세액 합계: ${formatKRW(result.totalTax)}`,
      "https://fin.beesvia.com/real-estate/acquisition-tax",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Input Card */}
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-800">물건 구분</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "house", label: "주택 (아파트·빌라·단독)" },
                { value: "officetel", label: "오피스텔 (4.6% 단일)" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPropertyType(opt.value)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
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
            id="acq-price"
            label="취득가액 (매매가)"
            value={price}
            onChange={setPrice}
            helperText="프리셋 버튼을 눌러 빠르게 금액을 더할 수 있습니다."
          />
          <PresetButtons
            presets={PRICE_PRESETS}
            onAdd={(amt) => setPrice((prev) => prev + amt)}
            onReset={() => setPrice(0)}
          />
        </div>

        {propertyType === "house" && (
          <>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                취득 후 보유 주택 수
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "1", label: "무주택·1주택" },
                    { value: "temp2", label: "일시적 2주택" },
                    { value: "2", label: "2주택" },
                    { value: "3plus", label: "3주택 이상" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHouseCount(opt.value)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      houseCount === opt.value
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
                전용면적
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "under85", label: "85㎡ 이하 (국민평형)" },
                    { value: "over85", label: "85㎡ 초과" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAreaType(opt.value)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      areaType === opt.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isRegulatedArea}
                  onChange={(e) => setIsRegulatedArea(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    조정대상지역 내 주택
                  </span>
                  <p className="text-xs text-slate-500">
                    2주택 이상 보유 시 중과세율(8%~12%) 적용 여부를 결정합니다.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 border-t border-slate-200 pt-2.5">
                <input
                  type="checkbox"
                  checked={isFirstHome}
                  onChange={(e) => setIsFirstHome(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">
                    생애최초 주택구입 감면 (최대 200만 원)
                  </span>
                  <p className="text-xs text-slate-500">
                    세대원 전원 무주택, 실거래가 12억 원 이하 주택 취득 시 적용
                  </p>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Result Card */}
      <div className="flex flex-col gap-5 lg:col-span-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              총 납부 예상 세액
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-100">
              {result.taxCategoryLabel}
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatKRW(result.totalTax)}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            합산 세율 약 {formatPercent(result.totalRate, 2)}
            {result.firstHomeApplied &&
              ` · 생애최초 감면 ${formatKRW(result.firstHomeDiscount)} 반영`}
          </p>
        </div>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        {result.firstHomeNotice && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
            {result.firstHomeNotice}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            세부 산출 내역
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="pb-2.5 font-semibold">세목</th>
                  <th className="pb-2.5 text-right font-semibold">적용 세율</th>
                  <th className="pb-2.5 text-right font-semibold">산출 금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-3 font-medium">취득세 (감면 전)</td>
                  <td className="py-3 text-right font-mono text-slate-600">
                    {formatPercent(result.acquisitionTaxRate, 2)}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold">
                    {formatKRW(result.rawAcquisitionTax)}
                  </td>
                </tr>
                {result.firstHomeApplied && (
                  <tr className="text-emerald-700">
                    <td className="py-3 font-medium">생애최초 감면</td>
                    <td className="py-3 text-right text-xs">최대 200만 한도</td>
                    <td className="py-3 text-right font-mono font-semibold">
                      -{formatKRW(result.firstHomeDiscount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 font-medium">지방교육세</td>
                  <td className="py-3 text-right font-mono text-slate-600">
                    {formatPercent(result.educationTaxRate, 2)}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold">
                    {formatKRW(result.educationTax)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">농어촌특별세</td>
                  <td className="py-3 text-right font-mono text-slate-600">
                    {formatPercent(result.ruralTaxRate, 2)}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold">
                    {formatKRW(result.ruralTax)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                  <td className="pt-3.5">총 납부세액 합계</td>
                  <td className="pt-3.5 text-right font-mono text-xs text-slate-500">
                    {formatPercent(result.totalRate, 2)}
                  </td>
                  <td className="pt-3.5 text-right font-mono text-base text-blue-700">
                    {formatKRW(result.totalTax)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <CopyResultButton getSummaryText={getSummaryText} />
          </div>
        </div>
      </div>
    </div>
  );
}
