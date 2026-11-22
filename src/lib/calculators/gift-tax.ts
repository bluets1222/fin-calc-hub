import type { FaqEntry } from "@/components/seo/JsonLd";
import { GIFT_TAX } from "@/constants/rates";

export type DonorRelation =
  | "spouse"
  | "linealAscendantAdult"
  | "linealAscendantMinor"
  | "linealDescendant"
  | "otherRelative";

export interface GiftTaxInput {
  relation: DonorRelation;
  giftAmount: number; // 이번 증여재산가액 (원)
  priorGiftAmount: number; // 10년 이내 기증여재산 합산액 (원)
  isGenerationSkipping: boolean; // 세대생략 할증 (30%)
  isSelfReport: boolean; // 기한 내 자진신고 세액공제 (3%)
}

export interface GiftTaxResult {
  deductionLimit: number; // 증여재산공제 한도
  appliedDeduction: number; // 실제 적용 공제액
  totalGiftAmount: number; // 합산 증여재산가액
  taxBase: number; // 과세표준
  taxRate: number; // 적용 세율 (%)
  progressiveDeduction: number; // 누진공제액
  baseCalculatedTax: number; // 산출세액 (할증 전)
  generationSkippingSurcharge: number; // 세대생략 할증세액 (30%)
  calculatedTaxWithSurcharge: number; // 할증 포함 산출세액
  selfReportDiscount: number; // 기한 내 자진신고 공제액 (3%)
  finalTax: number; // 최종 납부할 증여세액
  bracketLabel: string;
}

export const DONOR_RELATION_MAP: Record<
  DonorRelation,
  { label: string; deduction: number; description: string }
> = {
  spouse: {
    label: "배우자",
    deduction: GIFT_TAX.deductions.spouse,
    description: "10년간 최대 6억 원 공제",
  },
  linealAscendantAdult: {
    label: "직계존속 (성인 수증자)",
    deduction: GIFT_TAX.deductions.linealAscendantAdult,
    description: "부모·조부모 → 성인 자녀·손주 (5,000만 원 공제)",
  },
  linealAscendantMinor: {
    label: "직계존속 (미성년 수증자)",
    deduction: GIFT_TAX.deductions.linealAscendantMinor,
    description: "부모·조부모 → 미성년자 (2,000만 원 공제)",
  },
  linealDescendant: {
    label: "직계비속",
    deduction: GIFT_TAX.deductions.linealDescendant,
    description: "자녀·손주 → 부모·조부모 (5,000만 원 공제)",
  },
  otherRelative: {
    label: "기타 친족",
    deduction: GIFT_TAX.deductions.otherRelative,
    description: "6촌 이내 혈족·4촌 이내 인척 (1,000만 원 공제)",
  },
};

function getGiftTaxBracket(taxBase: number): {
  rate: number;
  progressiveDeduction: number;
  label: string;
} {
  const found =
    GIFT_TAX.brackets.find(
      (b) => b.maxTaxBase === null || taxBase <= b.maxTaxBase
    ) ?? GIFT_TAX.brackets[GIFT_TAX.brackets.length - 1];
  return {
    rate: found.rate,
    progressiveDeduction: found.progressiveDeduction,
    label: found.label,
  };
}

export function calculateGiftTax(input: GiftTaxInput): GiftTaxResult {
  const giftAmount = Math.max(0, Math.round(input.giftAmount));
  const priorGiftAmount = Math.max(0, Math.round(input.priorGiftAmount));
  const totalGiftAmount = giftAmount + priorGiftAmount;

  const deductionLimit = DONOR_RELATION_MAP[input.relation].deduction;
  const appliedDeduction = Math.min(totalGiftAmount, deductionLimit);
  const taxBase = Math.max(0, totalGiftAmount - deductionLimit);

  if (taxBase === 0) {
    return {
      deductionLimit,
      appliedDeduction,
      totalGiftAmount,
      taxBase: 0,
      taxRate: 0,
      progressiveDeduction: 0,
      baseCalculatedTax: 0,
      generationSkippingSurcharge: 0,
      calculatedTaxWithSurcharge: 0,
      selfReportDiscount: 0,
      finalTax: 0,
      bracketLabel: "공제 한도 이내 (과세표준 0원)",
    };
  }

  const bracket = getGiftTaxBracket(taxBase);
  const baseCalculatedTax = Math.max(
    0,
    Math.round(taxBase * (bracket.rate / 100) - bracket.progressiveDeduction)
  );
  const generationSkippingSurcharge = input.isGenerationSkipping
    ? Math.round(
        baseCalculatedTax * (GIFT_TAX.generationSkippingSurchargeRate / 100)
      )
    : 0;
  const calculatedTaxWithSurcharge =
    baseCalculatedTax + generationSkippingSurcharge;
  const selfReportDiscount = input.isSelfReport
    ? Math.round(
        calculatedTaxWithSurcharge * (GIFT_TAX.selfReportDiscountRate / 100)
      )
    : 0;
  const finalTax = Math.max(0, calculatedTaxWithSurcharge - selfReportDiscount);

  return {
    deductionLimit,
    appliedDeduction,
    totalGiftAmount,
    taxBase,
    taxRate: bracket.rate,
    progressiveDeduction: bracket.progressiveDeduction,
    baseCalculatedTax,
    generationSkippingSurcharge,
    calculatedTaxWithSurcharge,
    selfReportDiscount,
    finalTax,
    bracketLabel: bracket.label,
  };
}

export const GIFT_TAX_FAQS: FaqEntry[] = [
  {
    question: "증여재산공제 한도는 누구에게 받느냐에 따라 합산되나요?",
    answer:
      "네. 10년 이내에 동일인(직계존속의 경우 그 배우자 포함, 즉 아버지와 어머니 합산)으로부터 받은 증여재산은 모두 합산해 공제 한도를 적용합니다. 예를 들어 성인 자녀가 10년 내 아버지에게 3천만 원, 어머니에게 2천만 원을 받았다면 직계존속 공제 한도 5천만 원을 모두 소진하게 됩니다.",
  },
  {
    question: "세금 신고 기한과 자진신고 세액공제(3%) 기준은 무엇인가요?",
    answer:
      "증여세는 증여받은 날이 속하는 달의 말일로부터 3개월 이내에 수증자 주소지 관할 세무서 또는 홈택스(손택스)를 통해 신고·납부해야 합니다. 법정 신고기한 내에 신고하면 산출세액의 3%를 세액공제 받을 수 있습니다.",
  },
  {
    question: "세대생략 할증과세(30%)는 언제 적용되나요?",
    answer:
      "수증자가 증여자의 자녀가 아닌 직계비속(예: 조부모가 손주에게 직접 증여)인 경우 산출세액의 30%가 할증 과세됩니다. 단, 수증자가 미성년자이면서 증여재산가액이 20억 원을 초과하는 경우에는 40% 할증이 적용됩니다.",
  },
  {
    question: "10년 이내 기증여재산이 있는 경우 이미 낸 세금은 어떻게 되나요?",
    answer:
      "과거 증여 시 납부했던 증여세 산출세액은 이번 합산 과세로 계산된 산출세액에서 '기납부세액 공제'로 차감됩니다. 본 간편 계산기는 합산 과세표준 기준 총 산출세액을 보여주므로, 기존 납부세액이 있다면 최종 납부세액에서 해당 금액만큼 추가로 줄어듭니다.",
  },
  {
    question: "혼인·출산 증여재산공제(최대 1억 원 추가)는 별도인가요?",
    answer:
      "네. 혼인신고일 전후 각 2년(총 4년) 또는 자녀 출생일·입양신고일로부터 2년 이내에 직계존속으로부터 증여받는 경우, 기본 공제 5,000만 원 외에 추가로 1억 원까지 혼인·출산 증여재산공제를 적용받을 수 있습니다.",
  },
];
