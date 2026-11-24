"use client";

import Link from "next/link";
import { DSR_LIMITS } from "@/constants/rates";
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax";
import { calculateDsr } from "@/lib/calculators/dsr";
import { formatKRW, formatKoreanUnit } from "@/lib/format";

export interface CompareComplexCandidate {
  key: string;
  routeId: string;
  type: "apt" | "officetel";
  name: string;
  sigunguName: string;
  dong: string;
  selectedArea: number;
  latestPriceManwon: number;
  dealDate: string;
}

interface ComplexCompareModalProps {
  items: CompareComplexCandidate[];
  onClose: () => void;
  onRemove: (key: string) => void;
}

export function ComplexCompareModal({
  items,
  onClose,
  onRemove,
}: ComplexCompareModalProps) {
  if (items.length === 0) return null;

  const computed = items.map((item) => {
    const priceWon = item.latestPriceManwon * 10_000;
    const pyeong = Math.max(1, item.selectedArea / 3.3058);
    const pricePerPyeongManwon = Math.round(item.latestPriceManwon / pyeong);

    const acq = calculateAcquisitionTax({
      propertyType: item.type === "officetel" ? "officetel" : "house",
      price: priceWon,
      houseCount: "1",
      isRegulatedArea: false,
      isFirstHome: false,
      areaType: item.selectedArea <= 85 ? "under85" : "over85",
    });

    // LTV 60%, 금리 4.2%, 30년, 스트레스 +0.75% 기준 DSR 40% 통과 필요 연봉
    const assumedLoan = Math.round(priceWon * 0.6);
    const dsr = calculateDsr({
      annualIncome: 100_000_000,
      loanAmount: assumedLoan,
      interestRate: 4.2,
      loanYears: 30,
      repaymentMethod: "equalPrincipalInterest",
      stressRate: 0.75,
      existingAnnualDebtService: 0,
    });
    const requiredIncomeWon = Math.round(
      dsr.totalAnnualDebtService / (DSR_LIMITS.tier1BankLimit / 100)
    );

    return {
      ...item,
      pyeong: Math.round(pyeong * 10) / 10,
      pricePerPyeongManwon,
      acqTotalTax: acq.totalTax,
      acqRate: acq.totalRate,
      requiredIncomeWon,
    };
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="관심 단지 비교"
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              관심 단지 나란히 비교 ({computed.length}개)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              LTV 60% · 금리 4.2% · 30년 · 스트레스 DSR(+0.75%) 기준 비교입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            닫기 ✕
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-32 px-3 py-3 text-xs font-semibold text-slate-500">
                  비교 항목
                </th>
                {computed.map((c) => (
                  <th key={c.key} className="px-3 py-3 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {c.type === "apt" ? "아파트" : "오피스텔"}
                        </span>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {c.name}
                        </p>
                        <p className="text-[11px] font-normal text-slate-500">
                          {c.sigunguName} {c.dong}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(c.key)}
                        className="text-xs text-slate-400 hover:text-rose-600"
                        title="비교에서 제거"
                      >
                        삭제
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="px-3 py-3 text-xs font-semibold text-slate-500">
                  선택 평형
                </td>
                {computed.map((c) => (
                  <td key={c.key} className="px-3 py-3 font-mono font-semibold">
                    {c.selectedArea}㎡ (약 {c.pyeong}평)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-3 text-xs font-semibold text-slate-500">
                  최근 실거래가
                </td>
                {computed.map((c) => (
                  <td
                    key={c.key}
                    className="px-3 py-3 font-mono text-base font-extrabold text-blue-700"
                  >
                    {formatKoreanUnit(c.latestPriceManwon * 10_000)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-3 text-xs font-semibold text-slate-500">
                  평당가 (3.3㎡)
                </td>
                {computed.map((c) => (
                  <td key={c.key} className="px-3 py-3 font-mono font-semibold">
                    {c.pricePerPyeongManwon.toLocaleString("ko-KR")}만 원/평
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-3 text-xs font-semibold text-slate-500">
                  예상 취득세 (1주택)
                </td>
                {computed.map((c) => (
                  <td key={c.key} className="px-3 py-3 font-mono font-semibold">
                    {formatKRW(c.acqTotalTax)}
                    <span className="ml-1 text-[11px] font-normal text-slate-500">
                      ({c.acqRate}%)
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-3 text-xs font-semibold text-slate-500">
                  DSR 40% 필요 연봉
                </td>
                {computed.map((c) => (
                  <td
                    key={c.key}
                    className="px-3 py-3 font-mono font-bold text-emerald-700"
                  >
                    약 {formatKoreanUnit(c.requiredIncomeWon)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-3 text-xs font-semibold text-slate-500">
                  상세 분석
                </td>
                {computed.map((c) => (
                  <td key={c.key} className="px-3 py-3">
                    <Link
                      href={`/real-estate/${c.routeId}?tab=tax&price=${c.latestPriceManwon * 10_000}&area=${c.selectedArea}`}
                      className="inline-block rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      상세 계산기 →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
