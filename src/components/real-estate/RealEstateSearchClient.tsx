"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ComplexCompareModal,
  type CompareComplexCandidate,
} from "@/components/real-estate/ComplexCompareModal";
import { DSR_LIMITS } from "@/constants/rates";
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax";
import { calculateDsr } from "@/lib/calculators/dsr";
import { formatKRW, formatKoreanUnit } from "@/lib/format";
import type {
  RawTradeRecord,
  SearchIndexItem,
  SigunguTradeFile,
} from "@/lib/real-estate-data";
import {
  DEFAULT_SIDO,
  DEFAULT_SIGUNGU_CODE,
  SIDO_LIST,
  SIGUNGU_CODES,
} from "@/lib/sigungu-list";

interface AreaStats {
  area: number;
  trades: RawTradeRecord[];
  latest: RawTradeRecord;
  prevDiffManwon: number | null;
  count: number;
}

interface GroupedComplex {
  key: string;
  routeId: string;
  type: "apt" | "officetel";
  sigunguCode: string;
  sigunguName: string;
  dong: string;
  name: string;
  buildYear: number;
  areas: AreaStats[];
  defaultArea: number;
}

const LS_CASH_KEY = "beesvia_budget_cash_manwon";
const LS_INCOME_KEY = "beesvia_budget_income_manwon";

function makeRouteId(
  type: "apt" | "officetel",
  sigunguCode: string,
  dong: string,
  name: string
): string {
  const safeDong = dong.replace(/\//g, "_").trim();
  const safeName = name.replace(/\//g, "_").trim();
  return `${type}-${sigunguCode}-${safeDong}--${safeName}`;
}

function extractSigunguCodeFromId(id: string): string | null {
  const m = /^(?:apt|officetel)-(\d{5})-/.exec(id);
  return m ? m[1] : null;
}

function calcMaxLoanByIncome(annualIncomeManwon: number): number {
  if (annualIncomeManwon <= 0) return 0;
  const annualIncomeWon = annualIncomeManwon * 10_000;
  const maxAnnualDebt = annualIncomeWon * (DSR_LIMITS.tier1BankLimit / 100);
  const unitResult = calculateDsr({
    annualIncome: 100_000_000,
    loanAmount: 10_000_000,
    interestRate: 4.2,
    loanYears: 30,
    repaymentMethod: "equalPrincipalInterest",
    stressRate: 0.75,
    existingAnnualDebtService: 0,
  });
  if (unitResult.newLoanDsrAnnualPayment <= 0) return 0;
  return Math.round(
    (maxAnnualDebt / unitResult.newLoanDsrAnnualPayment) * 10_000_000
  );
}

export function RealEstateSearchClient() {
  const [query, setQuery] = useState("");
  const [selectedSido, setSelectedSido] = useState<string>(DEFAULT_SIDO);
  const [selectedSigungu, setSelectedSigungu] =
    useState<string>(DEFAULT_SIGUNGU_CODE);
  const [typeFilter, setTypeFilter] = useState<"all" | "apt" | "officetel">(
    "all"
  );
  const [sortOrder, setSortOrder] = useState<
    "latest" | "priceDesc" | "priceAsc"
  >("latest");
  const [excludeNoise, setExcludeNoise] = useState<boolean>(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // 시군구별 JSON 데이터 캐시 (Lazy Fetch)
  const cacheRef = useRef<Map<string, SigunguTradeFile>>(new Map());
  const [loadedFiles, setLoadedFiles] = useState<SigunguTradeFile[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // 전국 search-index.json 지연 로드 캐시
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[] | null>(
    null
  );
  const [loadingIndex, setLoadingIndex] = useState<boolean>(false);

  // 단지 카드별 선택 평형
  const [selectedAreas, setSelectedAreas] = useState<Record<string, number>>(
    {}
  );

  // 내 예산·연봉 필터
  const [budgetOpen, setBudgetOpen] = useState<boolean>(false);
  const [cashManwon, setCashManwon] = useState<number>(0);
  const [incomeManwon, setIncomeManwon] = useState<number>(0);

  // 관심 단지 비교 (최대 3개)
  const [compareList, setCompareList] = useState<CompareComplexCandidate[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);

  // 선택된 시/도에 종속된 시군구 목록
  const sigunguOptionsInSido = useMemo(
    () => SIGUNGU_CODES.filter((item) => item.sido === selectedSido),
    [selectedSido]
  );

  const handleSidoChange = (nextSido: string) => {
    setSelectedSido(nextSido);
    const first = SIGUNGU_CODES.find((item) => item.sido === nextSido);
    if (first) {
      setSelectedSigungu(first.code);
    }
    setQuery("");
  };

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const qType = sp.get("type");
    if (qType === "apt" || qType === "officetel" || qType === "all") {
      setTypeFilter(qType);
    }

    try {
      const savedCash = localStorage.getItem(LS_CASH_KEY);
      const savedIncome = localStorage.getItem(LS_INCOME_KEY);
      if (savedCash) setCashManwon(Number(savedCash) || 0);
      if (savedIncome) setIncomeManwon(Number(savedIncome) || 0);
    } catch {
      // ignore
    }
  }, []);

  const updateCash = (val: number) => {
    const safe = Math.max(0, Math.round(val));
    setCashManwon(safe);
    try {
      localStorage.setItem(LS_CASH_KEY, String(safe));
    } catch {
      // ignore
    }
  };

  const updateIncome = (val: number) => {
    const safe = Math.max(0, Math.round(val));
    setIncomeManwon(safe);
    try {
      localStorage.setItem(LS_INCOME_KEY, String(safe));
    } catch {
      // ignore
    }
  };

  const ensureSearchIndexLoaded = useCallback(async () => {
    if (searchIndex !== null || loadingIndex) return;
    setLoadingIndex(true);
    try {
      const res = await fetch("/data/search-index.json");
      if (res.ok) {
        const data = (await res.json()) as SearchIndexItem[];
        setSearchIndex(data);
      } else {
        setSearchIndex([]);
      }
    } catch {
      setSearchIndex([]);
    } finally {
      setLoadingIndex(false);
    }
  }, [searchIndex, loadingIndex]);

  const fetchSigunguData = useCallback(async (code: string) => {
    setLoadingData(true);
    const results: SigunguTradeFile[] = [];

    await Promise.all(
      (["apt", "officetel"] as const).map(async (kind) => {
        const cacheKey = `${kind}:${code}`;
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          results.push(cached);
          return;
        }
        try {
          const res = await fetch(`/data/${kind}/${code}.json`);
          if (res.ok) {
            const json = (await res.json()) as SigunguTradeFile;
            const tagged = { ...json, _kind: kind } as SigunguTradeFile & {
              _kind: "apt" | "officetel";
            };
            cacheRef.current.set(cacheKey, tagged);
            results.push(tagged);
          }
        } catch {
          // 아직 수집되지 않은 시군구 파일일 수 있음
        }
      })
    );

    setLoadedFiles(results);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    void fetchSigunguData(selectedSigungu);
  }, [selectedSigungu, fetchSigunguData]);

  // 전국 search-index.json 기반 실시간 자동완성
  const searchAutocompleteItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchIndex) return [];
    return searchIndex
      .filter((item) => {
        if (item.type === "sub") return false;
        if (typeFilter !== "all" && item.type !== typeFilter) return false;
        return (
          item.name.toLowerCase().includes(q) ||
          item.sido.toLowerCase().includes(q) ||
          item.sigungu.toLowerCase().includes(q) ||
          item.dong.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [searchIndex, query, typeFilter]);

  const handleSelectAutocomplete = (item: SearchIndexItem) => {
    const code = extractSigunguCodeFromId(item.id);
    if (code) {
      const matched = SIGUNGU_CODES.find((s) => s.code === code);
      if (matched) {
        setSelectedSido(matched.sido);
        setSelectedSigungu(matched.code);
      }
    }
    setQuery(item.name);
    setShowAutocomplete(false);
  };

  // 현재 선택된 시군구 데이터를 단지별 + 평형별로 그룹핑
  const groupedComplexes = useMemo<GroupedComplex[]>(() => {
    const map = new Map<
      string,
      {
        type: "apt" | "officetel";
        sigunguCode: string;
        sigunguName: string;
        dong: string;
        name: string;
        buildYear: number;
        rawTrades: RawTradeRecord[];
      }
    >();

    for (const file of loadedFiles) {
      const kind =
        (file as SigunguTradeFile & { _kind?: "apt" | "officetel" })._kind ??
        "apt";
      if (typeFilter !== "all" && kind !== typeFilter) continue;

      for (const t of file.items) {
        if (!t.name || !t.dong || t.price <= 0) continue;
        if (excludeNoise) {
          if (t.cancelYn || t.dealType.includes("직거래")) continue;
        }
        const key = `${kind}|${file.sigunguCode}|${t.dong}|${t.name}`;
        let group = map.get(key);
        if (!group) {
          group = {
            type: kind,
            sigunguCode: file.sigunguCode,
            sigunguName: file.sigunguName,
            dong: t.dong,
            name: t.name,
            buildYear: t.buildYear ?? 0,
            rawTrades: [],
          };
          map.set(key, group);
        }
        if (!group.buildYear && t.buildYear) {
          group.buildYear = t.buildYear;
        }
        group.rawTrades.push(t);
      }
    }

    const q = query.trim().toLowerCase();
    const list: GroupedComplex[] = [];

    for (const [key, g] of map.entries()) {
      if (
        q &&
        !g.name.toLowerCase().includes(q) &&
        !g.dong.toLowerCase().includes(q) &&
        !g.sigunguName.toLowerCase().includes(q)
      ) {
        continue;
      }

      g.rawTrades.sort((a, b) => b.dealDate.localeCompare(a.dealDate));

      const areaBucket = new Map<number, RawTradeRecord[]>();
      for (const t of g.rawTrades) {
        const roundedArea = Math.max(1, Math.round(t.area));
        const arr = areaBucket.get(roundedArea) ?? [];
        arr.push(t);
        areaBucket.set(roundedArea, arr);
      }

      const areas: AreaStats[] = Array.from(areaBucket.entries())
        .sort(([a], [b]) => a - b)
        .map(([area, trades]) => {
          const latest = trades[0];
          const prev = trades.length > 1 ? trades[1] : null;
          const prevDiffManwon = prev ? latest.price - prev.price : null;
          return {
            area,
            trades,
            latest,
            prevDiffManwon,
            count: trades.length,
          };
        });

      if (areas.length === 0) continue;

      const defaultArea = Math.max(1, Math.round(g.rawTrades[0].area));

      list.push({
        key,
        routeId: makeRouteId(g.type, g.sigunguCode, g.dong, g.name),
        type: g.type,
        sigunguCode: g.sigunguCode,
        sigunguName: g.sigunguName,
        dong: g.dong,
        name: g.name,
        buildYear: g.buildYear,
        areas,
        defaultArea,
      });
    }

    list.sort((a, b) => {
      const aLatest =
        (a.areas.find((s) => s.area === a.defaultArea) ?? a.areas[0]).latest;
      const bLatest =
        (b.areas.find((s) => s.area === b.defaultArea) ?? b.areas[0]).latest;

      if (sortOrder === "priceDesc") return bLatest.price - aLatest.price;
      if (sortOrder === "priceAsc") return aLatest.price - bLatest.price;
      const dateCmp = bLatest.dealDate.localeCompare(aLatest.dealDate);
      if (dateCmp !== 0) return dateCmp;
      const aCount = a.areas.reduce((acc, s) => acc + s.count, 0);
      const bCount = b.areas.reduce((acc, s) => acc + s.count, 0);
      return bCount - aCount;
    });

    return list.slice(0, 60);
  }, [loadedFiles, typeFilter, excludeNoise, query, sortOrder]);

  const hasBudget = cashManwon > 0 || incomeManwon > 0;
  const maxLoanWon = useMemo(
    () => calcMaxLoanByIncome(incomeManwon),
    [incomeManwon]
  );
  const totalBudgetWon = cashManwon * 10_000 + maxLoanWon;

  const toggleCompare = (candidate: CompareComplexCandidate) => {
    setCompareList((prev) => {
      const exists = prev.some((c) => c.key === candidate.key);
      if (exists) return prev.filter((c) => c.key !== candidate.key);
      if (prev.length >= 3) return [...prev.slice(1), candidate];
      return [...prev, candidate];
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Unified Search Container + 2-Tier Region Selector */}
      <div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Top Row (Mobile) / Left+Center (Desktop): Type Segment + Sido + Sigungu */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2 md:flex-nowrap md:gap-0 md:border-b-0 md:p-0 md:pl-2">
              {/* Type Segment Tabs */}
              <div
                className="flex shrink-0 items-center rounded-xl bg-slate-100 p-1"
                role="tablist"
                aria-label="매물 유형 선택"
              >
                {(
                  [
                    { value: "all", label: "전체" },
                    { value: "apt", label: "아파트" },
                    { value: "officetel", label: "오피스텔" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={typeFilter === opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 ${
                      typeFilter === opt.value
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="hidden h-7 w-px bg-slate-200 md:mx-1 md:block" />

              {/* 2-Tier Region Dropdowns */}
              <div className="flex flex-1 items-center gap-1 md:flex-none">
                {/* 1) 시/도 */}
                <div className="relative flex-1 md:w-32 md:flex-none">
                  <select
                    value={selectedSido}
                    onChange={(e) => handleSidoChange(e.target.value)}
                    aria-label="시/도 선택"
                    className="h-11 w-full appearance-none bg-transparent pl-2.5 pr-7 text-xs font-semibold text-slate-800 focus:outline-none sm:text-sm"
                  >
                    {SIDO_LIST.map((sido) => (
                      <option key={sido} value={sido}>
                        {sido}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>

                <div className="h-5 w-px bg-slate-200" />

                {/* 2) 시/군/구 */}
                <div className="relative flex-1 md:w-36 md:flex-none">
                  <select
                    value={selectedSigungu}
                    onChange={(e) => {
                      setSelectedSigungu(e.target.value);
                      setQuery("");
                    }}
                    aria-label="시/군/구 선택"
                    className="h-11 w-full appearance-none bg-transparent pl-2.5 pr-7 text-xs font-semibold text-slate-800 focus:outline-none sm:text-sm"
                  >
                    {sigunguOptionsInSido.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.sigungu}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </div>

              <div className="hidden h-7 w-px bg-slate-200 md:mx-1 md:block" />
            </div>

            {/* Bottom Row (Mobile) / Right (Desktop): Search Input */}
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                type="text"
                value={query}
                onFocus={() => {
                  setShowAutocomplete(true);
                  void ensureSearchIndexLoaded();
                }}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 180)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowAutocomplete(true);
                  void ensureSearchIndexLoaded();
                }}
                placeholder="전국 단지명 또는 법정동 검색 (예: 휘경SK뷰, 역삼동)"
                className="h-12 w-full bg-transparent pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none md:h-13"
                aria-label="전국 단지명 또는 동 검색"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="검색어 초기화"
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                >
                  ✕
                </button>
              )}

              {/* Autocomplete Dropdown (switches region automatically) */}
              {showAutocomplete && query.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {loadingIndex ? (
                    <div className="p-3 text-xs text-slate-500">
                      전국 단지 인덱스 불러오는 중...
                    </div>
                  ) : searchAutocompleteItems.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500">
                      일치하는 단지가 없습니다.
                    </div>
                  ) : (
                    <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto p-1.5">
                      {searchAutocompleteItems.map((item) => (
                        <li key={`ac-${item.type}-${item.id}`}>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectAutocomplete(item);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">
                                {item.name}
                              </span>
                              <span className="ml-2 text-xs text-slate-500">
                                {item.sido} {item.sigungu} {item.dong}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold text-blue-700">
                              {formatKoreanUnit(item.latestPrice * 10_000)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub Filter Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={excludeNoise}
              onClick={() => setExcludeNoise((prev) => !prev)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700"
            >
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  excludeNoise ? "bg-slate-900" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    excludeNoise ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </span>
              <span>직거래·해제 제외</span>
            </button>

            <button
              type="button"
              onClick={() => setBudgetOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                budgetOpen || hasBudget
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>💰 내 예산·연봉 필터</span>
              {hasBudget && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                  ON
                </span>
              )}
              <span>{budgetOpen ? "▲" : "▼"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-medium text-slate-500">
              총{" "}
              <strong className="text-slate-900">
                {groupedComplexes.length}
              </strong>
              개 단지
            </span>
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value as "latest" | "priceDesc" | "priceAsc"
                )
              }
              aria-label="정렬 기준"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-900 focus:outline-none"
            >
              <option value="latest">최신거래순</option>
              <option value="priceDesc">높은가격순</option>
              <option value="priceAsc">낮은가격순</option>
            </select>
          </div>
        </div>

        {/* Budget Accordion Body */}
        {budgetOpen && (
          <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="budget-cash"
                  className="text-xs font-bold text-slate-800"
                >
                  보유 현금 (만원)
                </label>
                <input
                  id="budget-cash"
                  type="number"
                  min={0}
                  step={1000}
                  value={cashManwon || ""}
                  placeholder="예: 30000 (3억 원)"
                  onChange={(e) => updateCash(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  {cashManwon > 0
                    ? formatKoreanUnit(cashManwon * 10_000)
                    : "입력 시 브라우저에 자동 저장"}
                </p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="budget-income"
                  className="text-xs font-bold text-slate-800"
                >
                  세전 연봉 (만원)
                </label>
                <input
                  id="budget-income"
                  type="number"
                  min={0}
                  step={500}
                  value={incomeManwon || ""}
                  placeholder="예: 8000 (8,000만 원)"
                  onChange={(e) => updateIncome(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-blue-800">
                  DSR 40% 최대 대출 가능액:{" "}
                  <strong>{formatKoreanUnit(maxLoanWon)}</strong>
                </p>
              </div>
            </div>
            {hasBudget && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-blue-200/70 pt-2.5 text-xs">
                <span className="font-semibold text-slate-800">
                  내 총 매수 가능 예산(현금+DSR대출):{" "}
                  <strong className="text-blue-700">
                    {formatKoreanUnit(totalBudgetWon)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    updateCash(0);
                    updateIncome(0);
                  }}
                  className="text-slate-500 underline hover:text-rose-600"
                >
                  예산 초기화
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loadingData ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-3 flex gap-2">
                <div className="h-6 w-14 rounded-full bg-slate-100" />
                <div className="h-6 w-14 rounded-full bg-slate-100" />
              </div>
              <div className="mt-8 h-7 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : groupedComplexes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-800">
            해당 지역·조건에 수집된 최근 6개월 거래 단지가 없습니다.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            아직 동기화 전인 지역이거나 검색어와 일치하는 단지가 없습니다. 아래
            추천 지역을 선택해 보세요.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedSido("서울특별시");
                setSelectedSigungu("11230");
                setQuery("");
                setTypeFilter("apt");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              #서울 동대문구 아파트
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSido("서울특별시");
                setSelectedSigungu("11680");
                setQuery("");
                setTypeFilter("all");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              #서울 강남구 전체
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSido("서울특별시");
                setSelectedSigungu("11710");
                setQuery("");
                setTypeFilter("all");
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              #서울 송파구 전체
            </button>
          </div>
        </div>
      ) : (
        /* Grouped Complex Cards */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groupedComplexes.map((complex) => {
            const activeArea =
              selectedAreas[complex.key] ?? complex.defaultArea;
            const areaStats =
              complex.areas.find((a) => a.area === activeArea) ??
              complex.areas[0];
            const latest = areaStats.latest;
            const priceWon = latest.price * 10_000;
            const isOfficetel = complex.type === "officetel";

            const officetelTax = isOfficetel
              ? calculateAcquisitionTax({
                  propertyType: "officetel",
                  price: priceWon,
                  houseCount: "1",
                  isRegulatedArea: false,
                  isFirstHome: false,
                  areaType: activeArea <= 85 ? "under85" : "over85",
                })
              : null;

            const budgetDiffWon = totalBudgetWon - priceWon;
            const isAffordable = budgetDiffWon >= 0;

            const isCompared = compareList.some((c) => c.key === complex.key);
            const detailHref = `/real-estate/${complex.routeId}`;

            return (
              <article
                key={complex.key}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isOfficetel
                            ? "bg-amber-50 text-amber-800"
                            : "bg-blue-50 text-blue-800"
                        }`}
                      >
                        {isOfficetel ? "오피스텔" : "아파트"}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {complex.dong}
                      </span>
                    </div>

                    {hasBudget && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isAffordable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {isAffordable
                          ? "매수 가능(여유)"
                          : `현금 ${formatKoreanUnit(Math.abs(budgetDiffWon))} 부족`}
                      </span>
                    )}
                  </div>

                  <Link href={detailHref} className="group mt-2.5 block">
                    <h2 className="text-[17px] font-bold leading-snug text-slate-900 group-hover:text-blue-700">
                      {complex.name}
                    </h2>
                  </Link>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {complex.areas.slice(0, 6).map((a) => {
                      const active = a.area === areaStats.area;
                      return (
                        <button
                          key={a.area}
                          type="button"
                          onClick={() =>
                            setSelectedAreas((prev) => ({
                              ...prev,
                              [complex.key]: a.area,
                            }))
                          }
                          className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
                            active
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {a.area}㎡
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`font-mono text-xl font-extrabold ${
                          latest.cancelYn
                            ? "text-slate-400 line-through"
                            : "text-blue-700"
                        }`}
                      >
                        {formatKoreanUnit(priceWon)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {latest.floor}층 · {latest.dealDate.slice(2)}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {areaStats.prevDiffManwon !== null ? (
                          <span
                            className={`font-semibold ${
                              areaStats.prevDiffManwon > 0
                                ? "text-rose-600"
                                : areaStats.prevDiffManwon < 0
                                  ? "text-blue-600"
                                  : "text-slate-500"
                            }`}
                          >
                            {areaStats.prevDiffManwon > 0
                              ? `▲ +${formatKoreanUnit(areaStats.prevDiffManwon * 10_000)}`
                              : areaStats.prevDiffManwon < 0
                                ? `▼ -${formatKoreanUnit(Math.abs(areaStats.prevDiffManwon) * 10_000)}`
                                : "직전과 동일"}
                          </span>
                        ) : (
                          <span className="text-slate-400">최근 단일 거래</span>
                        )}

                        {!excludeNoise && latest.dealType.includes("직거래") && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            직거래
                          </span>
                        )}
                        {!excludeNoise && latest.cancelYn && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                            해제
                          </span>
                        )}
                      </div>

                      <span className="font-medium text-slate-500">
                        6개월 {areaStats.count}건
                      </span>
                    </div>

                    {officetelTax && (
                      <div className="mt-2.5 rounded-lg bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-950">
                        오피스텔 예상 취득세(4.6%):{" "}
                        <strong className="font-mono">
                          {formatKRW(officetelTax.totalTax)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3">
                  <Link
                    href={`${detailHref}?tab=tax&price=${priceWon}&area=${areaStats.area}`}
                    className="flex-1 rounded-xl bg-blue-50 px-2.5 py-2 text-center text-[11px] font-bold text-blue-700 hover:bg-blue-100"
                  >
                    이 가격으로 취득세·DSR 계산 &gt;
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      toggleCompare({
                        key: complex.key,
                        routeId: complex.routeId,
                        type: complex.type,
                        name: complex.name,
                        sigunguName: complex.sigunguName,
                        dong: complex.dong,
                        selectedArea: areaStats.area,
                        latestPriceManwon: latest.price,
                        dealDate: latest.dealDate,
                      })
                    }
                    className={`shrink-0 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition-colors ${
                      isCompared
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isCompared ? "담김 ✓" : "+비교담기"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-blue-300">
                비교함 ({compareList.length}/3)
              </span>
              {compareList.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCompare(c)}
                  className="rounded-lg bg-white/15 px-2 py-1 text-xs font-medium text-white hover:bg-white/25"
                >
                  {c.name} ({c.selectedArea}㎡) ✕
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareList([])}
                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:text-white"
              >
                비우기
              </button>
              <button
                type="button"
                disabled={compareList.length < 2}
                onClick={() => setCompareModalOpen(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {compareList.length < 2
                  ? "2개 이상 선택 시 비교"
                  : `${compareList.length}개 단지 비교하기 →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {compareModalOpen && (
        <ComplexCompareModal
          items={compareList}
          onClose={() => setCompareModalOpen(false)}
          onRemove={(key) => {
            setCompareList((prev) => {
              const next = prev.filter((c) => c.key !== key);
              if (next.length < 2) setCompareModalOpen(false);
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
