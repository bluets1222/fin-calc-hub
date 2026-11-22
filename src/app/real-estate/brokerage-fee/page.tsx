import type { Metadata } from "next";
import { BrokerageFeeCalculator } from "@/components/calculators/BrokerageFeeCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { BROKERAGE_FEE } from "@/constants/rates";
import { BROKERAGE_FEE_FAQS } from "@/lib/calculators/brokerage-fee";
import { formatKoreanUnit } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/real-estate/brokerage-fee";
const PAGE_TITLE = "부동산 중개보수·복비 계산기 (매매·전세·월세·부가세)";
const PAGE_DESCRIPTION =
  "아파트·주택·오피스텔·상가 매매 및 전월세 중개보수(복비) 상한요율과 한도액, 월세 환산보증금, 협의 요율, 부가가치세(10%·4%·면세) 포함 총 예상 비용을 계산합니다.";

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
  { name: "부동산 중개보수·복비 계산기", path: PAGE_PATH },
];

export default function BrokerageFeePage() {
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
          buildFaqSchema(BROKERAGE_FEE_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="부동산 거래"
        title="부동산 중개보수 · 복비 계산기"
        description="매매·전세·월세 거래 금액에 따른 법정 상한요율과 한도액을 자동 적용하고, 협의 요율과 부가가치세를 반영한 실제 예상 비용을 확인하세요."
        faqs={BROKERAGE_FEE_FAQS}
        disclaimerOrg="한국공인중개사협회 및 국토교통부 부동산 중개보수 요율표"
        relatedGuide={{
          title: "부동산 복비(중개보수) 상한요율 계산법과 협의·부가세 절약 팁",
          description:
            "월세 환산보증금 5천만 원 미만 특례와 복비 현금영수증 절세 팁을 확인하세요.",
          href: "/guide/brokerage-fee-negotiation",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              주택 중개보수 상한요율표 (공인중개사법 시행규칙)
            </h2>
            <p className="text-sm text-slate-600">
              법정 요율은 최대 상한선이며, 상한요율 범위 내에서 중개의뢰인과
              공인중개사가 협의하여 결정할 수 있습니다.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="overflow-x-auto">
                <h3 className="mb-2 text-sm font-bold text-slate-800">
                  주택 매매 · 교환
                </h3>
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="px-3 py-2.5">거래금액</th>
                      <th className="px-3 py-2.5">상한요율</th>
                      <th className="px-3 py-2.5">한도액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {BROKERAGE_FEE.houseSaleBrackets.map((b) => (
                      <tr key={b.label}>
                        <td className="px-3 py-2">{b.label}</td>
                        <td className="px-3 py-2 font-semibold">
                          {b.maxRate}%
                        </td>
                        <td className="px-3 py-2">
                          {b.limitAmount ? formatKoreanUnit(b.limitAmount) : "없음"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto">
                <h3 className="mb-2 text-sm font-bold text-slate-800">
                  주택 임대차 (전세 · 월세)
                </h3>
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="px-3 py-2.5">거래금액(환산)</th>
                      <th className="px-3 py-2.5">상한요율</th>
                      <th className="px-3 py-2.5">한도액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {BROKERAGE_FEE.houseLeaseBrackets.map((b) => (
                      <tr key={b.label}>
                        <td className="px-3 py-2">{b.label}</td>
                        <td className="px-3 py-2 font-semibold">
                          {b.maxRate}%
                        </td>
                        <td className="px-3 py-2">
                          {b.limitAmount ? formatKoreanUnit(b.limitAmount) : "없음"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      >
        <BrokerageFeeCalculator />
      </CalculatorShell>
    </>
  );
}
