import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { ComplexSeoSection } from "@/components/real-estate/ComplexSeoSection";
import { EmbeddedFinanceCalculator } from "@/components/real-estate/EmbeddedFinanceCalculator";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/components/seo/JsonLd";
import {
  getActiveSubscriptionStaticParams,
  getSubscriptionById,
} from "@/lib/real-estate-data";
import {
  buildRealEstateListingSchema,
  buildSubscriptionSeoGuide,
} from "@/lib/real-estate-seo";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return getActiveSubscriptionStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/subscription/[id]">): Promise<Metadata> {
  const { id } = await params;
  const sub = await getSubscriptionById(id);

  if (!sub) {
    return { title: "청약 공고 정보를 찾을 수 없습니다" };
  }

  const title = `${sub.name} 청약 일정·분양 정보 및 취득세·대출(DSR) 계산기 | 비즈비아 부동산`;
  const description = `${sub.region} ${sub.name} (총 ${sub.totalCount.toLocaleString("ko-KR")}세대) 청약 접수 ${sub.applyStart}~${sub.applyEnd}. 분양 자금 계획 및 취득세·스트레스 DSR 한도를 바로 계산하세요.`;
  const pagePath = `/subscription/${sub.id}`;

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

async function SubscriptionContent({
  params,
}: Pick<PageProps<"/subscription/[id]">, "params">) {
  const { id } = await params;
  const sub = await getSubscriptionById(id);

  if (!sub) {
    notFound();
  }

  const seoGuide = buildSubscriptionSeoGuide(sub);
  const pagePath = `/subscription/${sub.id}`;
  const breadcrumbs = [
    { name: "홈", path: "/" },
    { name: "청약 분양 정보", path: "/subscription" },
    { name: sub.name, path: pagePath },
  ];

  const statusBadge =
    sub.status === "active"
      ? {
          label: sub.dDay === 0 ? "오늘 마감 (D-Day)" : `접수 중 (D-${sub.dDay})`,
          cls: "bg-emerald-600 text-white",
        }
      : sub.status === "upcoming"
        ? {
            label: `접수 예정 (D-${sub.dDay})`,
            cls: "bg-blue-600 text-white",
          }
        : {
            label: `접수 마감 (${Math.abs(sub.dDay)}일 경과)`,
            cls: "bg-slate-200 text-slate-700",
          };

  return (
    <>
      <JsonLd
        data={[
          buildRealEstateListingSchema({
            name: sub.name,
            description: seoGuide.fundSummaryText,
            path: pagePath,
            address: sub.address || sub.region,
            datePosted: sub.applyStart,
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
          <Link href="/subscription" className="hover:text-slate-900 hover:underline">
            청약알림
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{sub.name}</span>
        </nav>

        {/* Summary Header */}
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge.cls}`}>
              {statusBadge.label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {sub.region} · {sub.houseType || "아파트"}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
              총 {sub.totalCount.toLocaleString("ko-KR")}세대 공급
            </span>
            {sub.moveInDate && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                입주예정 {sub.moveInDate}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {sub.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{sub.address}</p>

          <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="text-xs font-semibold text-slate-500">
                청약 접수 기간
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                {sub.applyStart} ~ {sub.applyEnd}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="text-xs font-semibold text-slate-500">
                당첨자 발표일
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                {sub.winnerDate ?? "공고문 확인"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <span className="text-xs font-semibold text-slate-500">
                청약홈 원문 공고
              </span>
              {sub.url ? (
                <a
                  href={sub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-bold text-blue-700 underline"
                >
                  청약홈 상세 보기 ↗
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-500">청약홈 조회</p>
              )}
            </div>
          </div>
        </header>

        {/* Embedded 3-Tab Calculator Bridge Widget */}
        <section aria-label="분양 자금 취득세·DSR·중개보수 통합 계산기">
          <EmbeddedFinanceCalculator
            initialParams={{
              source: "subscription",
              name: sub.name,
              price: 600_000_000,
              area: 84,
              houseCount: "1",
            }}
          />
        </section>

        <AdSlot slotId="calc-result-bottom" format="auto" className="my-6" />

        {/* Bottom 600~800char SEO Guide + FAQ */}
        <ComplexSeoSection guide={seoGuide} />
      </div>
    </>
  );
}

export default function SubscriptionDetailPage({
  params,
}: PageProps<"/subscription/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-500">
          청약 공고 상세 정보를 불러오는 중입니다...
        </div>
      }
    >
      <SubscriptionContent params={params} />
    </Suspense>
  );
}
