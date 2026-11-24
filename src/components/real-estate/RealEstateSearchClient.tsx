"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatKoreanUnit } from "@/lib/format";
import type { SearchIndexItem } from "@/lib/real-estate-data";

interface RealEstateSearchClientProps {
  items: SearchIndexItem[];
}

export function RealEstateSearchClient({ items }: RealEstateSearchClientProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "apt" | "officetel" | "sub"
  >("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((item) => {
        if (typeFilter !== "all" && item.type !== typeFilter) return false;
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.dong.toLowerCase().includes(q)
        );
      })
      .slice(0, 60);
  }, [items, query, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="단지명, 시군구(예: 강남구), 법정동(예: 역삼동)을 검색하세요..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
            aria-label="단지명 또는 지역 검색"
          />
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { value: "all", label: "전체" },
                { value: "apt", label: "아파트" },
                { value: "officetel", label: "오피스텔" },
                { value: "sub", label: "청약" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTypeFilter(opt.value)}
                className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                  typeFilter === opt.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2.5 text-xs text-slate-500">
          전체 {items.length.toLocaleString("ko-KR")}개 단지·공고 중{" "}
          {filtered.length}건 표시 (최대 60건)
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const href =
            item.type === "sub"
              ? `/subscription/${item.id}`
              : `/complex/${item.id}`;
          const typeLabel =
            item.type === "apt"
              ? "아파트"
              : item.type === "officetel"
                ? "오피스텔"
                : "청약공고";

          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.type === "apt"
                        ? "bg-blue-50 text-blue-800"
                        : item.type === "officetel"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {typeLabel}
                  </span>
                  <span className="text-xs text-slate-500">{item.dealDate}</span>
                </div>
                <h2 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700">
                  {item.name}
                </h2>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                  {item.region} {item.dong}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">
                  {item.type === "sub" ? "청약 상세" : "최근 실거래가"}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {item.latestPrice > 0
                    ? formatKoreanUnit(item.latestPrice * 10_000)
                    : "일정 확인 →"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
