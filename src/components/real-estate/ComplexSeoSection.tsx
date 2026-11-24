import type { DynamicSeoGuideContent } from "@/lib/real-estate-seo";

interface ComplexSeoSectionProps {
  guide: DynamicSeoGuideContent;
}

/**
 * 단지/청약 상세 페이지 하단에 배치되는 동적 변수 치환 자금 분석 요약 + FAQ 3종 섹션입니다.
 */
export function ComplexSeoSection({ guide }: ComplexSeoSectionProps) {
  return (
    <section className="mt-10 space-y-6" aria-label="매수 자금 분석 및 FAQ">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">
          {guide.fundSummaryTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
          {guide.fundSummaryText}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          자주 묻는 질문 (FAQ)
        </h2>
        <div className="divide-y divide-slate-100">
          {guide.faqs.map((faq) => (
            <details
              key={faq.question}
              open
              className="group py-3.5 first:pt-0 last:pb-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-900 sm:text-base">
                <span>Q. {faq.question}</span>
                <span className="shrink-0 text-xs text-slate-400 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
