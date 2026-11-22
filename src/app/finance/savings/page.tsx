import type { Metadata } from "next";
import { SavingsCalculator } from "@/components/calculators/SavingsCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { INSURANCE_AND_INCOME_TAX } from "@/constants/rates";
import { SAVINGS_FAQS } from "@/lib/calculators/savings";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/finance/savings";
const PAGE_TITLE = "예금·적금 세후이자 계산기 (단리·월복리·비과세 비교)";
const PAGE_DESCRIPTION =
  "정기예금·정기적금 가입 금액, 기간, 연 이자율, 단리·월복리 및 과세 구분(일반과세 15.4%·세금우대 1.4%·비과세 0%)을 반영해 세후 만기 수령액과 절세 효과를 계산합니다.";

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
  { name: "예금·적금 이자 계산기", path: PAGE_PATH },
];

export default function SavingsPage() {
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
          buildFaqSchema(SAVINGS_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="금융 · 저축"
        title="예금 · 적금 세후이자 계산기"
        description="정기예금과 정기적금의 단리·월복리 이자를 비교하고, 일반과세(15.4%)·세금우대(1.4%)·비과세 적용 시 세후 만기 수령액과 절세 금액을 확인하세요."
        faqs={SAVINGS_FAQS}
        disclaimerOrg="금융감독원 금융상품한눈에 및 가입 금융기관"
        relatedGuide={{
          title: "예금·적금 단리 vs 월복리 차이와 세금우대(1.4%)·비과세 활용법",
          description:
            "적금 실효 이자가 예금의 절반인 이유와 상호금융 저율과세 활용 팁을 확인하세요.",
          href: "/guide/savings-compound-tax",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              이자소득 과세 구분 안내
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">과세 유형</th>
                    <th className="px-4 py-3">적용 세율</th>
                    <th className="px-4 py-3">대상 및 한도</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-medium">일반과세</td>
                    <td className="px-4 py-3 font-semibold">
                      {INSURANCE_AND_INCOME_TAX.savingsTaxRates.general}%
                    </td>
                    <td className="px-4 py-3">
                      소득세 14% + 지방소득세 1.4% (한도 제한 없음)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">세금우대 (저율과세)</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {INSURANCE_AND_INCOME_TAX.savingsTaxRates.preferential}%
                    </td>
                    <td className="px-4 py-3">
                      농협·수협·신협·새마을금고 조합원 등 1인 3,000만 원 한도
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">비과세 종합저축</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">
                      {INSURANCE_AND_INCOME_TAX.savingsTaxRates.exempt}%
                    </td>
                    <td className="px-4 py-3">
                      만 65세 이상, 장애인 등 요건 충족 시 5,000만 원 한도
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      >
        <SavingsCalculator />
      </CalculatorShell>
    </>
  );
}
