import type { Metadata } from "next";
import { SeveranceCalculator } from "@/components/calculators/SeveranceCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { CALCULATOR_SEO_GUIDES } from "@/data/calculatorSeoGuides";
import { SEVERANCE_FAQS } from "@/lib/calculators/severance";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/salary/severance";
const PAGE_TITLE = "퇴직금 모의 계산기 (평균임금·통상임금 비교·퇴직소득세)";
const PAGE_DESCRIPTION =
  "입사일·퇴사일 재직일수 자동 계산, 퇴직 전 3개월 급여·상여금·연차수당 기반 1일 평균임금과 통상임금 비교, 근속연수 공제 반영 세후 실수령 퇴직금을 계산합니다.";

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
  { name: "퇴직금 모의 계산기", path: PAGE_PATH },
];

export default function SeverancePage() {
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
          buildFaqSchema(SEVERANCE_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="연봉 · 퇴직"
        title="퇴직금 모의 계산기"
        description="입·퇴사일 기준 재직일수와 1일 평균임금(상여금·연차수당 포함)을 계산하고, 근속연수공제를 반영한 퇴직소득세 차감 후 예상 실수령 퇴직금을 산출합니다."
        faqs={SEVERANCE_FAQS}
        seoGuide={CALCULATOR_SEO_GUIDES["severance"]}
        disclaimerOrg="고용노동부 퇴직금 계산기 및 국세청 홈택스(퇴직소득세)"
        relatedGuide={{
          title: "퇴직금 계산 공식(평균임금 vs 통상임금)과 퇴직소득세 절세법",
          description:
            "3개월 급여 외 상여금·연차수당 산입 방법과 IRP 과세이연 전략을 확인하세요.",
          href: "/guide/severance-pay-formula",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              법정 퇴직금 산정 공식 및 근속연수공제
            </h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              <p className="font-mono font-semibold">
                퇴직금 = 1일 평균임금 × 30일 × (총 계속근로일수 ÷ 365)
              </p>
              <p className="mt-1 text-xs text-slate-600">
                ※ 1일 통상임금이 1일 평균임금보다 큰 경우, 근로기준법에 따라
                1일 통상임금을 기준으로 계산합니다.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">근속연수 구간</th>
                    <th className="px-4 py-3">퇴직소득 근속연수공제액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-medium">5년 이하</td>
                    <td className="px-4 py-3">100만 원 × 근속연수</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">5년 초과 ~ 10년 이하</td>
                    <td className="px-4 py-3">
                      500만 원 + 200만 원 × (근속연수 - 5)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">10년 초과 ~ 20년 이하</td>
                    <td className="px-4 py-3">
                      1,500만 원 + 250만 원 × (근속연수 - 10)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">20년 초과</td>
                    <td className="px-4 py-3">
                      4,000만 원 + 300만 원 × (근속연수 - 20)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      >
        <SeveranceCalculator />
      </CalculatorShell>
    </>
  );
}
