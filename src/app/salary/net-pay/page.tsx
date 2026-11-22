import type { Metadata } from "next";
import { NetPayCalculator } from "@/components/calculators/NetPayCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { INSURANCE_AND_INCOME_TAX } from "@/constants/rates";
import { NET_PAY_FAQS } from "@/lib/calculators/net-pay";
import { formatKoreanUnit } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/salary/net-pay";
const PAGE_TITLE = "연봉 실수령액 계산기 (4대보험·근로소득세·비과세 반영)";
const PAGE_DESCRIPTION =
  "연봉 또는 월급, 비과세 식대(20만 원), 부양가족 수, 20세 이하 자녀 수를 입력해 국민연금(상한액 반영)·건강보험·고용보험·근로소득세 공제 후 월 예상 실수령액을 계산합니다.";

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
  { name: "연봉 실수령액 계산기", path: PAGE_PATH },
];

export default function NetPayPage() {
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
          buildFaqSchema(NET_PAY_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="연봉 · 급여"
        title="연봉 실수령액 계산기"
        description="세전 연봉(또는 월급)에서 국민연금·건강보험·장기요양보험·고용보험과 근로소득세·지방소득세를 제외한 월 예상 실수령액을 간편하게 확인하세요."
        faqs={NET_PAY_FAQS}
        disclaimerOrg="국세청 홈택스(근로소득 간이세액표) 및 국민연금공단·건강보험공단"
        relatedGuide={{
          title: "연봉 실수령액을 높이는 비과세·인적공제·4대보험 절세 포인트",
          description:
            "비과세 식대 20만 원 효과와 부양가족·자녀세액공제 활용법을 확인하세요.",
          href: "/guide/net-pay-tax-saving",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              4대보험 근로자 부담 요율 기준
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">보험 항목</th>
                    <th className="px-4 py-3">근로자 부담률</th>
                    <th className="px-4 py-3">산정 기준 및 비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-medium">국민연금</td>
                    <td className="px-4 py-3 font-semibold">
                      {INSURANCE_AND_INCOME_TAX.nationalPensionRate}%
                    </td>
                    <td className="px-4 py-3">
                      기준소득월액 상한{" "}
                      {formatKoreanUnit(
                        INSURANCE_AND_INCOME_TAX.nationalPensionUpperLimit
                      )}{" "}
                      · 하한{" "}
                      {formatKoreanUnit(
                        INSURANCE_AND_INCOME_TAX.nationalPensionLowerLimit
                      )}{" "}
                      적용
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">건강보험</td>
                    <td className="px-4 py-3 font-semibold">
                      {INSURANCE_AND_INCOME_TAX.healthInsuranceRate}%
                    </td>
                    <td className="px-4 py-3">과세급여 기준 (총 7.09%의 절반)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">장기요양보험</td>
                    <td className="px-4 py-3 font-semibold">
                      건보료의{" "}
                      {INSURANCE_AND_INCOME_TAX.longTermCareRateOfHealth}%
                    </td>
                    <td className="px-4 py-3">산출된 건강보험료에 비례 부과</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">고용보험</td>
                    <td className="px-4 py-3 font-semibold">
                      {INSURANCE_AND_INCOME_TAX.employmentInsuranceRate}%
                    </td>
                    <td className="px-4 py-3">실업급여 근로자 부담분</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      >
        <NetPayCalculator />
      </CalculatorShell>
    </>
  );
}
