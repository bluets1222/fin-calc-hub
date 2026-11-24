import type { Metadata } from "next";
import { LoanInterestCalculator } from "@/components/calculators/LoanInterestCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { CALCULATOR_SEO_GUIDES } from "@/data/calculatorSeoGuides";
import { LOAN_INTEREST_FAQS } from "@/lib/calculators/loan-interest";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/finance/loan-interest";
const PAGE_TITLE = "대출 이자 및 상환 스케줄 계산기 (원리금·원금균등·만기일시)";
const PAGE_DESCRIPTION =
  "대출 원금, 연 이자율, 기간, 거치 기간을 입력해 원리금균등·원금균등·만기일시상환 3가지 방식의 총이자를 한눈에 비교하고 회차별 상환 스케줄을 확인하세요.";

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
  { name: "대출 이자 계산기", path: PAGE_PATH },
];

export default function LoanInterestPage() {
  return (
    <>
      <JsonLd
        data={[
          buildWebAppSchema({
            name: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            path: PAGE_PATH,
          }),
          buildBreadcrumbSchema(BREADCRUMBS),
          buildFaqSchema(LOAN_INTEREST_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="금융 · 대출"
        title="대출 이자 및 상환 스케줄 계산기"
        description="원리금균등·원금균등·만기일시상환 3가지 방식의 총 대출이자와 월 납입금을 동시에 비교하고, 거치 기간을 포함한 회차별 상환 스케줄을 확인하세요."
        faqs={LOAN_INTEREST_FAQS}
        seoGuide={CALCULATOR_SEO_GUIDES["loan-interest"]}
        disclaimerOrg="대출 취급 금융기관(은행·보험사) 및 금융감독원 파인"
        relatedGuide={{
          title: "원리금균등·원금균등·만기일시상환, 총이자와 월 부담 비교 가이드",
          description:
            "내 현금흐름에 맞는 최적의 상환 방식 선택 기준과 거치 기간의 장단점을 알아보세요.",
          href: "/guide/loan-repayment-types",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              상환 방식별 특징 비교
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-900">원리금균등상환</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  매달 원금과 이자를 합산해 동일한 금액을 납부합니다. 가계
                  예산 관리가 가장 편리합니다.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-900">원금균등상환</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  매달 원금을 똑같이 갚아 이자가 점점 줄어듭니다. 3가지 방식 중
                  총 대출이자가 가장 적습니다.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-900">만기일시상환</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  기간 중 이자만 내고 만기에 원금을 한꺼번에 갚습니다. 월
                  부담은 적지만 총이자가 가장 큽니다.
                </p>
              </div>
            </div>
          </div>
        }
      >
        <LoanInterestCalculator />
      </CalculatorShell>
    </>
  );
}
