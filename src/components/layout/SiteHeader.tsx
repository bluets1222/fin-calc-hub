"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  REAL_ESTATE_TAX_NAV,
  SALARY_FINANCE_NAV,
  SITE_NAME,
} from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  const isSubscriptionActive = pathname.startsWith("/subscription");
  const isTaxActive =
    pathname === "/real-estate/acquisition-tax" ||
    pathname === "/real-estate/brokerage-fee" ||
    pathname.startsWith("/tax");
  const isRealEstateLookupActive =
    pathname === "/real-estate" ||
    (pathname.startsWith("/real-estate/") && !isTaxActive) ||
    pathname.startsWith("/complex");
  const isFinanceActive =
    pathname.startsWith("/finance") || pathname.startsWith("/salary");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-85"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white shadow-sm">
            BF
          </span>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none tracking-tight text-slate-900">
              {SITE_NAME}
            </span>
            <span className="text-[11px] font-medium leading-tight text-slate-500">
              청약·실거래·세금·금융
            </span>
          </div>
        </Link>

        {/* Desktop Primary 4-Tab Navigation: 탐색 -> 조회 -> 세금 -> 금융 */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="주 메뉴"
        >
          {/* 1) 청약 조회 */}
          <Link
            href="/subscription"
            className={`border-b-2 px-3.5 py-2 text-sm transition-colors ${
              isSubscriptionActive
                ? "border-slate-900 font-bold text-slate-900"
                : "border-transparent font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            청약 조회
          </Link>

          {/* 2) 실거래가 조회 */}
          <Link
            href="/real-estate"
            className={`border-b-2 px-3.5 py-2 text-sm transition-colors ${
              isRealEstateLookupActive
                ? "border-slate-900 font-bold text-slate-900"
                : "border-transparent font-medium text-slate-600 hover:text-slate-900"
            }`}
          >
            실거래가 조회
          </Link>

          {/* 3) 부동산 세금 (취득세·중개보수·증여세) */}
          <div className="group relative">
            <Link
              href="/real-estate/acquisition-tax"
              className={`inline-flex items-center gap-1 border-b-2 px-3.5 py-2 text-sm transition-colors ${
                isTaxActive
                  ? "border-slate-900 font-bold text-slate-900"
                  : "border-transparent font-medium text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>부동산 세금</span>
              <span className="text-[10px] opacity-60">▼</span>
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-56 pt-1.5 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                {REAL_ESTATE_TAX_NAV.filter(
                  (i) => i.href !== "/finance/dsr"
                ).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 4) 연봉·금융 (DSR·대출·연봉·퇴직·예적금) */}
          <div className="group relative">
            <Link
              href="/finance/dsr"
              className={`inline-flex items-center gap-1 border-b-2 px-3.5 py-2 text-sm transition-colors ${
                isFinanceActive
                  ? "border-slate-900 font-bold text-slate-900"
                  : "border-transparent font-medium text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>연봉·금융</span>
              <span className="text-[10px] opacity-60">▼</span>
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-56 pt-1.5 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <Link
                  href="/finance/dsr"
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === "/finance/dsr"
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  DSR·월 상환액 계산기
                </Link>
                {SALARY_FINANCE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Secondary Guide Link */}
        <Link
          href="/guide"
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
            pathname.startsWith("/guide")
              ? "bg-blue-50 text-blue-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          세무·금융 가이드
        </Link>
      </div>

      {/* Mobile Sticky 4-Tab Bar (햄버거 메뉴 없이 한 줄로 바로 터치 가능) */}
      <nav
        className="grid grid-cols-4 border-t border-slate-100 bg-white md:hidden"
        aria-label="모바일 빠른 탭"
      >
        <Link
          href="/subscription"
          className={`flex items-center justify-center border-b-2 py-2.5 text-xs transition-colors ${
            isSubscriptionActive
              ? "border-slate-900 font-bold text-slate-900"
              : "border-transparent font-medium text-slate-500"
          }`}
        >
          청약 조회
        </Link>
        <Link
          href="/real-estate"
          className={`flex items-center justify-center border-b-2 py-2.5 text-xs transition-colors ${
            isRealEstateLookupActive
              ? "border-slate-900 font-bold text-slate-900"
              : "border-transparent font-medium text-slate-500"
          }`}
        >
          실거래가
        </Link>
        <Link
          href="/real-estate/acquisition-tax"
          className={`flex items-center justify-center border-b-2 py-2.5 text-xs transition-colors ${
            isTaxActive
              ? "border-slate-900 font-bold text-slate-900"
              : "border-transparent font-medium text-slate-500"
          }`}
        >
          부동산 세금
        </Link>
        <Link
          href="/finance/dsr"
          className={`flex items-center justify-center border-b-2 py-2.5 text-xs transition-colors ${
            isFinanceActive
              ? "border-slate-900 font-bold text-slate-900"
              : "border-transparent font-medium text-slate-500"
          }`}
        >
          연봉·금융
        </Link>
      </nav>
    </header>
  );
}
