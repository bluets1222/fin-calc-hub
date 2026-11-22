import type { Metadata } from "next";
import { DsrCalculator } from "@/components/calculators/DsrCalculator";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from "@/components/seo/JsonLd";
import { DSR_LIMITS } from "@/constants/rates";
import { DSR_FAQS } from "@/lib/calculators/dsr";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/finance/dsr";
const PAGE_TITLE = "주담대·신용대출 DSR 및 월 상환액 계산기 (스트레스 DSR)";
const PAGE_DESCRIPTION =
  "연소득, 대출금액, 금리, 기간, 상환 방식(원리금균등·원금균등) 및 스트레스 DSR 가산금리(0%·0.75%·1.5%)를 반영해 예상 DSR 비율과 추가 대출 가능 여력을 계산하세요.";

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
  { name: "DSR 및 월 상환액 계산기", path: PAGE_PATH },
];

export default function DsrPage() {
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
          buildFaqSchema(DSR_FAQS),
        ]}
      />

      <CalculatorShell
        breadcrumbs={BREADCRUMBS}
        badge="금융 · 대출"
        title="주담대·신용대출 DSR 및 월 상환액 계산기"
        description="세전 연소득과 기존 대출, 스트레스 DSR 가산금리를 반영해 1금융권(40%)·2금융권(50%) 한도 대비 예상 DSR 비율과 월 상환액을 간편하게 점검하세요."
        faqs={DSR_FAQS}
        disclaimerOrg="금융감독원 및 대출 취급 금융기관(은행·보험사 등)"
        relatedGuide={{
          title: "스트레스 DSR 시대, 주담대·신용대출 한도를 높이는 실전 전략",
          description:
            "마이너스통장 정리, 대출 만기 설정, 상품 유형 선택에 따른 한도 변화를 확인하세요.",
          href: "/guide/dsr-loan-limit-tips",
        }}
        referenceSection={
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              DSR 산정 공식 및 금융권 한도 기준
            </h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              <p className="font-mono font-semibold">
                DSR (%) = (신규 대출 연간 원리금 + 기존 대출 연간 원리금) ÷
                세전 연소득 × 100
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  1금융권 (시중은행)
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  DSR {DSR_LIMITS.tier1BankLimit}%
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  총 대출액 1억 원 초과 차주에게 적용되는 기본 한도입니다.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  2금융권 (저축은행·보험)
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  DSR {DSR_LIMITS.tier2BankLimit}%
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  상호금융·보험·캐피탈·저축은행에 적용되는 상한 기준입니다.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  스트레스 DSR 가산금리
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  +0.75% ~ 1.5%
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  한도 산정 시에만 가산되며 실제 납부 이자는 기본 금리
                  기준입니다.
                </p>
              </div>
            </div>
          </div>
        }
      >
        <DsrCalculator />
      </CalculatorShell>
    </>
  );
}
