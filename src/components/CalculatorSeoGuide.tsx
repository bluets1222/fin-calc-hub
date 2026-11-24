import { TAX_YEAR } from "@/constants/rates";

export interface SeoGuideStep {
  step: string;
  title: string;
  description: string;
}

export interface SeoGuideFaq {
  question: string;
  answer: string;
}

export interface CalculatorSeoGuideData {
  calculatorName: string;
  steps: SeoGuideStep[];
  formulaSummaryTitle: string;
  formulaDescription: string;
  formulaPoints: string[];
  faqs: SeoGuideFaq[];
}

interface CalculatorSeoGuideProps {
  data: CalculatorSeoGuideData;
}

/**
 * 계산기 UI 바로 아래에 배치되는 서버 렌더링(SSR/정적) SEO 및 사용자 안내 섹션입니다.
 */
export function CalculatorSeoGuide({ data }: CalculatorSeoGuideProps) {
  return (
    <section
      aria-label={`${data.calculatorName} 이용 안내 및 기준`}
      className="mt-10 space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* ① 계산기 사용법 (2~3단계 요약) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
              1
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {data.calculatorName} 사용법
            </h2>
          </div>
          <ol className="space-y-3.5">
            {data.steps.map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {item.step}
                </span>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-slate-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ② 적용 세율·계산 공식 및 기준 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-700 text-xs font-bold text-white">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {data.formulaSummaryTitle}
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              {TAX_YEAR}년 현행 기준
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-700">
            {data.formulaDescription}
          </p>
          <ul className="mt-3.5 space-y-2 border-t border-slate-100 pt-3.5 text-sm text-slate-700">
            {data.formulaPoints.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-0.5 font-bold text-blue-700">•</span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ③ 자주 묻는 질문 (FAQ 3개) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-700 text-xs font-bold text-white">
            3
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            핵심 자주 묻는 질문 (FAQ)
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {data.faqs.map((faq) => (
            <details key={faq.question} open className="group py-3.5 first:pt-0 last:pb-0">
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
