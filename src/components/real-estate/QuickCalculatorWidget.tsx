"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax";
import { calculateDsr } from "@/lib/calculators/dsr";
import { formatKRW, formatKoreanUnit, formatPercent } from "@/lib/format";

interface QuickCalculatorWidgetProps {
  title: string;
  defaultPriceWon: number;
  isOfficetel?: boolean;
  isUnder85?: boolean;
}

/**
 * 단지/청약 상세 페이지 중단에서 취득세·DSR을 즉시 시뮬레이션하고
 * 전용 계산기로 이동할 수 있는 3호기 연동 위젯입니다.
 */
export function QuickCalculatorWidget({
  title,
  defaultPriceWon,
  isOfficetel = false,
  isUnder85 = true,
}: QuickCalculatorWidgetProps) {
  const [ltvPercent, setLtvPercent] = useState<number>(60);
  const [annualIncome, setAnnualIncome] = useState<number>(80_000_000);

  const acq = useMemo(
    () =>
      calculateAcquisitionTax({
        propertyType: isOfficetel ? "officetel" : "house",
        price: defaultPriceWon,
        houseCount: "1",
        isRegulatedArea: false,
        isFirstHome: false,
        areaType: isUnder85 ? "under85" : "over85",
      }),
    [defaultPriceWon, isOfficetel, isUnder85]
  );

  const loanAmount = Math.round(defaultPriceWon * (ltvPercent / 100));
  const dsr = useMemo(
    () =>
      calculateDsr({
        annualIncome,
        loanAmount,
        interestRate: 4.2,
        loanYears: 30,
        repaymentMethod: "equalPrincipalInterest",
        stressRate: 0.75,
        existingAnnualDebtService: 0,
      }),
    [annualIncome, loanAmount]
  );

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-md sm:p-7">
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-200">
            3호기 세금·대출 연동 위젯
          </span>
          <h2 className="mt-2 text-lg font-bold sm:text-xl">{title}</h2>
          <p className="mt-1 text-xs text-slate-300">
            기준 가액 {formatKoreanUnit(defaultPriceWon)} (1주택·금리 4.2%·30년·스트레스
            +0.75% 가정)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/real-estate/acquisition-tax"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            이 가격으로 취득세 바로 계산하기 →
          </Link>
          <Link
            href="/finance/dsr"
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            DSR 정밀 계산 →
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white/10 p-3.5">
          <p className="text-xs text-blue-200">예상 취득세 합계</p>
          <p className="mt-1 font-mono text-lg font-bold">
            {formatKRW(acq.totalTax)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-300">
            세율 {formatPercent(acq.totalRate, 2)}
          </p>
        </div>

        <div className="rounded-xl bg-white/10 p-3.5">
          <p className="text-xs text-blue-200">가정 대출금 (LTV {ltvPercent}%)</p>
          <p className="mt-1 font-mono text-lg font-bold">
            {formatKoreanUnit(loanAmount)}
          </p>
          <input
            type="range"
            min={20}
            max={70}
            step={10}
            value={ltvPercent}
            onChange={(e) => setLtvPercent(Number(e.target.value))}
            className="mt-1.5 w-full accent-blue-400"
            aria-label="LTV 비율 조절"
          />
        </div>

        <div className="rounded-xl bg-white/10 p-3.5">
          <p className="text-xs text-blue-200">월 예상 원리금 상환액</p>
          <p className="mt-1 font-mono text-lg font-bold">
            {formatKRW(dsr.actualMonthlyPaymentAvg)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-300">
            원리금균등 · 30년 기준
          </p>
        </div>

        <div className="rounded-xl bg-white/10 p-3.5">
          <div className="flex items-center justify-between text-xs text-blue-200">
            <span>예상 DSR</span>
            <span>연소득 {formatKoreanUnit(annualIncome)}</span>
          </div>
          <p
            className={`mt-1 font-mono text-lg font-bold ${
              dsr.dsrRatio <= 40 ? "text-emerald-300" : "text-amber-300"
            }`}
          >
            {formatPercent(dsr.dsrRatio, 1)}
          </p>
          <input
            type="range"
            min={40_000_000}
            max={200_000_000}
            step={10_000_000}
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="mt-1.5 w-full accent-emerald-400"
            aria-label="세전 연소득 조절"
          />
        </div>
      </div>
    </div>
  );
}
