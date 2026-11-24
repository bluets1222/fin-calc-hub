"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SubscriptionItem } from "@/lib/real-estate-data";

interface SubscriptionListClientProps {
  items: SubscriptionItem[];
}

type StatusFilter = "all" | "active" | "upcoming" | "closed";

export function SubscriptionListClient({ items }: SubscriptionListClientProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.region) set.add(item.region);
    }
    return Array.from(set).sort();
  }, [items]);

  const counts = useMemo(
    () => ({
      all: items.length,
      active: items.filter((i) => i.status === "active").length,
      upcoming: items.filter((i) => i.status === "upcoming").length,
      closed: items.filter((i) => i.status === "closed").length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (regionFilter !== "all" && item.region !== regionFilter) return false;
      return true;
    });
  }, [items, statusFilter, regionFilter]);

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs & Region Select */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="청약 상태 필터"
        >
          {(
            [
              { key: "all", label: `전체 (${counts.all})` },
              { key: "active", label: `청약접수중 (${counts.active})` },
              { key: "upcoming", label: `청약예정 (${counts.upcoming})` },
              { key: "closed", label: `최근마감 (${counts.closed})` },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          aria-label="공급지역 선택"
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-900 focus:outline-none sm:text-sm"
        >
          <option value="all">전국 전체 지역</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State with Recommended Filter Chips */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-800">
            선택한 조건에 해당하는 청약 공고가 없습니다.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            아래 추천 필터를 눌러 다른 공고를 확인해 보세요.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setRegionFilter("서울");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              #서울 청약
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("active");
                setRegionFilter("all");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              #접수중 전체
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setRegionFilter("all");
              }}
              className="rounded-full border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              필터 초기화
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const badge =
              item.status === "active"
                ? {
                    text:
                      item.dDay === 0
                        ? "오늘 마감 (D-Day)"
                        : `접수 중 · D-${item.dDay}`,
                    cls: "bg-emerald-600 text-white",
                  }
                : item.status === "upcoming"
                  ? {
                      text: `접수 예정 · D-${item.dDay}`,
                      cls: "bg-blue-600 text-white",
                    }
                  : {
                      text: `마감 (${Math.abs(item.dDay)}일 전)`,
                      cls: "bg-slate-200 text-slate-700",
                    };

            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                <Link href={`/subscription/${item.id}`} className="group block">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.cls}`}
                    >
                      {badge.text}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.region}
                    </span>
                  </div>
                  <h2 className="mt-3 text-[17px] font-bold leading-snug text-slate-900 group-hover:text-blue-700">
                    {item.name}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {item.address}
                  </p>

                  <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-medium text-slate-500">
                      총 공급세대
                    </span>
                    <span className="font-mono text-lg font-extrabold text-blue-700">
                      {item.totalCount.toLocaleString("ko-KR")}세대
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>접수기간</span>
                    <span className="font-mono">
                      {item.applyStart} ~ {item.applyEnd}
                    </span>
                  </div>
                </Link>

                {/* One-Click Action Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <Link
                    href={`/subscription/${item.id}?tab=tax&price=600000000&area=84`}
                    className="rounded-xl bg-slate-100 px-2.5 py-2 text-center text-[11px] font-bold text-slate-800 transition-colors hover:bg-slate-200"
                  >
                    취득세 계산
                  </Link>
                  <Link
                    href={`/subscription/${item.id}?tab=dsr&price=600000000&area=84`}
                    className="rounded-xl bg-blue-50 px-2.5 py-2 text-center text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    DSR 한도 확인
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
