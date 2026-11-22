import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { GUIDES, getGuideBySlug } from "@/data/guides";
import {
  JsonLd,
  buildArticleSchema,
  buildBreadcrumbSchema,
} from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/guide/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return { title: "가이드를 찾을 수 없습니다" };
  }

  const path = `/guide/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}${path}`,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: PageProps<"/guide/[slug]">) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const pagePath = `/guide/${guide.slug}`;
  const breadcrumbs = [
    { name: "홈", path: "/" },
    { name: "세무·금융 가이드", path: "/guide" },
    { name: guide.title, path: pagePath },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildArticleSchema({
            headline: guide.title,
            description: guide.description,
            path: pagePath,
            datePublished: guide.publishedAt,
            dateModified: guide.updatedAt,
          }),
          buildBreadcrumbSchema(breadcrumbs),
        ]}
      />

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <nav
          aria-label="현재 위치"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500"
        >
          <Link href="/" className="hover:text-slate-900 hover:underline">
            홈
          </Link>
          <span>/</span>
          <Link href="/guide" className="hover:text-slate-900 hover:underline">
            세무·금융 가이드
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{guide.category}</span>
        </nav>

        <header className="space-y-3 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white">
              {guide.category}
            </span>
            <span>{guide.readTime}</span>
            <span>·</span>
            <span>최종 업데이트: {guide.updatedAt}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {guide.title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            {guide.subtitle}
          </p>
        </header>

        {/* Key Summary Box */}
        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900">
            핵심 요약
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-800">
            {guide.keySummary.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-blue-700">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article Sections */}
        <div className="mt-8 space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p}
                  className="text-sm leading-relaxed text-slate-700 sm:text-base"
                >
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {section.tip && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  <strong className="font-bold">실전 팁: </strong>
                  {section.tip}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Guide Bottom Ad Slot */}
        <AdSlot slotId="guide-bottom" format="auto" className="mt-10" />

        {/* Related Calculator CTA */}
        <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            바로 계산해 보기
          </span>
          <h2 className="mt-1 text-lg font-bold sm:text-xl">
            {guide.relatedCalculator.label}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {guide.relatedCalculator.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={guide.relatedCalculator.href}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              계산기 열기 →
            </Link>
            <Link
              href="/guide"
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              다른 가이드 보기
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
