"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DSR_LIMITS } from "@/constants/rates";
import { useCalculatorBridge } from "@/hooks/useCalculatorBridge";
import {
  calculateAcquisitionTax,
  type HouseCount,
} from "@/lib/calculators/acquisition-tax";
import {
  calculateBrokerageFee,
  type VatType,
} from "@/lib/calculators/brokerage-fee";
import { calculateDsr, type StressRateOption } from "@/lib/calculators/dsr";
import { formatKRW, formatKoreanUnit, formatPercent } from "@/lib/format";
import type {
  BridgeHouseCount,
  BridgeTab,
  PropertyBridgeParams,
} from "@/types/calculator-bridge";
import { CurrencyInput } from "@/components/calculators/CurrencyInput";

interface EmbeddedFinanceCalculatorProps {
  initialParams: PropertyBridgeParams;
}

const HOUSE_COUNT_MAP: Record<BridgeHouseCount, HouseCount> = {
  "1": "1",
  "2": "2",
  "3+": "3plus",
};

export function EmbeddedFinanceCalculator({
  initialParams,
}: EmbeddedFinanceCalculatorProps) {
  const { state, updateState, resetToInitial } = useCalculatorBridge({
    initialParams,
  });

  const [stressRate, setStressRate] = useState<StressRateOption>(0.75);
  const [vatType, setVatType] = useState<VatType>("general");
  const [copiedLink, setCopiedLink] = useState(false);

  const isOfficetel = state.source === "officetel";
  const isSubscription = state.source === "subscription";

  // 1) 취득세 계산
  const acqResult = useMemo(
    () =>
      calculateAcquisitionTax({
        propertyType: isOfficetel ? "officetel" : "house",
        price: state.price,
        houseCount: HOUSE_COUNT_MAP[state.houseCount],
        isRegulatedArea: state.isRegulatedArea,
        isFirstHome: state.isFirstHome,
        areaType: state.area <= 85 ? "under85" : "over85",
      }),
    [
      isOfficetel,
      state.price,
      state.houseCount,
      state.isRegulatedArea,
      state.isFirstHome,
      state.area,
    ]
  );

  // 2) DSR 및 필요 최소 연소득 역산
  const loanAmount = Math.round(state.price * (state.ltvPercent / 100));
  const dsrResult = useMemo(
    () =>
      calculateDsr({
        annualIncome: state.annualIncome,
        loanAmount,
        interestRate: 4.2,
        loanYears: 30,
        repaymentMethod: "equalPrincipalInterest",
        stressRate,
        existingAnnualDebtService: 0,
      }),
    [state.annualIncome, loanAmount, stressRate]
  );

  const minRequiredIncome = Math.round(
    dsrResult.totalAnnualDebtService / (DSR_LIMITS.tier1BankLimit / 100)
  );

  // 3) 중개보수 계산
  const brokerageResult = useMemo(
    () =>
      calculateBrokerageFee({
        dealType: "sale",
        propertyType: isOfficetel ? "officetel" : "house",
        amount: state.price,
        monthlyRent: 0,
        vatType,
      }),
    [isOfficetel, state.price, vatType]
  );

  async function handleCopyShareLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch {
        setCopiedLink(false);
      }
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Top Instant Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 text-white sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-200">
                3호기 통합 계산 위젯
              </span>
              {isOfficetel && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
                  오피스텔 4.6% 기본 적용
                </span>
              )}
              {isSubscription && (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
                  분양권 · 입주 잔금 시점 취득세 기준
                </span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-bold sm:text-xl">
              {state.name} 자금 · 세금 · 대출 시뮬레이션
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              예상 취득세{" "}
              <strong className="text-white">
                {formatKoreanUnit(acqResult.totalTax)}
              </strong>{" "}
              / 필요 최소 연봉{" "}
              <strong className="text-emerald-300">
                {formatKoreanUnit(minRequiredIncome)}
              </strong>{" "}
              / 예상 중개보수{" "}
              <strong className="text-blue-200">
                {formatKoreanUnit(brokerageResult.totalCost)}
              </strong>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                copiedLink
                  ? "bg-emerald-600 text-white"
                  : "border border-white/25 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {copiedLink ? "링크 복사 완료!" : "계산 결과 링크 복사"}
            </button>
            <button
              type="button"
              onClick={resetToInitial}
              className="rounded-xl border border-white/20 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 3 Tabs */}
      <div
        className="grid grid-cols-3 border-b border-slate-200 bg-slate-50"
        role="tablist"
        aria-label="계산기 탭"
      >
        {(
          [
            { id: "tax", label: "취득세 자동계산" },
            { id: "dsr", label: "필요 연봉(DSR) 역산" },
            { id: "brokerage", label: "중개보수 계산" },
          ] as Array<{ id: BridgeTab; label: string }>
        ).map((t) => {
          const active = state.tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => updateState({ tab: t.id })}
              className={`border-b-2 px-2 py-3.5 text-xs font-bold transition-colors sm:text-sm ${
                active
                  ? "border-slate-900 bg-white text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="p-5 sm:p-6">
        {/* Shared Price Input */}
        <div className="mb-6 grid gap-4 border-b border-slate-100 pb-5 sm:grid-cols-2">
          <CurrencyInput
            id="bridge-price"
            label={isSubscription ? "예상 분양가 (원)" : "거래금액 (원)"}
            value={state.price}
            onChange={(val) => updateState({ price: val })}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="bridge-area"
              className="text-sm font-semibold text-slate-800"
            >
              전용면적 (㎡)
            </label>
            <div className="relative">
              <input
                id="bridge-area"
                type="number"
                step={0.1}
                min={1}
                value={state.area}
                onChange={(e) =>
                  updateState({
                    area: Math.max(1, Number(e.target.value) || 1),
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-right font-mono text-base font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-slate-500">
                ㎡
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {state.area <= 85
                ? "85㎡ 이하 (일반세율 농어촌특별세 0% 비과세)"
                : "85㎡ 초과 (농어촌특별세 0.2% 부과)"}
            </p>
          </div>
        </div>

        {/* TAB 1: 취득세 */}
        {state.tab === "tax" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {!isOfficetel && (
                <>
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">
                      취득 후 보유 주택 수
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["1", "2", "3+"] as const).map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => updateState({ houseCount: cnt })}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                            state.houseCount === cnt
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {cnt === "1"
                            ? "1주택"
                            : cnt === "2"
                              ? "2주택"
                              : "3주택+"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm">
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={state.isRegulatedArea}
                        onChange={(e) =>
                          updateState({ isRegulatedArea: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                      <span className="font-medium text-slate-800">
                        조정대상지역 내 주택
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={state.isFirstHome}
                        onChange={(e) =>
                          updateState({ isFirstHome: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                      <span className="font-medium text-slate-800">
                        생애최초 감면 (최대 200만 원)
                      </span>
                    </label>
                  </div>
                </>
              )}

              {isSubscription && (
                <p className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs leading-relaxed text-blue-900">
                  <strong>분양권 취득세 안내:</strong> 청약 당첨 시점이 아닌
                  준공 후 잔금지급일(또는 등기일) 기준으로 취득세가 부과되며,
                  당시 보유 주택 수에 따라 세율이 결정됩니다.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-sm font-bold text-slate-900">
                  총 납부 예상 취득세
                </span>
                <span className="font-mono text-xl font-bold text-blue-700">
                  {formatKRW(acqResult.totalTax)}
                </span>
              </div>
              <dl className="mt-3 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">적용 기준</dt>
                  <dd className="font-semibold text-slate-900">
                    {acqResult.taxCategoryLabel}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    취득세 ({formatPercent(acqResult.acquisitionTaxRate, 2)})
                  </dt>
                  <dd className="font-mono font-semibold">
                    {formatKRW(acqResult.acquisitionTax)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    지방교육세 ({formatPercent(acqResult.educationTaxRate, 2)})
                  </dt>
                  <dd className="font-mono font-semibold">
                    {formatKRW(acqResult.educationTax)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    농어촌특별세 ({formatPercent(acqResult.ruralTaxRate, 2)})
                  </dt>
                  <dd className="font-mono font-semibold">
                    {formatKRW(acqResult.ruralTax)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 text-right">
                <Link
                  href="/real-estate/acquisition-tax"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  취득세 상세 계산기 페이지로 이동 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 필요 연봉(DSR) 역산 */}
        {state.tab === "dsr" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <CurrencyInput
                id="bridge-income"
                label="내 세전 연소득 (원)"
                value={state.annualIncome}
                onChange={(val) => updateState({ annualIncome: val })}
              />

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm font-semibold text-slate-800">
                  <span>대출 비율 (LTV {state.ltvPercent}%)</span>
                  <span className="font-mono text-blue-700">
                    {formatKoreanUnit(loanAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={5}
                  value={state.ltvPercent}
                  onChange={(e) =>
                    updateState({ ltvPercent: Number(e.target.value) })
                  }
                  className="w-full accent-slate-900"
                  aria-label="LTV 비율"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-800">
                  스트레스 DSR 가산금리
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {DSR_LIMITS.stressRatePresets.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setStressRate(rate)}
                      className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                        stressRate === rate
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {rate === 0 ? "0% (미적용)" : `+${rate}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-sm font-bold text-slate-900">
                  DSR 40% 통과 필요 최소 연봉
                </span>
                <span className="font-mono text-xl font-bold text-emerald-700">
                  {formatKoreanUnit(minRequiredIncome)}
                </span>
              </div>
              <dl className="mt-3 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">내 연소득 기준 예상 DSR</dt>
                  <dd
                    className={`font-mono font-bold ${
                      dsrResult.dsrRatio <= 40
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {formatPercent(dsrResult.dsrRatio, 2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    월 평균 상환액 (4.2% · 30년)
                  </dt>
                  <dd className="font-mono font-semibold">
                    {formatKRW(dsrResult.actualMonthlyPaymentAvg)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">DSR 기준 연간 원리금</dt>
                  <dd className="font-mono font-semibold">
                    {formatKRW(dsrResult.totalAnnualDebtService)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 text-right">
                <Link
                  href="/finance/dsr"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  DSR 상세 계산기 페이지로 이동 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 중개보수 */}
        {state.tab === "brokerage" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">
                  부가가치세 과세유형
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "general", label: "일반(10%)" },
                      { value: "simple", label: "간이(4%)" },
                      { value: "exempt", label: "면세(0%)" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setVatType(opt.value)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors ${
                        vatType === opt.value
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                법정 상한요율({formatPercent(brokerageResult.maxRate, 2)}) 기준
                계산이며, 실제 계약 시 중개사와 상한 이내에서 협의 가능합니다.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-sm font-bold text-slate-900">
                  총 예상 중개 비용
                </span>
                <span className="font-mono text-xl font-bold text-blue-700">
                  {formatKRW(brokerageResult.totalCost)}
                </span>
              </div>
              <dl className="mt-3 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600">적용 상한요율</dt>
                  <dd className="font-mono font-semibold">
                    {formatPercent(brokerageResult.appliedRate, 2)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">최대 중개보수</dt>
                  <dd className="font-mono font-semibold">
                    {formatKRW(brokerageResult.brokerageFee)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600">
                    부가가치세 ({brokerageResult.vatRate}%)
                  </dt>
                  <dd className="font-mono font-semibold">
                    {formatKRW(brokerageResult.vatAmount)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 text-right">
                <Link
                  href="/real-estate/brokerage-fee"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  중개보수 상세 계산기 페이지로 이동 →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
