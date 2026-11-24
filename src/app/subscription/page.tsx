import type { Metadata } from "next";
import Link from "next/link";
import { SubscriptionListClient } from "@/components/real-estate/SubscriptionListClient";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/JsonLd";
import { getSubscriptionsData } from "@/lib/real-estate-data";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/subscription";
const PAGE_TITLE = "청약 조회 · 전국 아파트 분양정보 D-Day";
const PAGE_DESCRIPTION =
  "청약홈 공식 분양정보를 기반으로 현재 접수 중, 접수 예정, 최근 마감 공고와 D-Day 일정을 확인하고 분양 자금·취득세·DSR을 바로 계산하세요.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    type: "website",
  },
};

export default async function SubscriptionListPage() {
  const data = await getSubscriptionsData();
  const items = data?.items ?? [];

  const breadcrumbs = [
    { name: "홈", path: "/" },
    { name: "청약 조회", path: PAGE_PATH },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              청약홈 연동 데이터
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              청약 조회 · 분양정보 현황
            </h1>
            <p className="text-sm text-slate-600">
              기준일 {data?.baseDate ?? "-"} · 총 {items.length}건 (접수 중 ·
              접수 예정 · 최근 30일 마감)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/real-estate/acquisition-tax"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 sm:text-sm"
            >
              취득세 계산기 →
            </Link>
            <Link
              href="/finance/dsr"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 sm:text-sm"
            >
              DSR 한도 계산기 →
            </Link>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            수집된 청약 공고가 없습니다. `npm run sync:real-estate` 실행 후
            다시 확인해 주세요.
          </div>
        ) : (
          <SubscriptionListClient items={items} />
        )}
      </div>
    </>
  );
}
