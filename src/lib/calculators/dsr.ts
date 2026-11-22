import type { FaqEntry } from "@/components/seo/JsonLd";
import { DSR_LIMITS } from "@/constants/rates";

export type RepaymentMethod = "equalPrincipalInterest" | "equalPrincipal";
export type StressRateOption = (typeof DSR_LIMITS.stressRatePresets)[number];

export interface DsrInput {
  annualIncome: number; // 세전 연소득 (원)
  loanAmount: number; // 신규 대출금액 (원)
  interestRate: number; // 기본 대출 금리 (연 %)
  loanYears: number; // 대출 기간 (년)
  repaymentMethod: RepaymentMethod;
  stressRate: StressRateOption; // 스트레스 DSR 가산금리 (%)
  existingAnnualDebtService: number; // 기존 보유 대출 연간 원리금 상환액 (원)
}

export interface DsrResult {
  appliedDsrRate: number; // 스트레스 금리 반영 금리 (%)
  actualMonthlyPaymentAvg: number; // 실제 금리 기준 월 평균 상환액
  actualFirstMonthPayment: number; // 실제 금리 기준 1회차 월 상환액
  actualLastMonthPayment: number; // 실제 금리 기준 마지막 회차 월 상환액
  actualAnnualDebtService: number; // 실제 금리 기준 연간 상환액
  newLoanDsrAnnualPayment: number; // 스트레스 DSR 기준 신규 대출 연간 상환액
  totalAnnualDebtService: number; // 기존 + 신규 연간 총 원리금 상환액
  dsrRatio: number; // 예상 DSR (%)
  remainingCapacityAnnual: number; // DSR 40% 기준 남은 연간 상환 여력
  estimatedAdditionalLoan: number; // 현재 조건으로 추가 가능한 대략적 대출 원금
  status: "safe" | "caution" | "exceed"; // 40% 미만 / 40~50% / 50% 초과
}

/**
 * 원리금균등 월 상환액 계산
 */
function calcEqualPIMonthly(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * 원금균등 총 이자 및 1회차/마지막회차 월 상환액 계산
 */
function calcEqualPrincipalStats(
  principal: number,
  annualRate: number,
  months: number
): {
  avgMonthly: number;
  firstMonth: number;
  lastMonth: number;
  annualAvg: number;
} {
  if (principal <= 0 || months <= 0) {
    return { avgMonthly: 0, firstMonth: 0, lastMonth: 0, annualAvg: 0 };
  }
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPrincipal = principal / months;
  const firstMonth = monthlyPrincipal + principal * monthlyRate;
  const lastMonth = monthlyPrincipal + monthlyPrincipal * monthlyRate;
  const totalInterest = (principal * monthlyRate * (months + 1)) / 2;
  const avgMonthly = (principal + totalInterest) / months;
  const years = months / 12;
  const annualAvg = (principal + totalInterest) / years;

  return { avgMonthly, firstMonth, lastMonth, annualAvg };
}

export function calculateDsr(input: DsrInput): DsrResult {
  const annualIncome = Math.max(0, Math.round(input.annualIncome));
  const loanAmount = Math.max(0, Math.round(input.loanAmount));
  const interestRate = Math.max(0, input.interestRate);
  const loanYears = Math.max(1, Math.min(50, Math.round(input.loanYears)));
  const months = loanYears * 12;
  const existingAnnual = Math.max(0, Math.round(input.existingAnnualDebtService));
  const appliedDsrRate = Math.round((interestRate + input.stressRate) * 100) / 100;

  let actualMonthlyPaymentAvg = 0;
  let actualFirstMonthPayment = 0;
  let actualLastMonthPayment = 0;
  let actualAnnualDebtService = 0;
  let newLoanDsrAnnualPayment = 0;

  if (input.repaymentMethod === "equalPrincipalInterest") {
    const actualMonthly = calcEqualPIMonthly(loanAmount, interestRate, months);
    actualMonthlyPaymentAvg = Math.round(actualMonthly);
    actualFirstMonthPayment = actualMonthlyPaymentAvg;
    actualLastMonthPayment = actualMonthlyPaymentAvg;
    actualAnnualDebtService = Math.round(actualMonthly * 12);

    const dsrMonthly = calcEqualPIMonthly(loanAmount, appliedDsrRate, months);
    newLoanDsrAnnualPayment = Math.round(dsrMonthly * 12);
  } else {
    const actualStats = calcEqualPrincipalStats(loanAmount, interestRate, months);
    actualMonthlyPaymentAvg = Math.round(actualStats.avgMonthly);
    actualFirstMonthPayment = Math.round(actualStats.firstMonth);
    actualLastMonthPayment = Math.round(actualStats.lastMonth);
    actualAnnualDebtService = Math.round(actualStats.annualAvg);

    const dsrStats = calcEqualPrincipalStats(loanAmount, appliedDsrRate, months);
    newLoanDsrAnnualPayment = Math.round(dsrStats.annualAvg);
  }

  const totalAnnualDebtService = newLoanDsrAnnualPayment + existingAnnual;
  const dsrRatio =
    annualIncome > 0
      ? Math.round((totalAnnualDebtService / annualIncome) * 10000) / 100
      : 0;

  // DSR 1금융권 한도 기준 남은 연간 상환 여력
  const maxAllowedAnnualAt40 = annualIncome * (DSR_LIMITS.tier1BankLimit / 100);
  const remainingCapacityAnnual = Math.max(
    0,
    Math.round(maxAllowedAnnualAt40 - totalAnnualDebtService)
  );

  // 추가 대출 가능 원금 추정 (현재 조건과 동일한 기간·금리·상환방식 기준 비례 역산)
  let estimatedAdditionalLoan = 0;
  if (remainingCapacityAnnual > 0) {
    if (input.repaymentMethod === "equalPrincipalInterest") {
      const unitAnnual = calcEqualPIMonthly(1_000_000, appliedDsrRate, months) * 12;
      if (unitAnnual > 0) {
        estimatedAdditionalLoan = Math.round(
          (remainingCapacityAnnual / unitAnnual) * 1_000_000
        );
      }
    } else {
      const unitStats = calcEqualPrincipalStats(1_000_000, appliedDsrRate, months);
      if (unitStats.annualAvg > 0) {
        estimatedAdditionalLoan = Math.round(
          (remainingCapacityAnnual / unitStats.annualAvg) * 1_000_000
        );
      }
    }
  }

  const status: DsrResult["status"] =
    dsrRatio <= DSR_LIMITS.tier1BankLimit
      ? "safe"
      : dsrRatio <= DSR_LIMITS.tier2BankLimit
        ? "caution"
        : "exceed";

  return {
    appliedDsrRate,
    actualMonthlyPaymentAvg,
    actualFirstMonthPayment,
    actualLastMonthPayment,
    actualAnnualDebtService,
    newLoanDsrAnnualPayment,
    totalAnnualDebtService,
    dsrRatio,
    remainingCapacityAnnual,
    estimatedAdditionalLoan,
    status,
  };
}

export const DSR_FAQS: FaqEntry[] = [
  {
    question: "DSR(총부채원리금상환비율) 40%와 50% 기준은 무엇인가요?",
    answer:
      "DSR은 차주의 연소득 대비 모든 금융권 대출의 연간 원리금 상환액 비율입니다. 현재 총 대출액 1억 원을 초과하는 경우 시중은행(1금융권)은 DSR 40%, 저축은행·캐피탈·보험 등 제2금융권은 DSR 50% 규제가 적용됩니다.",
  },
  {
    question: "스트레스 DSR 가산금리(0.75% / 1.5%)는 실제 이자에도 적용되나요?",
    answer:
      "아니요. 스트레스 DSR 가산금리는 향후 금리 상승 위험을 반영해 '대출 한도(DSR)'를 산정할 때만 더하는 가상의 금리입니다. 실제 매월 은행에 납부하는 대출 이자와 원리금은 약정된 기본 대출 금리 기준으로 계산됩니다.",
  },
  {
    question: "원리금균등상환과 원금균등상환 중 어떤 방식이 한도에 유리한가요?",
    answer:
      "원금균등상환은 초기 원금 상환 속도가 빨라 전체 기간 총 이자가 원리금균등보다 적습니다. 따라서 전체 기간 평균 연간 원리금을 기준으로 보는 경우 원금균등의 DSR이 소폭 낮게 산출될 수 있으나, 초기 월 상환 부담은 원금균등이 더 큽니다.",
  },
  {
    question: "기존 신용대출이나 마이너스통장도 DSR에 포함되나요?",
    answer:
      "네, 주택담보대출뿐 아니라 신용대출, 카드론, 자동차 할부, 학자금 대출 등 대부분의 금융권 대출이 DSR 산정에 포함됩니다. 특히 신용대출은 실제 만기가 1년이라도 DSR 산정 시 통상 5년 만기 분할상환으로 간주해 연간 원리금을 계산합니다.",
  },
  {
    question: "전세대출 이자나 보금자리론 등 정책모기지도 DSR 규제 대상인가요?",
    answer:
      "전세대출은 원칙적으로 원금 상환을 DSR에 반영하지 않고 이자 상환분만 일부(보유 주택 수 등에 따라 상이) 반영되며, 디딤돌대출·특례보금자리론 등 서민 실수요자 대상 정책금융상품은 DSR 규제 적용에서 제외됩니다. 다만 다른 대출을 추가로 받을 때는 기존 정책대출의 원리금이 DSR 분자에 포함될 수 있습니다.",
  },
];
