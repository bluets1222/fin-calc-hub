import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/data/guides";
import { JsonLd, buildBreadcrumbSchema } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/guide";
const PAGE_TITLE = "부동산·세무·금융 기초 가이드";
const PAGE_DESCRIPTION =
  "생애최초 취득세 감면, 부동산 복비 협의 팁, 스트레스 DSR 한도 관리, 증여세 10년 합산 과세까지 실생활에 꼭 필요한 핵심 가이드를 모았습니다.";

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

const BREADCRUMBS = [
  { name: "홈", path: "/" },
  { name: "세무·금융 가이드", path: PAGE_PATH },
];

export default function GuideIndexPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(BREADCRUMBS)} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <nav
          aria-label="현재 위치"
          className="mb-4 flex items-center gap-1.5 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-900 hover:underline">
            홈
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">세무·금융 가이드</span>
        </nav>

        <header className="mb-10 space-y-3">
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            실전 가이드
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            부동산 · 세무 · 금융 기초 가이드
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            계산기 숫자의 배경이 되는 최신 세법과 금융 규정을 알기 쉽게
            풀어냈습니다. 각 가이드 하단에서 바로 모의 계산을 진행해 보세요.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {GUIDES.map((guide) => (
            <article
              key={guide.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700">
                    {guide.category}
                  </span>
                  <span>
                    {guide.readTime} · {guide.updatedAt}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-bold text-slate-900">
                  <Link
                    href={`/guide/${guide.slug}`}
                    className="hover:text-blue-700"
                  >
                    {guide.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {guide.subtitle}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <Link
                  href={`/guide/${guide.slug}`}
                  className="font-semibold text-slate-900 hover:text-blue-700"
                >
                  가이드 읽기 →
                </Link>
                <Link
                  href={guide.relatedCalculator.href}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
                >
                  관련 계산기 열기
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
