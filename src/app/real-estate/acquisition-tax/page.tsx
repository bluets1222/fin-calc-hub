import type { Metadata } from "next";
import { AcquisitionTaxCalculator } from "@/components/calculators/AcquisitionTaxCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { ACQUISITION_TAX } from "@/constants/rates";
import { ACQUISITION_TAX_FAQS } from "@/lib/calculators/acquisition-tax";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/real-estate/acquisition-tax";
const PAGE_TITLE = "부동산 취득세 계산기 (주택·오피스텔·생애최초 감면)";
const PAGE_DESCRIPTION =
  "주택·오피스텔 취득가액, 보유 주택 수(1~3주택 이상), 조정대상지역 여부, 생애최초 최대 200만 원 감면 및 전용면적 85㎡ 기준 지방교육세·농어촌특별세를 즉시 계산하세요.";

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
  { name: "부동산 취득세 계산기", path: PAGE_PATH },
];

export default function AcquisitionTaxPage() {
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
          buildFaqSchema(ACQUISITION_TAX_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="부동산 세금"
        title="부동산 취득세 계산기"
        description="주택·오피스텔 매수 시 납부해야 할 취득세, 지방교육세, 농어촌특별세 합계를 보유 주택 수와 생애최초 감면 조건에 맞춰 정확하게 산출합니다."
        faqs={ACQUISITION_TAX_FAQS}
        disclaimerOrg="위택스(WETAX) 및 관할 시·군·구청 세무과"
        relatedGuide={{
          title: "생애최초 주택 취득세 감면 조건과 1~3주택 세율 총정리",
          description:
            "감면 후 3년 실거주 추징 주의사항과 일시적 2주택 처분 기한을 확인하세요.",
          href: "/guide/acquisition-tax-first-home",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              부동산 취득세율 기준표 (유상거래)
            </h2>
            <p className="text-sm text-slate-600">
              주택 유상거래(매매)는 세대별 보유 주택 수와 조정대상지역 여부에
              따라 기본세율(1~3%) 또는 중과세율(8%, 12%)이 적용됩니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">구분</th>
                    <th className="px-4 py-3">취득세</th>
                    <th className="px-4 py-3">지방교육세</th>
                    <th className="px-4 py-3">농어촌특별세</th>
                    <th className="px-4 py-3">합계 세율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-medium">
                      1주택 (6억 원 이하)
                    </td>
                    <td className="px-4 py-3">1.0%</td>
                    <td className="px-4 py-3">0.1%</td>
                    <td className="px-4 py-3">0% (85㎡ 초과 시 0.2%)</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      1.1% ~ 1.3%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">
                      1주택 (6억 초과 ~ 9억 이하)
                    </td>
                    <td className="px-4 py-3">1.0% ~ 3.0%</td>
                    <td className="px-4 py-3">0.1% ~ 0.3%</td>
                    <td className="px-4 py-3">0% (85㎡ 초과 시 0.2%)</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      1.1% ~ 3.5%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">
                      1주택 (9억 원 초과)
                    </td>
                    <td className="px-4 py-3">3.0%</td>
                    <td className="px-4 py-3">0.3%</td>
                    <td className="px-4 py-3">0% (85㎡ 초과 시 0.2%)</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      3.3% ~ 3.5%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">
                      조정 2주택 / 비조정 3주택
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.heavyTax8.acquisition.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.heavyTax8.education.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.heavyTax8.rural.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-700">
                      {ACQUISITION_TAX.heavyTax8.total.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">
                      조정 3주택 이상
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.heavyTax12.acquisition.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.heavyTax12.education.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.heavyTax12.rural.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-700">
                      {ACQUISITION_TAX.heavyTax12.total.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">오피스텔 (일반)</td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.officetel.acquisition.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.officetel.education.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      {ACQUISITION_TAX.officetel.rural.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {ACQUISITION_TAX.officetel.total.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      >
        <AcquisitionTaxCalculator />
      </CalculatorShell>
    </>
  );
}
