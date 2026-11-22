"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { calculateSeverance } from "@/lib/calculators/severance";
import { formatKRW } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const THREE_MONTH_PRESETS: PresetOption[] = [
  { label: "+300만", amount: 3_000_000 },
  { label: "+100만", amount: 1_000_000 },
  { label: "+50만", amount: 500_000 },
];

export function SeveranceCalculator() {
  const [startDate, setStartDate] = useState<string>("2023-01-02");
  const [endDate, setEndDate] = useState<string>("2026-11-22");
  const [threeMonthGross, setThreeMonthGross] = useState<number>(12_000_000);
  const [annualBonus, setAnnualBonus] = useState<number>(2_000_000);
  const [unusedLeavePay, setUnusedLeavePay] = useState<number>(0);
  const [ordinaryDailyWage, setOrdinaryDailyWage] = useState<number>(0);

  const result = useMemo(
    () =>
      calculateSeverance({
        startDate,
        endDate,
        threeMonthGross,
        annualBonus,
        unusedLeavePay,
        ordinaryDailyWage,
      }),
    [
      startDate,
      endDate,
      threeMonthGross,
      annualBonus,
      unusedLeavePay,
      ordinaryDailyWage,
    ]
  );

  const getSummaryText = () =>
    [
      "[Beesvia Fin 퇴직금 모의 계산 결과]",
      `• 재직 기간: ${startDate} ~ ${endDate} (총 ${result.totalDays.toLocaleString("ko-KR")}일)`,
      `• 1일 평균임금: ${formatKRW(result.averageDailyWage)}${result.usedOrdinaryWage ? ` (통상임금 ${formatKRW(result.ordinaryDailyWage)} 적용)` : ""}`,
      `• 세전 예상 퇴직금: ${formatKRW(result.grossSeverance)}`,
      `• 퇴직소득세 + 지방소득세: -${formatKRW(result.totalTax)}`,
      `▶ 세후 실수령 예상 퇴직금: ${formatKRW(result.netSeverance)}`,
      "https://fin.beesvia.com/salary/severance",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Input Card */}
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="sev-start"
              className="text-sm font-semibold text-slate-800"
            >
              입사일
            </label>
            <input
              id="sev-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sev-end"
              className="text-sm font-semibold text-slate-800"
            >
              퇴사일 (마지막 근무일)
            </label>
            <input
              id="sev-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <CurrencyInput
            id="sev-3month"
            label="퇴직 전 3개월 세전 급여 합계"
            value={threeMonthGross}
            onChange={setThreeMonthGross}
            helperText="기본급 및 고정 수당 등 최근 3개월간 받은 세전 급여 총액"
          />
          <PresetButtons
            presets={THREE_MONTH_PRESETS}
            onAdd={(amt) => setThreeMonthGross((prev) => prev + amt)}
            onReset={() => setThreeMonthGross(0)}
          />
        </div>

        <CurrencyInput
          id="sev-bonus"
          label="연간 상여금 총액"
          value={annualBonus}
          onChange={setAnnualBonus}
          helperText="정기 상여금 연 총액 (3/12개월분이 평균임금에 자동 반영됩니다)"
        />

        <CurrencyInput
          id="sev-leave"
          label="미사용 연차수당"
          value={unusedLeavePay}
          onChange={setUnusedLeavePay}
          helperText="전년도 미사용 연차에 대해 지급받은 수당 (3/12개월분 반영)"
        />

        <CurrencyInput
          id="sev-ordinary"
          label="1일 통상임금 (선택 비교용)"
          value={ordinaryDailyWage}
          onChange={setOrdinaryDailyWage}
          helperText="입력 시 1일 평균임금과 비교해 더 높은 금액을 자동 적용합니다."
        />
      </div>

      {/* Result Card */}
      <div className="flex flex-col gap-5 lg:col-span-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              세후 실수령 예상 퇴직금
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-100">
              재직 {result.totalDays.toLocaleString("ko-KR")}일
            </span>
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatKRW(result.netSeverance)}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            세전 퇴직금 {formatKRW(result.grossSeverance)} · 예상 세금{" "}
            {formatKRW(result.totalTax)}
          </p>
        </div>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        {!result.isEligible && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-950">
            <strong>퇴직금 수급 요건 미충족:</strong> 법정 퇴직금은 계속근로기간{" "}
            <strong>1년(365일) 이상</strong>인 경우에만 발생합니다. 현재
            재직일수는 {result.totalDays.toLocaleString("ko-KR")}일입니다.
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">
            임금 및 퇴직소득세 상세 내역
          </h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  총 재직일수 / 근속연수(세법상 올림)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold whitespace-nowrap">
                  {result.totalDays.toLocaleString("ko-KR")}일 /{" "}
                  {result.serviceYearsRoundedUp}년
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  1일 평균임금 ({result.threeMonthDays}일 기준)
                </td>
                <td className="py-2.5 text-right font-mono font-semibold whitespace-nowrap">
                  {formatKRW(result.averageDailyWage)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  최종 적용 1일 임금
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-blue-700 whitespace-nowrap">
                  {formatKRW(result.appliedDailyWage)}
                  {result.usedOrdinaryWage ? " (통상임금)" : ""}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  세전 예상 퇴직금
                </td>
                <td className="py-2.5 text-right font-mono font-semibold whitespace-nowrap">
                  {formatKRW(result.grossSeverance)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  근속연수공제 ({result.serviceYearsRoundedUp}년)
                </td>
                <td className="py-2.5 text-right font-mono text-emerald-700 whitespace-nowrap">
                  {formatKRW(result.serviceYearDeduction)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-600">
                  퇴직소득세 + 지방소득세
                </td>
                <td className="py-2.5 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                  -{formatKRW(result.totalTax)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                <td className="pt-3.5">세후 실수령 예상 퇴직금</td>
                <td className="pt-3.5 text-right font-mono text-base text-blue-700 whitespace-nowrap">
                  {formatKRW(result.netSeverance)}
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
