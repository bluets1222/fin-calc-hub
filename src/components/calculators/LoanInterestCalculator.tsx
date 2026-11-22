"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import {
  calculateLoanInterest,
  type LoanRepaymentType,
} from "@/lib/calculators/loan-interest";
import { formatKRW } from "@/lib/format";
import { CurrencyInput } from "./CurrencyInput";
import { PresetButtons, type PresetOption } from "./PresetButtons";
import { CopyResultButton } from "./CopyResultButton";

const PRINCIPAL_PRESETS: PresetOption[] = [
  { label: "+1억", amount: 100_000_000 },
  { label: "+5천만", amount: 50_000_000 },
  { label: "+1천만", amount: 10_000_000 },
];

export function LoanInterestCalculator() {
  const [principal, setPrincipal] = useState<number>(200_000_000);
  const [annualRate, setAnnualRate] = useState<number>(4.5);
  const [months, setMonths] = useState<number>(120);
  const [graceMonths, setGraceMonths] = useState<number>(0);
  const [method, setMethod] = useState<LoanRepaymentType>("equalPI");
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const result = useMemo(
    () =>
      calculateLoanInterest({
        principal,
        annualRate,
        months,
        graceMonths,
        method,
      }),
    [principal, annualRate, months, graceMonths, method]
  );

  const methodLabel =
    method === "equalPI"
      ? "원리금균등상환"
      : method === "equalP"
        ? "원금균등상환"
        : "만기일시상환";

  const getSummaryText = () =>
    [
      "[Beesvia Fin 대출 이자 계산 결과]",
      `• 대출 원금: ${formatKRW(principal)} (연 ${annualRate}%, ${months}개월, 거치 ${graceMonths}개월)`,
      `• 상환 방식: ${methodLabel}`,
      `• 월 평균 납입금: ${formatKRW(result.avgMonthlyPayment)}`,
      `• 총 대출이자: ${formatKRW(result.totalInterest)}`,
      `▶ 원리금 총합계: ${formatKRW(result.totalRepayment)}`,
      "https://fin.beesvia.com/finance/loan-interest",
    ].join("\n");

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Card */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-6">
          <div className="space-y-2">
            <CurrencyInput
              id="loan-principal"
              label="대출 원금"
              value={principal}
              onChange={setPrincipal}
            />
            <PresetButtons
              presets={PRINCIPAL_PRESETS}
              onAdd={(amt) => setPrincipal((prev) => prev + amt)}
              onReset={() => setPrincipal(0)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label
                htmlFor="loan-rate"
                className="text-sm font-semibold text-slate-800"
              >
                연 이자율 (%)
              </label>
              <div className="relative">
                <input
                  id="loan-rate"
                  type="number"
                  step={0.1}
                  min={0}
                  max={30}
                  value={annualRate}
                  onChange={(e) =>
                    setAnnualRate(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-7 text-right font-mono text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-500">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="loan-months"
                className="text-sm font-semibold text-slate-800"
              >
                대출 기간 (개월)
              </label>
              <div className="relative">
                <input
                  id="loan-months"
                  type="number"
                  step={12}
                  min={1}
                  max={600}
                  value={months}
                  onChange={(e) => {
                    const next = Math.min(
                      600,
                      Math.max(1, Number(e.target.value) || 1)
                    );
                    setMonths(next);
                    if (graceMonths >= next) {
                      setGraceMonths(Math.max(0, next - 1));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-right font-mono text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-500">
                  개월
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="loan-grace"
                className="text-sm font-semibold text-slate-800"
              >
                거치 기간 (개월)
              </label>
              <div className="relative">
                <input
                  id="loan-grace"
                  type="number"
                  step={1}
                  min={0}
                  max={Math.max(0, months - 1)}
                  value={graceMonths}
                  onChange={(e) =>
                    setGraceMonths(
                      Math.min(
                        Math.max(0, months - 1),
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-right font-mono text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-slate-500">
                  개월
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "1년(12개월)", m: 12 },
              { label: "3년(36개월)", m: 36 },
              { label: "5년(60개월)", m: 60 },
              { label: "10년(120개월)", m: 120 },
              { label: "30년(360개월)", m: 360 },
            ].map((item) => (
              <button
                key={item.m}
                type="button"
                onClick={() => {
                  setMonths(item.m);
                  if (graceMonths >= item.m) setGraceMonths(0);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  months === item.m
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              상환 방식
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  { value: "equalPI", label: "원리금균등" },
                  { value: "equalP", label: "원금균등" },
                  { value: "bullet", label: "만기일시" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMethod(opt.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    method === opt.value
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
                총 대출이자 ({methodLabel})
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-blue-100">
                {months}개월 ({Math.round((months / 12) * 10) / 10}년)
              </span>
            </div>
            <p className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
              {formatKRW(result.totalInterest)}
            </p>
            <p className="mt-2 text-xs text-slate-300">
              월 평균 납입금 {formatKRW(result.avgMonthlyPayment)} · 원리금
              총합계 {formatKRW(result.totalRepayment)}
            </p>
          </div>

          <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              3가지 상환 방식별 총이자 비교
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2.5 font-semibold">상환 방식</th>
                    <th className="pb-2.5 text-right font-semibold">월 평균</th>
                    <th className="pb-2.5 text-right font-semibold">총 이자</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {result.comparisons.map((comp) => {
                    const isSelected = comp.method === method;
                    return (
                      <tr
                        key={comp.method}
                        className={isSelected ? "bg-blue-50/70 font-bold" : ""}
                      >
                        <td className="py-3 pr-2">
                          {comp.label}
                          {isSelected && (
                            <span className="ml-1.5 rounded bg-blue-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              선택됨
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono whitespace-nowrap">
                          {formatKRW(comp.avgMonthlyPayment)}
                        </td>
                        <td className="py-3 text-right font-mono text-blue-700 whitespace-nowrap">
                          {formatKRW(comp.totalInterest)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowSchedule((prev) => !prev)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
              >
                {showSchedule
                  ? "상환 스케줄 접기 ▲"
                  : `회차별 상환 스케줄 펼치기 (${result.schedule.length}개월) ▼`}
              </button>
              <CopyResultButton getSummaryText={getSummaryText} />
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Schedule Table */}
      {showSchedule && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900">
              회차별 납입 원금 · 이자 · 잔액 스케줄 ({methodLabel})
            </h3>
            <span className="text-xs text-slate-500">
              총 {result.schedule.length}회차
            </span>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <table className="w-full min-w-[540px] text-left text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2.5 font-semibold">회차</th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    납입 원금
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    납입 이자
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    월 납입 합계
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    남은 잔액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {result.schedule.map((row) => (
                  <tr
                    key={row.month}
                    className={row.isGrace ? "bg-amber-50/40" : ""}
                  >
                    <td className="px-3 py-2 font-sans font-medium">
                      {row.month}회차
                      {row.isGrace && (
                        <span className="ml-1 text-[10px] text-amber-700">
                          (거치)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatKRW(row.principalPayment)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {formatKRW(row.interestPayment)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">
                      {formatKRW(row.totalPayment)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {formatKRW(row.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
