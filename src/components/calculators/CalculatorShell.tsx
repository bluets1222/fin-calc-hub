import Link from "next/link";
import type { ReactNode } from "react";
import { AdSlot } from "@/components/AdSlot";
import { CalculatorSeoGuide, type CalculatorSeoGuideData } from "@/components/CalculatorSeoGuide";
import { CalculatorSubTabs } from "@/components/calculators/CalculatorSubTabs";
import type { BreadcrumbEntry, FaqEntry } from "@/components/seo/JsonLd";
import { LAST_UPDATED, TAX_YEAR } from "@/constants/rates";

interface CalculatorShellProps {
  breadcrumbs: BreadcrumbEntry[];
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
  seoGuide?: CalculatorSeoGuideData;
  referenceSection: ReactNode;
  faqs: FaqEntry[];
  disclaimerOrg: string;
  relatedGuide?: {
    title: string;
    description: string;
    href: string;
  };
}

export function CalculatorShell({
  breadcrumbs,
  badge,
  title,
  description,
  children,
  seoGuide,
  referenceSection,
  faqs,
  disclaimerOrg,
  relatedGuide,
}: CalculatorShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Quick Calculator Sub-Tab Bar */}
      <CalculatorSubTabs />

      {/* Breadcrumb */}
      <nav aria-label="현재 위치" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <span key={crumb.path} className="flex items-center gap-1.5">
              {idx > 0 && <span aria-hidden="true">/</span>}
              {isLast ? (
                <span className="font-semibold text-slate-800">{crumb.name}</span>
              ) : (
                <Link href={crumb.path} className="hover:text-slate-900 hover:underline">
                  {crumb.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Header */}
      <header className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {badge}
          </span>
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
            {TAX_YEAR}년 기준 (업데이트 {LAST_UPDATED})
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            서버 미전송 · 100% 브라우저 계산
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {description}
        </p>
      </header>

      {/* Top Ad Slot */}
      <AdSlot slotId="calc-top" format="horizontal" className="mb-6" />

      {/* Interactive Calculator */}
      <section aria-label="계산기 입력 및 결과">{children}</section>

      {/* SEO & User Guide Section */}
      {seoGuide && <CalculatorSeoGuide data={seoGuide} />}

      {/* Reference / Rate Table */}
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        {referenceSection}
      </section>

      {/* Related Guide CTA */}
      {relatedGuide && (
        <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                함께 읽으면 좋은 가이드
              </span>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                {relatedGuide.title}
              </h2>
              <p className="text-sm text-slate-600">{relatedGuide.description}</p>
            </div>
            <Link
              href={relatedGuide.href}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              가이드 자세히 보기 →
            </Link>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="mb-5 text-xl font-bold text-slate-900">
          자주 묻는 질문 (FAQ)
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-900 sm:text-base">
                <span>Q. {faq.question}</span>
                <span className="shrink-0 text-slate-400 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Official Disclaimer */}
      <aside className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-xs leading-relaxed text-amber-950 sm:text-sm">
        <p className="font-bold">
          공식 기관 확인 및 면책 안내 ({TAX_YEAR}년 기준 · 최종 반영{" "}
          {LAST_UPDATED})
        </p>
        <p className="mt-1 text-amber-900">
          본 계산기의 산출 결과는 일반적인 법령 및 기준을 반영한 모의 계산
          참고치입니다. 실제 세액·보수·대출 한도는 감면 특례, 지방자치단체 조례,
          개인 신용 및 금융기관 심사 기준에 따라 달라질 수 있으므로, 최종 결정 전
          반드시 <strong>{disclaimerOrg}</strong> 등 공식 기관이나 전문가에게
          확인하시기 바랍니다.
        </p>
      </aside>
    </div>
  );
}
