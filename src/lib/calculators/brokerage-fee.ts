import type { FaqEntry } from "@/components/seo/JsonLd";
import { BROKERAGE_FEE, type BrokerageBracketSpec } from "@/constants/rates";

export type DealType = "sale" | "jeonse" | "monthly";
export type BrokeragePropertyType = "house" | "officetel" | "other";
export type VatType = "general" | "simple" | "exempt";

export interface BrokerageFeeInput {
  dealType: DealType;
  propertyType: BrokeragePropertyType;
  amount: number; // 매매가 또는 전세보증금, 월세일 경우 보증금
  monthlyRent: number; // 월세 금액
  vatType: VatType;
  customRate?: number | null; // 사용자가 직접 조정한 협의 요율(%)
}

export interface BrokerageFeeResult {
  baseAmount: number; // 계산 기준 금액 (월세는 환산보증금)
  isConvertedRentApplied: boolean;
  conversionMultiplier: number; // 100 또는 70
  maxRate: number; // 법정 상한요율 (%)
  appliedRate: number; // 실제 적용 요율 (%)
  limitAmount: number | null; // 상한 한도액 (원), 없으면 null
  isLimitApplied: boolean;
  rawFee: number; // 한도 적용 전 수수료
  brokerageFee: number; // 한도 적용 후 최종 중개보수
  vatRate: number; // 10, 4, 0 (%)
  vatAmount: number;
  totalCost: number;
  bracketLabel: string;
}

/**
 * 월세 환산보증금을 계산합니다.
 * 기본: 보증금 + (월세 × 100)
 * 단, 합계액이 5,000만 원 미만일 경우 보증금 + (월세 × 70) 적용
 */
function calculateConvertedDeposit(deposit: number, monthlyRent: number): {
  baseAmount: number;
  multiplier: number;
} {
  const standard =
    deposit + monthlyRent * BROKERAGE_FEE.monthlyStandardMultiplier;
  if (standard < BROKERAGE_FEE.monthlyLowThreshold) {
    return {
      baseAmount: deposit + monthlyRent * BROKERAGE_FEE.monthlyLowMultiplier,
      multiplier: BROKERAGE_FEE.monthlyLowMultiplier,
    };
  }
  return {
    baseAmount: standard,
    multiplier: BROKERAGE_FEE.monthlyStandardMultiplier,
  };
}

function findBracket(
  brackets: readonly BrokerageBracketSpec[],
  amount: number
): {
  maxRate: number;
  limitAmount: number | null;
  label: string;
} {
  const found =
    brackets.find(
      (b) => b.maxAmount === null || amount < b.maxAmount
    ) ?? brackets[brackets.length - 1];
  return {
    maxRate: found.maxRate,
    limitAmount: found.limitAmount,
    label: found.label,
  };
}

export function getBrokerageMaxSpec(
  propertyType: BrokeragePropertyType,
  dealType: DealType,
  baseAmount: number
): { maxRate: number; limitAmount: number | null; label: string } {
  if (propertyType === "house") {
    return dealType === "sale"
      ? findBracket(BROKERAGE_FEE.houseSaleBrackets, baseAmount)
      : findBracket(BROKERAGE_FEE.houseLeaseBrackets, baseAmount);
  }
  if (propertyType === "officetel") {
    return dealType === "sale"
      ? {
          maxRate: BROKERAGE_FEE.officetelRates.sale,
          limitAmount: null,
          label: "오피스텔 매매·교환",
        }
      : {
          maxRate: BROKERAGE_FEE.officetelRates.lease,
          limitAmount: null,
          label: "오피스텔 임대차",
        };
  }
  return {
    maxRate: BROKERAGE_FEE.otherMaxRate,
    limitAmount: null,
    label: "주택 외 부동산 (상가·토지 등)",
  };
}

export function calculateBrokerageFee(
  input: BrokerageFeeInput
): BrokerageFeeResult {
  const amount = Math.max(0, Math.round(input.amount));
  const monthlyRent = Math.max(0, Math.round(input.monthlyRent));

  let baseAmount = amount;
  let isConvertedRentApplied = false;
  let conversionMultiplier: number = BROKERAGE_FEE.monthlyStandardMultiplier;

  if (input.dealType === "monthly") {
    const converted = calculateConvertedDeposit(amount, monthlyRent);
    baseAmount = converted.baseAmount;
    conversionMultiplier = converted.multiplier;
    isConvertedRentApplied = true;
  }

  const spec = getBrokerageMaxSpec(input.propertyType, input.dealType, baseAmount);
  const appliedRate =
    input.customRate !== undefined && input.customRate !== null
      ? Math.min(spec.maxRate, Math.max(0, input.customRate))
      : spec.maxRate;

  const rawFee = Math.round(baseAmount * (appliedRate / 100));
  const isLimitApplied =
    spec.limitAmount !== null && rawFee > spec.limitAmount;
  const brokerageFee =
    spec.limitAmount !== null ? Math.min(rawFee, spec.limitAmount) : rawFee;

  const vatRate = BROKERAGE_FEE.vatRates[input.vatType];
  const vatAmount = Math.round(brokerageFee * (vatRate / 100));
  const totalCost = brokerageFee + vatAmount;

  return {
    baseAmount,
    isConvertedRentApplied,
    conversionMultiplier,
    maxRate: spec.maxRate,
    appliedRate,
    limitAmount: spec.limitAmount,
    isLimitApplied,
    rawFee,
    brokerageFee,
    vatRate,
    vatAmount,
    totalCost,
    bracketLabel: spec.label,
  };
}

export const BROKERAGE_FEE_FAQS: FaqEntry[] = [
  {
    question: "월세 거래 시 중개보수 기준 금액(환산보증금)은 어떻게 계산하나요?",
    answer:
      "월세는 기본적으로 '보증금 + (월세 × 100)'으로 거래금액을 환산합니다. 다만 이 금액이 5,000만 원 미만일 경우에는 공인중개사법 시행규칙에 따라 '보증금 + (월세 × 70)'을 적용해 보수 부담을 낮춰줍니다.",
  },
  {
    question: "법정 상한요율은 무조건 그 비율대로 내야 하나요?",
    answer:
      "아닙니다. 법정 요율은 중개사가 받을 수 있는 '상한선(최대치)'을 의미합니다. 실제 중개보수는 상한요율 이내에서 의뢰인과 공인중개사가 계약 전 협의를 통해 자유롭게 낮춰 정할 수 있습니다.",
  },
  {
    question: "중개보수에도 부가가치세(VAT) 10%가 붙나요?",
    answer:
      "공인중개사 사무소가 일반과세자인 경우 중개보수의 10%를 부가가치세로 별도 청구할 수 있습니다. 간이과세자인 경우 부가가치세율은 4%(연 매출 기준 충족 시 부가세 면제 또는 4% 적용)이며, 영수증이나 현금영수증 발급 시 세액공제(연말정산·양도세 필요경비) 자료로 활용할 수 있습니다.",
  },
  {
    question: "오피스텔 중개보수 상한요율 0.5% / 0.4%는 모든 오피스텔에 적용되나요?",
    answer:
      "전용면적 85㎡ 이하이면서 상하수도 시설이 갖추어진 전용 입식 부엌, 전용 수세식 화장실 및 목욕시설을 갖춘 주거용 오피스텔에 한해 매매 0.5%, 임대차 0.4% 상한요율이 적용됩니다. 해당 요건을 충족하지 않는 업무용 오피스텔은 주택 외 부동산(최대 0.9%) 기준이 적용됩니다.",
  },
  {
    question: "중개보수는 매수인과 매도인(또는 임대인과 임차인)이 각각 부담하나요?",
    answer:
      "네, 법정 중개보수는 거래 당사자 쌍방으로부터 각각 받을 수 있도록 규정되어 있습니다. 따라서 매도인과 매수인이 각각 계산된 중개보수(상한요율 이내 협의 금액)를 부담하게 됩니다.",
  },
];
