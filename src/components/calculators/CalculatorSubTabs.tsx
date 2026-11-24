"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUB_TABS = [
  { label: "취득세", href: "/real-estate/acquisition-tax" },
  { label: "중개보수", href: "/real-estate/brokerage-fee" },
  { label: "증여세", href: "/tax/gift-tax" },
  { label: "DSR 대출", href: "/finance/dsr" },
  { label: "대출이자", href: "/finance/loan-interest" },
  { label: "예적금 이자", href: "/finance/savings" },
  { label: "연봉 실수령", href: "/salary/net-pay" },
  { label: "퇴직금", href: "/salary/severance" },
];

/**
 * 계산기 영역(부동산 세금 · 연봉·금융) 상단에 표시되는 빠른 전환 서브 탭 바입니다.
 */
export function CalculatorSubTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="계산기 빠른 전환"
      className="mb-6 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs"
    >
      {SUB_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              active
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
