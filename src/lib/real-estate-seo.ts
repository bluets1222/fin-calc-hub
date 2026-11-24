import type { FaqEntry } from "@/components/seo/JsonLd";
import { calculateAcquisitionTax } from "@/lib/calculators/acquisition-tax";
import { calculateDsr } from "@/lib/calculators/dsr";
import { formatKRW, formatKoreanUnit } from "@/lib/format";
import type { ComplexDetail, SubscriptionItem } from "@/lib/real-estate-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export interface DynamicSeoGuideContent {
  fundSummaryTitle: string;
  fundSummaryText: string;
  faqs: FaqEntry[];
}

/**
 * 만원 단위 가격을 읽기 쉬운 한국어(예: 16억 2,500만 원)로 포맷합니다.
 */
export function formatManwonPrice(priceManwon: number): string {
  return formatKoreanUnit(priceManwon * 10_000);
}

/**
 * ㎡를 평형(3.3058㎡)으로 근사 변환합니다.
 */
export function sqmToPyeong(sqm: number): number {
  return Math.round((sqm / 3.3058) * 10) / 10;
}

/**
 * 단지 상세 페이지용 RealEstateListing JSON-LD 생성
 */
export function buildRealEstateListingSchema(params: {
  name: string;
  description: string;
  path: string;
  priceManwon?: number;
  address: string;
  datePosted?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: params.name,
    description: params.description,
    url: `${SITE_URL}${params.path}`,
    datePosted: params.datePosted ?? "2026-11-24",
    ...(params.priceManwon && params.priceManwon > 0
      ? {
          offers: {
            "@type": "Offer",
            price: String(params.priceManwon * 10_000),
            priceCurrency: "KRW",
          },
        }
      : {}),
    contentLocation: {
      "@type": "Place",
      name: params.address,
      address: params.address,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * 단지별 데이터 치환 매수 자금 분석 요약(약 300자) + FAQ 3가지(약 400자) 생성
 */
export function buildComplexSeoGuide(
  detail: ComplexDetail
): DynamicSeoGuideContent {
  const priceWon = detail.latestPrice * 10_000;
  const priceText = formatManwonPrice(detail.latestPrice);
  const typeLabel = detail.type === "apt" ? "아파트" : "오피스텔";
  const pyeong = sqmToPyeong(detail.latestArea);

  const acq = calculateAcquisitionTax({
    propertyType: detail.type === "apt" ? "house" : "officetel",
    price: priceWon,
    houseCount: "1",
    isRegulatedArea: false,
    isFirstHome: false,
    areaType: detail.latestArea <= 85 ? "under85" : "over85",
  });

  // 70% LTV 가정 대출 시 스트레스 DSR 40% 기준 필요 연소득 역산(참고치)
  const assumedLoan = Math.round(priceWon * 0.6);
  const dsrSample = calculateDsr({
    annualIncome: 100_000_000,
    loanAmount: assumedLoan,
    interestRate: 4.2,
    loanYears: 30,
    repaymentMethod: "equalPrincipalInterest",
    stressRate: 0.75,
    existingAnnualDebtService: 0,
  });
  const requiredIncomeWon = Math.round(dsrSample.totalAnnualDebtService / 0.4);

  const diffText =
    detail.diffPercentFromDong === 0
      ? `${detail.dongName} 평균 시세와 비슷한 수준`
      : detail.diffPercentFromDong > 0
        ? `${detail.dongName} 평균 대비 약 ${detail.diffPercentFromDong}% 높은 프리미엄 시세`
        : `${detail.dongName} 평균 대비 약 ${Math.abs(detail.diffPercentFromDong)}% 낮은 합리적 시세`;

  const buildYearText =
    detail.buildYear > 0 ? `${detail.buildYear}년 준공 ` : "";

  const fundSummaryText =
    `${detail.sigunguName} ${detail.dongName}에 위치한 ${buildYearText}${detail.name} (${typeLabel})의 최근 실거래가는 전용 ${detail.latestArea}㎡(약 ${pyeong}평) 기준 ${priceText}입니다. ` +
    `이는 ${diffText}입니다. 해당 금액으로 1주택 매수 시 예상 취득세 합계는 약 ${formatKRW(acq.totalTax)}(세율 ${acq.totalRate}%)이며, ` +
    `매매가의 60%(${formatKoreanUnit(assumedLoan)})를 연 4.2%·30년 만기(스트레스 DSR +0.75%)로 대출받을 경우 월 평균 상환액은 약 ${formatKRW(dsrSample.actualMonthlyPaymentAvg)}, ` +
    `1금융권 DSR 40% 통과를 위한 권장 세전 연소득은 약 ${formatKoreanUnit(requiredIncomeWon)} 수준입니다.`;

  const faqs: FaqEntry[] = [
    {
      question: `${detail.name} 전용 ${detail.latestArea}㎡ 매수 시 취득세는 얼마인가요?`,
      answer: `${priceText} 기준 ${detail.type === "apt" ? "1주택 일반세율" : "오피스텔 단일세율"} 적용 시 취득세·지방교육세·농특세 합계 약 ${formatKRW(acq.totalTax)}가 예상됩니다. 무주택 생애최초 조건 충족 시(12억 이하 주택) 최대 200만 원 감면이 가능합니다.`,
    },
    {
      question: `${detail.name}의 최근 실거래가 수준은 주변 시세 대비 어떤가요?`,
      answer: `${detail.name}의 최근 ㎡당 평균 단가는 ${detail.avgPricePerSqm.toLocaleString("ko-KR")}만 원으로, 같은 ${detail.dongName} 평균(${detail.dongAvgPricePerSqm.toLocaleString("ko-KR")}만 원/㎡) 대비 ${diffText}을 형성하고 있습니다.`,
    },
    {
      question: `${detail.name} 매수 시 부동산 중개보수(복비)는 얼마 정도 준비해야 하나요?`,
      answer: `거래금액 ${priceText} 기준 ${detail.type === "apt" ? "주택 매매 상한요율" : "오피스텔 매매 상한요율(0.5%)"} 이내에서 중개사와 협의하여 결정되며, 부가가치세(일반과세 10%)가 별도 부과될 수 있습니다.`,
    },
  ];

  return {
    fundSummaryTitle: `${detail.name} 매수 시 필요 자금 분석 요약`,
    fundSummaryText,
    faqs,
  };
}

/**
 * 청약 공고 상세 페이지용 자금 요약 + FAQ 3가지 생성
 */
export function buildSubscriptionSeoGuide(
  sub: SubscriptionItem
): DynamicSeoGuideContent {
  const statusLabel =
    sub.status === "active"
      ? "현재 청약 접수 중"
      : sub.status === "upcoming"
        ? `접수 시작까지 D-${sub.dDay}`
        : "최근 청약 접수 마감";

  const fundSummaryText =
    `${sub.region} 지역 ${sub.houseType || "분양"} 단지인 ${sub.name}(총 ${sub.totalCount.toLocaleString("ko-KR")}세대)은 ${statusLabel} 상태이며, ` +
    `청약 접수 기간은 ${sub.applyStart}부터 ${sub.applyEnd}까지입니다. ` +
    `분양 아파트는 계약금(통상 10%)·중도금(60%)·잔금(30%) 일정에 맞춰 자금을 조달해야 하며, ` +
    `입주 시점 잔금 대출 전환 시 스트레스 DSR 40% 규제가 적용되므로 사전에 취득세(생애최초 최대 200만 원 감면 여부)와 대출 한도를 미리 점검하는 것이 안전합니다.`;

  const faqs: FaqEntry[] = [
    {
      question: `${sub.name} 청약 일정과 당첨자 발표일은 언제인가요?`,
      answer: `청약 접수는 ${sub.applyStart}~${sub.applyEnd}에 진행되며${sub.winnerDate ? `, 당첨자 발표 예정일은 ${sub.winnerDate}입니다.` : "입니다. 세부 일정은 청약홈 모집공고문을 확인하세요."}`,
    },
    {
      question: `분양권 당첨 후 취득세는 언제 납부하나요?`,
      answer: `분양 아파트의 취득세는 청약 당첨 시점이 아니라 실제 준공 후 잔금 납부일(또는 소유권이전등기일 중 빠른 날)로부터 60일 이내에 신고·납부합니다.`,
    },
    {
      question: `중도금 대출과 입주 잔금 대출 시 DSR 적용이 다른가요?`,
      answer: `분양 당시 중도금 집단대출은 원칙적으로 DSR 규제에서 제외되지만, 입주 시점에 잔금 대출(주택담보대출)로 전환할 때는 개인별 DSR 40% 심사가 적용됩니다.`,
    },
  ];

  return {
    fundSummaryTitle: `${sub.name} 청약 자금·대출 핵심 분석`,
    fundSummaryText,
    faqs,
  };
}
