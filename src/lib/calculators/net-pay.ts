import type { FaqEntry } from "@/components/seo/JsonLd";
import { INSURANCE_AND_INCOME_TAX } from "@/constants/rates";

export type PayType = "annual" | "monthly";

export interface NetPayInput {
  payType: PayType;
  grossAmount: number; // 연봉 또는 월급 (세전, 원)
  nonTaxableAmount: number; // 월 비과세액 (기본 20만 원)
  dependents: number; // 본인 포함 부양가족 수 (1~11명)
  childrenUnder20: number; // 20세 이하 자녀 수
}

export interface NetPayResult {
  monthlyGross: number;
  monthlyTaxable: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  totalInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
  totalTax: number;
  totalDeduction: number;
  monthlyNetPay: number;
  annualNetPay: number;
  effectiveDeductionRate: number; // %
}

function floor10(value: number): number {
  return Math.floor(Math.max(0, value) / 10) * 10;
}

/**
 * 연간 과세급여 기반 근로소득세(월 환산, 간이세액표 근사) 계산
 */
function estimateMonthlyIncomeTax(
  monthlyTaxable: number,
  annualPension: number,
  dependents: number,
  childrenUnder20: number
): number {
  const annualTaxable = monthlyTaxable * 12;
  if (annualTaxable <= 0) return 0;

  // 1. 근로소득공제
  let earnedDeduction = 0;
  if (annualTaxable <= 5_000_000) {
    earnedDeduction = annualTaxable * 0.7;
  } else if (annualTaxable <= 15_000_000) {
    earnedDeduction = 3_500_000 + (annualTaxable - 5_000_000) * 0.4;
  } else if (annualTaxable <= 45_000_000) {
    earnedDeduction = 7_500_000 + (annualTaxable - 15_000_000) * 0.15;
  } else if (annualTaxable <= 100_000_000) {
    earnedDeduction = 12_000_000 + (annualTaxable - 45_000_000) * 0.05;
  } else {
    earnedDeduction = 14_750_000 + (annualTaxable - 100_000_000) * 0.02;
  }
  earnedDeduction = Math.min(20_000_000, earnedDeduction);

  const earnedIncome = Math.max(0, annualTaxable - earnedDeduction);

  // 2. 인적공제 + 국민연금 + 특별소득공제 근사
  const personalDeduction =
    Math.max(1, dependents) * INSURANCE_AND_INCOME_TAX.personalDeductionPerPerson;
  const standardExtraDeduction =
    INSURANCE_AND_INCOME_TAX.standardExtraDeductionEstimate;
  const taxBase = Math.max(
    0,
    earnedIncome - personalDeduction - annualPension - standardExtraDeduction
  );

  if (taxBase === 0) return 0;

  // 3. 종합소득세 기본세율
  let calcTax = 0;
  if (taxBase <= 14_000_000) {
    calcTax = taxBase * 0.06;
  } else if (taxBase <= 50_000_000) {
    calcTax = taxBase * 0.15 - 1_260_000;
  } else if (taxBase <= 88_000_000) {
    calcTax = taxBase * 0.24 - 5_760_000;
  } else if (taxBase <= 150_000_000) {
    calcTax = taxBase * 0.35 - 15_440_000;
  } else if (taxBase <= 300_000_000) {
    calcTax = taxBase * 0.38 - 19_940_000;
  } else if (taxBase <= 500_000_000) {
    calcTax = taxBase * 0.4 - 25_940_000;
  } else if (taxBase <= 1_000_000_000) {
    calcTax = taxBase * 0.42 - 35_940_000;
  } else {
    calcTax = taxBase * 0.45 - 65_940_000;
  }

  // 4. 근로소득세액공제
  let taxCredit =
    calcTax <= 1_300_000
      ? calcTax * 0.55
      : 715_000 + (calcTax - 1_300_000) * 0.3;

  let creditLimit = 740_000;
  if (annualTaxable > 70_000_000) {
    creditLimit = Math.max(500_000, 660_000 - (annualTaxable - 70_000_000) * 0.5);
  } else if (annualTaxable > 33_000_000) {
    creditLimit = Math.max(660_000, 740_000 - (annualTaxable - 33_000_000) * 0.008);
  }
  taxCredit = Math.min(taxCredit, creditLimit);

  // 5. 자녀세액공제 (20세 이하 자녀)
  let childCredit = 0;
  if (childrenUnder20 === 1) {
    childCredit = 150_000;
  } else if (childrenUnder20 === 2) {
    childCredit = 350_000;
  } else if (childrenUnder20 >= 3) {
    childCredit = 350_000 + (childrenUnder20 - 2) * 300_000;
  }

  // 표준세액공제 반영
  const finalAnnualTax = Math.max(
    0,
    calcTax -
      taxCredit -
      childCredit -
      INSURANCE_AND_INCOME_TAX.standardTaxCredit
  );
  return floor10(finalAnnualTax / 12);
}

export function calculateNetPay(input: NetPayInput): NetPayResult {
  const rawGross = Math.max(0, Math.round(input.grossAmount));
  const monthlyGross =
    input.payType === "annual" ? Math.round(rawGross / 12) : rawGross;
  const nonTaxable = Math.max(0, Math.round(input.nonTaxableAmount));
  const monthlyTaxable = Math.max(0, monthlyGross - nonTaxable);

  if (monthlyGross === 0) {
    return {
      monthlyGross: 0,
      monthlyTaxable: 0,
      nationalPension: 0,
      healthInsurance: 0,
      longTermCare: 0,
      employmentInsurance: 0,
      totalInsurance: 0,
      incomeTax: 0,
      localIncomeTax: 0,
      totalTax: 0,
      totalDeduction: 0,
      monthlyNetPay: 0,
      annualNetPay: 0,
      effectiveDeductionRate: 0,
    };
  }

  // 4대보험 계산
  const pensionBase =
    monthlyTaxable > 0
      ? Math.min(
          INSURANCE_AND_INCOME_TAX.nationalPensionUpperLimit,
          Math.max(
            INSURANCE_AND_INCOME_TAX.nationalPensionLowerLimit,
            monthlyTaxable
          )
        )
      : 0;
  const nationalPension = floor10(
    pensionBase * (INSURANCE_AND_INCOME_TAX.nationalPensionRate / 100)
  );
  const healthInsurance = floor10(
    monthlyTaxable * (INSURANCE_AND_INCOME_TAX.healthInsuranceRate / 100)
  );
  const longTermCare = floor10(
    healthInsurance * (INSURANCE_AND_INCOME_TAX.longTermCareRateOfHealth / 100)
  );
  const employmentInsurance = floor10(
    monthlyTaxable * (INSURANCE_AND_INCOME_TAX.employmentInsuranceRate / 100)
  );
  const totalInsurance =
    nationalPension + healthInsurance + longTermCare + employmentInsurance;

  const incomeTax = estimateMonthlyIncomeTax(
    monthlyTaxable,
    nationalPension * 12,
    input.dependents,
    input.childrenUnder20
  );
  const localIncomeTax = floor10(
    incomeTax * (INSURANCE_AND_INCOME_TAX.localIncomeTaxRateOfIncomeTax / 100)
  );
  const totalTax = incomeTax + localIncomeTax;

  const totalDeduction = totalInsurance + totalTax;
  const monthlyNetPay = Math.max(0, monthlyGross - totalDeduction);
  const annualNetPay = monthlyNetPay * 12;
  const effectiveDeductionRate =
    monthlyGross > 0
      ? Math.round((totalDeduction / monthlyGross) * 10000) / 100
      : 0;

  return {
    monthlyGross,
    monthlyTaxable,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    totalInsurance,
    incomeTax,
    localIncomeTax,
    totalTax,
    totalDeduction,
    monthlyNetPay,
    annualNetPay,
    effectiveDeductionRate,
  };
}

export const NET_PAY_FAQS: FaqEntry[] = [
  {
    question: "비과세액(식대 20만 원 등)이 높을수록 실수령액이 늘어나나요?",
    answer:
      "네. 비과세 식대(월 최대 20만 원), 자가운전보조금(월 최대 20만 원), 육아수당 등은 4대보험과 근로소득세 부과 대상에서 제외됩니다. 따라서 같은 연봉이라도 비과세 수당 비중이 높으면 과세표준이 줄어들어 월 실수령액이 늘어납니다.",
  },
  {
    question: "국민연금 상한액은 어떻게 적용되나요?",
    answer:
      "국민연금은 기준소득월액 상·하한 제도가 있어 일정 소득 이상에서는 보험료가 더 이상 오르지 않습니다. 상한액(월 617만 원 기준, 근로자 부담 최대 약 27만 7,650원)을 초과하는 고소득자는 상한액까지만 국민연금이 공제됩니다.",
  },
  {
    question: "부양가족 수와 20세 이하 자녀 수는 실수령액에 어떤 영향을 주나요?",
    answer:
      "부양가족이 많을수록 인적공제(1인당 연 150만 원)가 커져 매월 원천징수되는 근로소득세와 지방소득세가 줄어듭니다. 또한 8세 이상 20세 이하 자녀가 있는 경우 자녀세액공제가 추가 반영되어 세금 부담이 낮아집니다.",
  },
  {
    question: "퇴직금 별도 연봉과 퇴직금 포함 연봉은 어떻게 계산해야 하나요?",
    answer:
      "본 계산기는 일반적인 '퇴직금 별도' 연봉(연봉 ÷ 12 = 월 세전 급여)을 기준으로 계산합니다. 만약 퇴직금 포함 연봉(÷ 13) 계약이라면 월급 선택 모드로 전환해 실제 월 세전 급여를 입력하시는 것이 정확합니다.",
  },
  {
    question: "실제 급여명세서와 몇 천 원~몇 만 원 차이가 날 수 있나요?",
    answer:
      "네. 본 계산기는 국세청 간이세액표 근사 로직과 표준 공제율을 반영한 모의 계산기입니다. 실제 회사에서는 원천징수 비율(80%·100%·120% 선택), 사내 식대·상여금 지급 방식, 건강보험 정산분 등에 따라 소폭 차이가 발생할 수 있습니다.",
  },
];
