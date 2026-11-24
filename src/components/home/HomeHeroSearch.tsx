"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatKoreanUnit } from "@/lib/format";
import type { SearchIndexItem } from "@/lib/real-estate-data";

const RECOMMENDED_TAGS = ["강남구", "동대문구", "래미안", "자이", "오피스텔"];

/**
 * 메인 홈 Hero 섹션용 통합 검색바입니다.
 * 최초 입력/포커스 시 정적 인덱스(/data/search-index.json)를 1회 로드하여
 * 초기 HTML 용량 부담 없이 6,900여 개 단지·청약을 즉시 자동완성합니다.
 */
export function HomeHeroSearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchIndexItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function ensureIndexLoaded() {
    if (items !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/data/search-index.json");
      if (res.ok) {
        const data = (await res.json()) as SearchIndexItem[];
        setItems(data);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (query.trim().length > 0 && items === null) {
      void ensureIndexLoaded();
    }
  }, [query]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !items) return [];
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sido.toLowerCase().includes(q) ||
          item.sigungu.toLowerCase().includes(q) ||
          item.dong.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [items, query]);

  return (
    <div className="relative mt-6 max-w-2xl">
      <div className="relative flex items-center">
        <svg
          className="pointer-events-none absolute left-4 h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onFocus={() => {
            setOpen(true);
            void ensureIndexLoaded();
          }}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="단지명 또는 지역명 입력 (예: 동대문구, 래미안, 강남구)"
          className="w-full rounded-2xl border border-white/20 bg-white py-3.5 pl-12 pr-28 text-sm font-medium text-slate-900 shadow-lg placeholder:text-slate-400 focus:border-blue-400 focus:outline-none sm:text-base"
          aria-label="아파트, 오피스텔, 청약 통합 검색"
        />
        <Link
          href="/real-estate"
          className="absolute right-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 sm:text-sm"
        >
          전체 조회
        </Link>
      </div>

      {/* Autocomplete Dropdown */}
      {open && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
          {loading ? (
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          ) : matches.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다.
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto p-1.5">
              {matches.map((item) => {
                const href =
                  item.type === "sub"
                    ? `/subscription/${item.id}`
                    : `/real-estate/${item.id}`;
                const badge =
                  item.type === "apt"
                    ? "아파트"
                    : item.type === "officetel"
                      ? "오피스텔"
                      : "청약";
                return (
                  <li key={`hero-${item.type}-${item.id}`}>
                    <Link
                      href={href}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {badge}
                          </span>
                          <span className="truncate text-sm font-bold text-slate-900">
                            {item.name}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {item.sido} {item.sigungu} {item.dong}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-xs font-bold text-blue-700 sm:text-sm">
                        {item.latestPrice > 0
                          ? formatKoreanUnit(item.latestPrice * 10_000)
                          : "일정 보기"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Recommended Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400">추천 검색:</span>
        {RECOMMENDED_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              setOpen(true);
              void ensureIndexLoaded();
            }}
            className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-medium text-slate-200 transition-colors hover:bg-white/20"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
