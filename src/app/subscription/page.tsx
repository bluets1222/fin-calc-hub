import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/JsonLd";
import { getSubscriptionsData } from "@/lib/real-estate-data";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/subscription";
const PAGE_TITLE = "청약알림 · 전국 아파트 분양정보 D-Day";
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
    { name: "청약알림", path: PAGE_PATH },
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
              청약알림 · 분양정보 현황
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
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
                <Link
                  key={item.id}
                  href={`/subscription/${item.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
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
                    <h2 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700">
                      {item.name}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {item.address}
                    </p>
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>공급세대수</span>
                      <span className="font-semibold text-slate-900">
                        {item.totalCount.toLocaleString("ko-KR")}세대
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>접수기간</span>
                      <span className="font-mono">
                        {item.applyStart} ~ {item.applyEnd}
                      </span>
                    </div>
                    {item.moveInDate && (
                      <div className="flex justify-between">
                        <span>입주예정</span>
                        <span className="font-mono">{item.moveInDate}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
