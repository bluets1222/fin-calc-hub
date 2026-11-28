import type { Metadata } from "next";
import { GiftTaxCalculator } from "@/components/calculators/GiftTaxCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { GIFT_TAX } from "@/constants/rates";
import { CALCULATOR_SEO_GUIDES } from "@/data/calculatorSeoGuides";
import { GIFT_TAX_FAQS } from "@/lib/calculators/gift-tax";
import { formatKoreanUnit } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/tax/gift-tax";
const PAGE_TITLE = "[2026년 최신] 증여세 간편 모의 계산기 (공제한도·10년 합산·자진신고 3%)";
const PAGE_DESCRIPTION =
  "배우자(6억), 직계존속(성인 5천만·미성년 2천만), 직계비속, 기타친족 증여재산공제와 10년 이내 기증여 합산, 세대생략 30% 할증, 자진신고 3% 세액공제를 즉시 계산합니다.";

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
  { name: "증여세 간편 모의 계산기", path: PAGE_PATH },
];

export default function GiftTaxPage() {
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
          buildFaqSchema(GIFT_TAX_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="증여 · 절세"
        title="증여세 간편 모의 계산기"
        description="증여자 관계별 10년 공제 한도와 기증여재산 합산액, 누진세율(10~50%), 세대생략 할증 및 자진신고 세액공제(3%)를 반영한 예상 증여세를 계산합니다."
        faqs={GIFT_TAX_FAQS}
        seoGuide={CALCULATOR_SEO_GUIDES["gift-tax"]}
        disclaimerOrg="국세청 홈택스(Hometax) 및 세무 전문가"
        relatedGuide={{
          title: "증여세 면제한도와 10년 합산 과세, 자진신고 3% 공제 활용법",
          description:
            "공제 한도 이내 0원 신고의 장점과 혼인·출산 추가 공제 활용 팁을 확인하세요.",
          href: "/guide/gift-tax-10year-rule",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              증여세 과세표준 구간별 세율표
            </h2>
            <p className="text-sm text-slate-600">
              과세표준(합산 증여재산가액 - 증여재산공제)에 아래 세율을 곱하고
              누진공제액을 차감하여 산출세액을 계산합니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">과세표준 구간</th>
                    <th className="px-4 py-3">세율</th>
                    <th className="px-4 py-3">누진공제액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {GIFT_TAX.brackets.map((b) => (
                    <tr key={b.rangeLabel}>
                      <td className="px-4 py-3">{b.rangeLabel}</td>
                      <td className="px-4 py-3 font-semibold">{b.rate}%</td>
                      <td className="px-4 py-3">
                        {b.progressiveDeduction > 0
                          ? formatKoreanUnit(b.progressiveDeduction)
                          : "없음"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      >
        <GiftTaxCalculator />
      </CalculatorShell>
    </>
  );
}
