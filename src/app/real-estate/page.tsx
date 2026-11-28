import type { Metadata } from "next";
import Link from "next/link";
import { RealEstateSearchClient } from "@/components/real-estate/RealEstateSearchClient";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/real-estate";
const PAGE_TITLE = "전국 아파트·오피스텔 실거래가 조회 (국토교통부 연동)";
const PAGE_DESCRIPTION =
  "전국 17개 시·도 아파트 및 오피스텔 최근 6개월 실거래가를 시군구·단지·평형별로 조회하고, 해당 가격 기준 취득세와 DSR 대출 한도를 바로 계산하세요.";

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

export default function RealEstateSearchPage() {
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
              전국 17개 시·도 · 국토교통부 최근 6개월 실거래가
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              전국 아파트 · 오피스텔 실거래가 조회
            </h1>
            <p className="text-sm text-slate-600">
              시·도와 시군구를 선택하거나 단지명을 검색해 최근 6개월 실거래
              추이를 확인하고, 매수 시 취득세·DSR·중개보수를 즉시
              시뮬레이션하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/subscription"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 sm:text-sm"
            >
              청약 분양정보 →
            </Link>
            <Link
              href="/real-estate/acquisition-tax"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 sm:text-sm"
            >
              취득세 계산기 →
            </Link>
            <Link
              href="/finance/dsr"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 sm:text-sm"
            >
              DSR 한도 계산기 →
            </Link>
            <Link
              href="/salary/net-pay"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 sm:text-sm"
            >
              연봉 실수령액 →
            </Link>
          </div>
        </header>

        <RealEstateSearchClient />
      </div>
    </>
  );
}
