import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { GUIDES } from "@/data/guides";
import { JsonLd, buildWebAppSchema } from "@/components/seo/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const REAL_ESTATE_TAX_CARDS = [
  {
    title: "부동산 취득세 계산기",
    href: "/real-estate/acquisition-tax",
    category: "부동산 세금",
    summary:
      "주택·오피스텔 구분, 보유 주택 수(1~3주택 이상), 조정대상지역, 생애최초 200만 원 감면과 전용 85㎡ 농특세까지 한 번에 계산합니다.",
    highlight: "1주택 1~3% · 생애최초 최대 200만 감면",
  },
  {
    title: "부동산 중개보수·복비 계산기",
    href: "/real-estate/brokerage-fee",
    category: "부동산 거래",
    summary:
      "매매·전세·월세(환산보증금 자동 계산), 주택·오피스텔·상가별 상한요율 및 한도액, 협의 요율 슬라이더와 부가가치세(10%·4%·면세)를 계산합니다.",
    highlight: "상한요율 자동 판정 · 협의 요율 조정",
  },
  {
    title: "DSR·월 상환액 계산기",
    href: "/finance/dsr",
    category: "금융·대출",
    summary:
      "세전 연소득과 기존 대출, 스트레스 DSR 가산금리(0%·0.75%·1.5%)를 반영해 예상 DSR 비율과 1금융권 40% 한도 대비 추가 대출 여력을 확인합니다.",
    highlight: "스트레스 DSR 반영 · 40%·50% 게이지",
  },
  {
    title: "증여세 간편 모의 계산기",
    href: "/tax/gift-tax",
    category: "증여·절세",
    summary:
      "배우자(6억)·직계존속(성인 5천만·미성년 2천만) 공제와 10년 내 기증여 합산, 세대생략 할증(30%), 자진신고 세액공제(3%)를 반영합니다.",
    highlight: "누진세율 10~50% · 자진신고 3% 공제",
  },
];

const SALARY_FINANCE_CARDS = [
  {
    title: "연봉 실수령액 계산기",
    href: "/salary/net-pay",
    category: "연봉·급여",
    summary:
      "연봉·월급, 비과세 식대(20만 원), 부양가족 수, 20세 이하 자녀 수를 입력해 4대보험(국민연금 상한 포함)과 근로소득세 공제 후 월 실수령액을 계산합니다.",
    highlight: "4대보험·간이세액 근사 · 비과세 반영",
  },
  {
    title: "퇴직금 모의 계산기",
    href: "/salary/severance",
    category: "연봉·퇴직",
    summary:
      "입사일·퇴사일 재직일수 자동 계산, 3개월 급여·상여금·연차수당 기반 1일 평균임금과 통상임금 비교, 근속연수공제 반영 세후 실수령 퇴직금을 산출합니다.",
    highlight: "평균·통상임금 비교 · 퇴직소득세 반영",
  },
  {
    title: "대출 이자 및 상환 스케줄 계산기",
    href: "/finance/loan-interest",
    category: "금융·대출",
    summary:
      "대출 원금, 금리, 기간, 거치 기간을 입력해 원리금균등·원금균등·만기일시상환 3가지 방식의 총이자를 비교하고 회차별 상환 스케줄을 확인합니다.",
    highlight: "3가지 방식 총이자 비교 · 회차별 스케줄",
  },
  {
    title: "예금·적금 세후이자 계산기",
    href: "/finance/savings",
    category: "금융·저축",
    summary:
      "정기예금·정기적금의 단리·월복리 이자와 일반과세(15.4%)·세금우대(1.4%)·비과세(0%)별 만기 수령액 및 절세 효과를 한눈에 비교합니다.",
    highlight: "단리·월복리 · 15.4%·1.4%·비과세",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={buildWebAppSchema({
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          path: "/",
        })}
      />

      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-200">
              <span>fin.beesvia.com</span>
              <span aria-hidden="true">·</span>
              <span>8종 통합 계산기 · 100% 브라우저 로컬 연산</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-tight">
              한국인을 위한
              <br className="sm:hidden" /> 부동산·세금·금융 통합 계산기
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              취득세·복비·DSR·증여세부터 연봉 실수령액·퇴직금·대출이자·예적금까지
              8가지 필수 계산을 서버 전송 없이 브라우저에서 즉시 확인하세요.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <Link
                href="/real-estate/acquisition-tax"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                부동산 취득세 계산
              </Link>
              <Link
                href="/salary/net-pay"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                연봉 실수령액 계산
              </Link>
              <Link
                href="/finance/dsr"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                DSR 한도 확인
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: 부동산·세금 계산기 (4종) */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Real Estate &amp; Tax
            </span>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              부동산·세금 계산기 (4종)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              주택 매수·임대차, 대출 한도(DSR), 사전 증여 세액을 정확하게
              점검하세요.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            기준 URL: {SITE_URL}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {REAL_ESTATE_TAX_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {card.category}
                  </span>
                  <span className="text-xs font-medium text-blue-700">
                    {card.highlight}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-700">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {card.summary}
                </p>
              </div>
              <div className="mt-5 flex items-center text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                <span>계산기 열기</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mid Ad Slot */}
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
        <AdSlot slotId="home-mid" format="horizontal" />
      </div>

      {/* Section 2: 연봉·금융 계산기 (4종) */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Salary &amp; Finance
          </span>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            연봉·금융 계산기 (4종)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            직장인 실수령액, 퇴직금 정산, 대출 상환 스케줄, 예적금 만기
            수령액을 계산하세요.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {SALARY_FINANCE_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    {card.category}
                  </span>
                  <span className="text-xs font-medium text-blue-700">
                    {card.highlight}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-700">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {card.summary}
                </p>
              </div>
              <div className="mt-5 flex items-center text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                <span>계산기 열기</span>
                <span className="ml-1.5 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Rate & Limit Summary */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            자주 찾는 세율 · 한도 핵심 요약
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            주요 부동산·금융·세무 기준을 빠르게 확인해 보세요.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                1주택 취득세율
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">1% ~ 3%</p>
              <p className="mt-1 text-xs text-slate-600">
                6억 이하 1% · 9억 초과 3% · 생애최초 최대 200만 원 감면
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                4대보험 근로자 부담
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">약 9.4%</p>
              <p className="mt-1 text-xs text-slate-600">
                국민연금 4.5% · 건보 3.545% · 장기요양 · 고용 0.9%
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                DSR 대출 한도
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                40% / 50%
              </p>
              <p className="mt-1 text-xs text-slate-600">
                1금융권(은행) 40%, 2금융권 50% · 스트레스 가산금리 반영
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                증여재산 공제한도
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                6억 / 5천만
              </p>
              <p className="mt-1 text-xs text-slate-600">
                배우자 6억 · 성인 자녀 5천만 · 미성년 2천만 (10년 합산)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Preview */}
      <section className="mx-auto max-w-6xl px-4 pt-4 pb-16 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
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
            전체 보기 →
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
