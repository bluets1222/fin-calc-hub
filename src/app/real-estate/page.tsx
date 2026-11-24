import type { Metadata } from "next";
import Link from "next/link";
import { RealEstateSearchClient } from "@/components/real-estate/RealEstateSearchClient";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/JsonLd";
import { getSearchIndexData } from "@/lib/real-estate-data";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/real-estate";
const PAGE_TITLE = "아파트·오피스텔 실거래가 조회 (국토교통부 연동)";
const PAGE_DESCRIPTION =
  "서울·경기 주요 시군구 아파트 및 오피스텔 최근 3개월 실거래가를 단지명·지역별로 검색하고, 해당 가격 기준 취득세와 DSR 대출 한도를 바로 계산하세요.";

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

export default async function RealEstateSearchPage() {
  const items = await getSearchIndexData();
  const breadcrumbs = [
    { name: "홈", path: "/" },
    { name: "실거래가 조회", path: PAGE_PATH },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              국토교통부 실거래가 연동
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              아파트 · 오피스텔 실거래가 조회
            </h1>
            <p className="text-sm text-slate-600">
              단지명이나 지역을 검색해 최근 실거래 추이를 확인하고, 매수 시
              취득세·DSR·중개보수를 즉시 시뮬레이션하세요.
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

        <RealEstateSearchClient items={items} />
      </div>
    </>
  );
}
