import type { FaqEntry } from "@/components/seo/JsonLd";
import { INSURANCE_AND_INCOME_TAX } from "@/constants/rates";

export type SavingsProductType = "deposit" | "installment";
export type InterestCalcType = "simple" | "compound";
export type SavingsTaxType = "general" | "preferential" | "exempt";

export interface SavingsInput {
  productType: SavingsProductType;
  amount: number; // 예치금(예금) 또는 월 납입액(적금)
  months: number; // 기간 (개월)
  annualRate: number; // 연 이자율 (%)
  interestType: InterestCalcType; // 단리 / 월복리
  taxType: SavingsTaxType; // 일반과세 15.4% / 세금우대 1.4% / 비과세 0%
}

export interface SavingsResult {
  totalPrincipal: number;
  grossInterest: number;
  taxRate: number; // %
  taxAmount: number;
  netInterest: number;
  netMaturityAmount: number;
  generalTaxAmount: number;
  taxSavedAmount: number; // 일반과세 대비 절세액
}

const TAX_RATE_MAP: Record<SavingsTaxType, number> =
  INSURANCE_AND_INCOME_TAX.savingsTaxRates;

function calcGrossInterest(
  productType: SavingsProductType,
  amount: number,
  months: number,
  annualRate: number,
  interestType: InterestCalcType
): number {
  if (amount <= 0 || months <= 0 || annualRate <= 0) return 0;

  const r = annualRate / 100;
  const monthlyRate = r / 12;

  if (productType === "deposit") {
    if (interestType === "simple") {
      return Math.round(amount * r * (months / 12));
    }
    return Math.round(amount * (Math.pow(1 + monthlyRate, months) - 1));
  }

  // 정기적금 (월초 납입 기준)
  if (interestType === "simple") {
    return Math.round(amount * r * ((months * (months + 1)) / 24));
  }
  const futureValue =
    amount *
    ((1 + monthlyRate) * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
  return Math.round(futureValue - amount * months);
}

export function calculateSavings(input: SavingsInput): SavingsResult {
  const amount = Math.max(0, Math.round(input.amount));
  const months = Math.max(1, Math.min(240, Math.round(input.months)));
  const annualRate = Math.max(0, input.annualRate);

  const totalPrincipal =
    input.productType === "deposit" ? amount : amount * months;

  const grossInterest = calcGrossInterest(
    input.productType,
    amount,
    months,
    annualRate,
    input.interestType
  );

  const taxRate = TAX_RATE_MAP[input.taxType];
  const taxAmount = Math.floor((grossInterest * (taxRate / 100)) / 10) * 10;
  const netInterest = Math.max(0, grossInterest - taxAmount);
  const netMaturityAmount = totalPrincipal + netInterest;

  const generalTaxAmount =
    Math.floor(
      (grossInterest * (INSURANCE_AND_INCOME_TAX.savingsTaxRates.general / 100)) /
        10
    ) * 10;
  const taxSavedAmount = Math.max(0, generalTaxAmount - taxAmount);

  return {
    totalPrincipal,
    grossInterest,
    taxRate,
    taxAmount,
    netInterest,
    netMaturityAmount,
    generalTaxAmount,
    taxSavedAmount,
  };
}

export const SAVINGS_FAQS: FaqEntry[] = [
  {
    question: "정기예금과 정기적금의 이자는 왜 큰 차이가 나나요?",
    answer:
      "정기예금은 첫날부터 전체 원금에 이자가 붙지만, 정기적금은 매달 일정 금액을 나누어 납입하므로 1회차 납입금에만 전체 기간의 이자가 붙고 마지막 회차는 1개월분 이자만 붙기 때문입니다. 같은 금리라면 적금의 실효 이자 수익은 예금의 약 절반 수준입니다.",
  },
  {
    question: "이자소득세 15.4%는 어떻게 구성되어 있나요?",
    answer:
      "일반과세 예·적금 이자에는 소득세 14%와 지방소득세 1.4%(소득세의 10%)를 합산한 15.4%가 원천징수됩니다. 따라서 만기 시 세전 이자의 84.6%만 실제로 수령하게 됩니다.",
  },
  {
    question: "세금우대(1.4%)와 비과세(0%) 혜택은 누가 받을 수 있나요?",
    answer:
      "농협·수협·신협·새마을금고 등 상호금융권 조합원(준조합원 포함)은 1인당 3,000만 원 한도 내에서 농어촌특별세 1.4%만 부과되는 저율과세(세금우대) 혜택을 받을 수 있습니다. 비과세 종합저축은 만 65세 이상, 장애인, 기초생활수급자 등 대상자가 5,000만 원 한도 내에서 이용할 수 있습니다.",
  },
  {
    question: "단리와 월복리의 수익 차이는 얼마나 크나요?",
    answer:
      "1년~2년 단기 예·적금에서는 단리와 월복리의 이자 차이가 크지 않지만, 예치 기간이 3년·5년 이상 길어지거나 금리가 높을수록 이자에 다시 이자가 붙는 월복리 상품의 세후 수령액이 더 유리해집니다.",
  },
];
