import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { ComplexSeoSection } from "@/components/real-estate/ComplexSeoSection";
import { EmbeddedFinanceCalculator } from "@/components/real-estate/EmbeddedFinanceCalculator";
import { PriceTrendChart } from "@/components/real-estate/PriceTrendChart";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/components/seo/JsonLd";
import {
  getComplexDetail,
  getTopComplexStaticParams,
} from "@/lib/real-estate-data";
import {
  buildComplexSeoGuide,
  buildRealEstateListingSchema,
  formatManwonPrice,
  sqmToPyeong,
} from "@/lib/real-estate-seo";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return getTopComplexStaticParams(500);
}

export async function generateMetadata({
  params,
}: PageProps<"/complex/[id]">): Promise<Metadata> {
  const { id } = await params;
  const detail = await getComplexDetail(id);

  if (!detail) {
    return { title: "단지 정보를 찾을 수 없습니다" };
  }

  const priceText = formatManwonPrice(detail.latestPrice);
  const pyeong = sqmToPyeong(detail.latestArea);
  const diffText =
    detail.diffPercentFromDong === 0
      ? `${detail.dongName} 평균 시세 수준`
      : detail.diffPercentFromDong > 0
        ? `${detail.dongName} 평균 대비 +${detail.diffPercentFromDong}%`
        : `${detail.dongName} 평균 대비 ${detail.diffPercentFromDong}%`;

  const title = `${detail.name} 실거래가 추이 및 취득세·대출(DSR) 계산기 | 비즈비아 부동산`;
  const description = `${detail.sigunguName} ${detail.dongName} ${detail.name} 최근 실거래가 ${priceText} (전용 ${detail.latestArea}㎡ · 약 ${pyeong}평, ${diffText}). 실거래 내역과 취득세·중개보수·DSR 대출 한도를 바로 계산하세요.`;
  const pagePath = `/complex/${detail.id}`;

  return {
    title,
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${pagePath}`,
      type: "website",
    },
  };
}

async function ComplexContent({
  params,
}: Pick<PageProps<"/complex/[id]">, "params">) {
  const { id } = await params;
  const detail = await getComplexDetail(id);

  if (!detail) {
    notFound();
  }

  const seoGuide = buildComplexSeoGuide(detail);
  const priceText = formatManwonPrice(detail.latestPrice);
  const typeLabel = detail.type === "apt" ? "아파트" : "오피스텔";
  const pagePath = `/complex/${detail.id}`;
  const breadcrumbs = [
    { name: "홈", path: "/" },
    { name: `${detail.sigunguName} ${typeLabel}`, path: "/real-estate/acquisition-tax" },
    { name: detail.name, path: pagePath },
  ];

  const diffBadge =
    detail.diffPercentFromDong === 0
      ? `${detail.dongName} 평균 수준`
      : detail.diffPercentFromDong > 0
        ? `${detail.dongName} 평균 대비 +${detail.diffPercentFromDong}%`
        : `${detail.dongName} 평균 대비 ${detail.diffPercentFromDong}%`;

  return (
    <>
      <JsonLd
        data={[
          buildRealEstateListingSchema({
            name: `${detail.name} (${detail.sigunguName} ${detail.dongName})`,
            description: seoGuide.fundSummaryText,
            path: pagePath,
            priceManwon: detail.latestPrice,
            address: `${detail.sigunguName} ${detail.dongName}`,
            datePosted: detail.latestDealDate || "2026-11-24",
          }),
          buildBreadcrumbSchema(breadcrumbs),
          buildFaqSchema(seoGuide.faqs),
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="현재 위치"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-900 hover:underline">
            홈
          </Link>
          <span>/</span>
          <span>{detail.sigunguName}</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">{detail.name}</span>
        </nav>

        {/* Top Summary Header */}
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {typeLabel} 실거래 분석
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              {detail.sigunguName} {detail.dongName}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                detail.diffPercentFromDong <= 0
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {diffBadge}
            </span>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {detail.name}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                최근 거래 전용면적 {detail.latestArea}㎡ (약{" "}
                {sqmToPyeong(detail.latestArea)}평) · 거래일{" "}
                {detail.latestDealDate} · 누적 {detail.tradeCount}건
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-semibold text-slate-500">
                최근 실거래가
              </span>
              <p className="font-mono text-2xl font-bold text-blue-700 sm:text-3xl">
                {priceText}
              </p>
            </div>
          </div>

          {detail.areaList.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">거래 면적대:</span>
              {detail.areaList.map((a) => (
                <span
                  key={a}
                  className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700"
                >
                  {a}㎡ ({sqmToPyeong(a)}평)
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Price Trend Chart */}
        <PriceTrendChart
          points={detail.monthlyTrend}
          complexName={detail.name}
        />

        {/* Embedded 3-Tab Calculator Bridge Widget */}
        <section className="mt-8" aria-label="취득세·DSR·중개보수 통합 계산기">
          <EmbeddedFinanceCalculator
            initialParams={{
              source: detail.type,
              name: detail.name,
              price: detail.latestPrice * 10_000,
              area: detail.latestArea || 84,
              houseCount: "1",
            }}
          />
        </section>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        {/* Trade History Table */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              최근 3개월 실거래 상세 내역
            </h2>
            <span className="text-xs text-slate-500">
              총 {detail.trades.length}건 (최신순)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="px-3 py-2.5">계약일</th>
                  <th className="px-3 py-2.5 text-right">거래금액</th>
                  <th className="px-3 py-2.5 text-right">전용면적</th>
                  <th className="px-3 py-2.5 text-right">층</th>
                  <th className="px-3 py-2.5 text-center">거래구분 / 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {detail.trades.slice(0, 50).map((t, idx) => {
                  const isCancelled = t.cancelYn;
                  const isDirect = t.dealType.includes("직거래");
                  return (
                    <tr
                      key={`${t.dealDate}-${t.floor}-${t.price}-${idx}`}
                      className={isCancelled ? "bg-rose-50/40 text-slate-400" : ""}
                    >
                      <td className="px-3 py-2.5 font-mono text-xs sm:text-sm">
                        {t.dealDate}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-mono font-bold ${
                          isCancelled ? "line-through" : "text-slate-900"
                        }`}
                      >
                        {formatManwonPrice(t.price)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs sm:text-sm">
                        {t.area}㎡
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs sm:text-sm">
                        {t.floor}층
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="inline-flex flex-wrap items-center justify-center gap-1">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              isDirect
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {t.dealType || "중개거래"}
                          </span>
                          {isCancelled && (
                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                              해제
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom 600~800char SEO Guide + FAQ */}
        <ComplexSeoSection guide={seoGuide} />
      </div>
    </>
  );
}

export default function ComplexDetailPage({
  params,
}: PageProps<"/complex/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">
          단지 실거래가 데이터를 불러오는 중입니다...
        </div>
      }
    >
      <ComplexContent params={params} />
    </Suspense>
  );
}
