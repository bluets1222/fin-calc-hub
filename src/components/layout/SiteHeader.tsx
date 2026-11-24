"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  REAL_ESTATE_TAX_NAV,
  SALARY_FINANCE_NAV,
  SITE_NAME,
} from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRealEstateGroup = REAL_ESTATE_TAX_NAV.some(
    (item) => pathname === item.href
  );
  const isSalaryFinanceGroup = SALARY_FINANCE_NAV.some(
    (item) => pathname === item.href
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-85"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white shadow-sm">
            BF
          </span>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none tracking-tight text-slate-900">
              {SITE_NAME}
            </span>
            <span className="text-[11px] font-medium leading-tight text-slate-500">
              부동산·세금·금융 계산기
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="주 메뉴">
          {/* Group 1: 부동산·세금 */}
          <div className="group relative">
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isRealEstateGroup
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>부동산·세금</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-60 pt-1.5 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                {REAL_ESTATE_TAX_NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Group 2: 연봉·금융 */}
          <div className="group relative">
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isSalaryFinanceGroup
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>연봉·금융</span>
              <span className="text-[10px] opacity-70">▼</span>
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-60 pt-1.5 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                {SALARY_FINANCE_NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <Link
            href="/subscription"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/subscription")
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            청약알림
          </Link>

          <Link
            href="/real-estate"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/real-estate" || pathname.startsWith("/complex")
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            실거래가 조회
          </Link>

          <Link
            href="/guide"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/guide")
                ? "bg-blue-50 text-blue-700"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            세무·금융 가이드
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="메뉴 열기"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="모바일 메뉴">
            <div>
              <p className="mb-1.5 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                부동산 · 세금 계산기
              </p>
              <div className="flex flex-col gap-1">
                {REAL_ESTATE_TAX_NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`text-xs ${active ? "text-slate-300" : "text-slate-400"}`}
                      >
                        {item.category}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-1.5 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                연봉 · 금융 계산기
              </p>
              <div className="flex flex-col gap-1">
                {SALARY_FINANCE_NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`text-xs ${active ? "text-slate-300" : "text-slate-400"}`}
                      >
                        {item.category}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-2">
              <Link
                href="/subscription"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  pathname.startsWith("/subscription")
                    ? "bg-slate-900 text-white"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                청약알림 (분양정보)
              </Link>
              <Link
                href="/real-estate"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  pathname === "/real-estate" || pathname.startsWith("/complex")
                    ? "bg-slate-900 text-white"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                실거래가 조회 (아파트·오피스텔)
              </Link>
              <Link
                href="/guide"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  pathname.startsWith("/guide")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                세무·금융 가이드 전체 보기
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
