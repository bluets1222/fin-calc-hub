import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import { JsonLd, buildWebAppSchema } from "@/components/seo/JsonLd";
import { GUIDES } from "@/data/guides";
import { formatKoreanUnit } from "@/lib/format";
import {
  getSearchIndexData,
  getSubscriptionsData,
} from "@/lib/real-estate-data";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const CORE_TOOLS = [
  {
    icon: "🏛️",
    title: "취득세 계산기",
    href: "/real-estate/acquisition-tax",
    tag: "1~3% · 생애최초 200만 감면",
    desc: "주택·오피스텔, 다주택 중과, 전용 85㎡ 농특세 자동 반영",
  },
  {
    icon: "🤝",
    title: "중개보수 계산기",
    href: "/real-estate/brokerage-fee",
    tag: "매매·전세·월세 복비",
    desc: "상한요율·한도액 판정, 협의 요율 및 부가세 포함 계산",
  },
  {
    icon: "🏦",
    title: "DSR 계산기",
    href: "/finance/dsr",
    tag: "스트레스 DSR 40%·50%",
    desc: "연소득과 가산금리를 반영한 주담대 한도 및 월 상환액",
  },
  {
    icon: "🎁",
    title: "증여세 계산기",
    href: "/tax/gift-tax",
    tag: "10년 합산 · 자진신고 3%",
    desc: "배우자 6억·성인 자녀 5천만 공제 및 누진세율 모의 계산",
  },
];

const SALARY_FINANCE_TOOLS = [
  {
    title: "연봉 실수령액 계산기",
    href: "/salary/net-pay",
    tag: "4대보험 · 근로소득세",
  },
  {
    title: "퇴직금 모의 계산기",
    href: "/salary/severance",
    tag: "평균임금 · 퇴직소득세",
  },
  {
    title: "대출 이자·스케줄 계산기",
    href: "/finance/loan-interest",
    tag: "원리금·원금균등 비교",
  },
  {
    title: "예금·적금 세후이자 계산기",
    href: "/finance/savings",
    tag: "단리·월복리 · 15.4%·1.4%",
  },
];

export default async function HomePage() {
  const [subData, searchIndex] = await Promise.all([
    getSubscriptionsData(),
    getSearchIndexData(),
  ]);

  // 오늘의 청약 하이라이트: 접수 중(active) 우선, 이어서 접수 예정(upcoming) 최대 4개
  const highlightSubs = (subData?.items ?? [])
    .filter((item) => item.status === "active" || item.status === "upcoming")
    .slice(0, 4);

  // 최근 실거래가 요약: 아파트·오피스텔 최신 거래 상위 4개
  const recentComplexes = searchIndex
    .filter((item) => item.type !== "sub" && item.latestPrice > 0)
    .slice(0, 4);

  return (
    <>
      <JsonLd
        data={buildWebAppSchema({
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          path: "/",
        })}
      />

      {/* 1) Hero 통합 검색 섹션 */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-200">
              <span>fin.beesvia.com</span>
              <span aria-hidden="true">·</span>
              <span>청약 · 실거래가 · 세금 · 금융 통합 허브</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-[40px] lg:leading-tight">
              내 집 마련과 자산 관리,
              <br />
              시세 조회부터 세금·DSR 계산까지 한 번에
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              청약 공고와 국토부 실거래가를 조회하고, 해당 금액 그대로 취득세·
              중개보수·DSR 한도까지 즉시 시뮬레이션하세요.
            </p>
          </div>

          <HomeHeroSearch />

          {/* 인기·마감임박 롱테일 내부 링크 칩 */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              인기 바로가기:
            </span>
            {highlightSubs.slice(0, 3).map((sub) => (
              <Link
                key={sub.id}
                href={`/subscription/${sub.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 transition-colors hover:bg-white/20 hover:text-white"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{sub.name}</span>
              </Link>
            ))}
            <Link
              href="/real-estate/acquisition-tax"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
            >
              2026 취득세 계산기
            </Link>
            <Link
              href="/finance/dsr"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
            >
              DSR 대출 한도 계산기
            </Link>
            <Link
              href="/salary/net-pay"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/15 hover:text-white"
            >
              2026 연봉 실수령액
            </Link>
          </div>
        </div>
      </section>

      {/* 2) 오늘의 청약 하이라이트 */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Today&apos;s Subscription
            </span>
            <h2 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">
              오늘의 청약 하이라이트
            </h2>
          </div>
          <Link
            href="/subscription"
            className="shrink-0 text-sm font-bold text-blue-700 hover:underline"
          >
            청약 전체보기 &gt;
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlightSubs.map((sub) => {
            const isActive = sub.status === "active";
            return (
              <Link
                key={sub.id}
                href={`/subscription/${sub.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {isActive
                        ? sub.dDay === 0
                          ? "오늘 마감"
                          : `접수중 D-${sub.dDay}`
                        : `예정 D-${sub.dDay}`}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {sub.region}
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-blue-700">
                    {sub.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <span>{sub.totalCount.toLocaleString("ko-KR")}세대</span>
                  <span className="font-mono text-slate-500">
                    ~{sub.applyEnd.slice(5)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Mid Ad Slot */}
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
        <AdSlot slotId="home-mid" format="horizontal" />
      </div>

      {/* 3) 실거래가 & 세금·금융 빠른 도구 */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Real Estate &amp; Calculators
            </span>
            <h2 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">
              실거래가 &amp; 핵심 세금·대출 도구
            </h2>
          </div>
          <Link
            href="/real-estate"
            className="shrink-0 text-sm font-bold text-blue-700 hover:underline"
          >
            실거래가 전체보기 &gt;
          </Link>
        </div>

        {/* 최근 실거래가 요약 4종 */}
        {recentComplexes.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentComplexes.map((c) => (
              <Link
                key={`recent-${c.id}`}
                href={`/real-estate/${c.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-blue-700">
                    {c.sido} {c.sigungu} {c.dong}
                  </span>
                  <span>{c.type === "apt" ? "아파트" : "오피스텔"}</span>
                </div>
                <p className="mt-1.5 truncate text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  {c.name}
                </p>
                <p className="mt-1 font-mono text-base font-extrabold text-slate-900">
                  {formatKoreanUnit(c.latestPrice * 10_000)}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* 4대 핵심 계산기 아이콘 카드 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl" aria-hidden="true">
                    {tool.icon}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    {tool.tag}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700 sm:text-lg">
                  {tool.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {tool.desc}
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-blue-700">
                바로 계산하기 →
              </span>
            </Link>
          ))}
        </div>

        {/* 연봉·저축·대출이자 빠른 링크 */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SALARY_FINANCE_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">{tool.title}</p>
                <p className="text-xs text-slate-500">{tool.tag}</p>
              </div>
              <span className="text-sm font-bold text-slate-400">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4) 세무·부동산·금융 가이드 */}
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              기초 세무 · 부동산 · 금융 가이드 ({GUIDES.length}편)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              계산 전 꼭 알아야 할 절세 및 한도 관리 핵심 포인트를 정리했습니다.
            </p>
          </div>
          <Link
            href="/guide"
            className="shrink-0 text-sm font-semibold text-blue-700 hover:underline"
          >
            전체 보기 &gt;
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guide/${guide.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300"
            >
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">
                  {guide.category}
                </span>
                <span>·</span>
                <span>{guide.readTime}</span>
              </div>
              <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-blue-700">
                {guide.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                {guide.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
