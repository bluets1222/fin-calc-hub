import type { FaqEntry } from "@/components/seo/JsonLd";
import { INSURANCE_AND_INCOME_TAX } from "@/constants/rates";

export interface SeveranceInput {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  threeMonthGross: number; // 퇴직 전 3개월 세전 급여 합계
  annualBonus: number; // 연간 상여금 총액
  unusedLeavePay: number; // 미사용 연차수당
  ordinaryDailyWage: number; // 1일 통상임금 (0이면 비교 생략)
}

export interface SeveranceResult {
  totalDays: number;
  isEligible: boolean; // 365일 이상 여부
  threeMonthDays: number;
  averageDailyWage: number;
  ordinaryDailyWage: number;
  appliedDailyWage: number;
  usedOrdinaryWage: boolean;
  grossSeverance: number;
  serviceYearsRoundedUp: number;
  serviceYearDeduction: number;
  retirementIncomeTax: number;
  localIncomeTax: number;
  totalTax: number;
  netSeverance: number;
}

function parseDateUTC(dateStr: string): Date | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * 퇴직일 직전 3개월 실제 일수 계산 (통상 89~92일)
 */
function calcThreeMonthDays(endDateUTC: Date): number {
  const y = endDateUTC.getUTCFullYear();
  const m = endDateUTC.getUTCMonth();
  const d = endDateUTC.getUTCDate();
  const threeMonthsAgo = new Date(Date.UTC(y, m - 3, d));
  const diff = Math.round(
    (endDateUTC.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(89, Math.min(92, diff));
}

function calcProgressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  if (taxBase <= 14_000_000) return taxBase * 0.06;
  if (taxBase <= 50_000_000) return taxBase * 0.15 - 1_260_000;
  if (taxBase <= 88_000_000) return taxBase * 0.24 - 5_760_000;
  if (taxBase <= 150_000_000) return taxBase * 0.35 - 15_440_000;
  if (taxBase <= 300_000_000) return taxBase * 0.38 - 19_940_000;
  if (taxBase <= 500_000_000) return taxBase * 0.4 - 25_940_000;
  if (taxBase <= 1_000_000_000) return taxBase * 0.42 - 35_940_000;
  return taxBase * 0.45 - 65_940_000;
}

function calcServiceYearDeduction(years: number): number {
  if (years <= 5) return 1_000_000 * years;
  if (years <= 10) return 5_000_000 + 2_000_000 * (years - 5);
  if (years <= 20) return 15_000_000 + 2_500_000 * (years - 10);
  return 40_000_000 + 3_000_000 * (years - 20);
}

function calcConvertedSalaryDeduction(convertedSalary: number): number {
  if (convertedSalary <= 8_000_000) return convertedSalary;
  if (convertedSalary <= 70_000_000) {
    return 8_000_000 + (convertedSalary - 8_000_000) * 0.6;
  }
  if (convertedSalary <= 100_000_000) {
    return 45_200_000 + (convertedSalary - 70_000_000) * 0.55;
  }
  if (convertedSalary <= 300_000_000) {
    return 61_700_000 + (convertedSalary - 100_000_000) * 0.45;
  }
  return 151_700_000 + (convertedSalary - 300_000_000) * 0.35;
}

export function calculateSeverance(input: SeveranceInput): SeveranceResult {
  const start = parseDateUTC(input.startDate);
  const end = parseDateUTC(input.endDate);

  if (!start || !end || end < start) {
    return {
      totalDays: 0,
      isEligible: false,
      threeMonthDays: 91,
      averageDailyWage: 0,
      ordinaryDailyWage: Math.max(0, input.ordinaryDailyWage),
      appliedDailyWage: 0,
      usedOrdinaryWage: false,
      grossSeverance: 0,
      serviceYearsRoundedUp: 0,
      serviceYearDeduction: 0,
      retirementIncomeTax: 0,
      localIncomeTax: 0,
      totalTax: 0,
      netSeverance: 0,
    };
  }

  const totalDays =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isEligible = totalDays >= INSURANCE_AND_INCOME_TAX.severanceMinDays;
  const threeMonthDays = calcThreeMonthDays(end);

  const threeMonthTotal =
    Math.max(0, input.threeMonthGross) +
    Math.max(0, input.annualBonus) * (3 / 12) +
    Math.max(0, input.unusedLeavePay) * (3 / 12);

  const averageDailyWage = Math.round(threeMonthTotal / threeMonthDays);
  const ordinaryDailyWage = Math.max(0, Math.round(input.ordinaryDailyWage));
  const usedOrdinaryWage = ordinaryDailyWage > averageDailyWage;
  const appliedDailyWage = Math.max(averageDailyWage, ordinaryDailyWage);

  const grossSeverance = isEligible
    ? Math.round(
        appliedDailyWage *
          INSURANCE_AND_INCOME_TAX.severanceDaysPerMonth *
          (totalDays / INSURANCE_AND_INCOME_TAX.severanceMinDays)
      )
    : 0;

  // 퇴직소득세 간편 산출
  const serviceYearsRoundedUp = Math.max(
    1,
    Math.ceil(totalDays / INSURANCE_AND_INCOME_TAX.severanceMinDays)
  );
  const serviceYearDeduction = calcServiceYearDeduction(serviceYearsRoundedUp);

  let retirementIncomeTax = 0;
  if (grossSeverance > serviceYearDeduction) {
    const convertedSalary =
      ((grossSeverance - serviceYearDeduction) * 12) / serviceYearsRoundedUp;
    const convertedDeduction = calcConvertedSalaryDeduction(convertedSalary);
    const taxBase = Math.max(0, convertedSalary - convertedDeduction);
    const convertedTax = calcProgressiveTax(taxBase);
    retirementIncomeTax =
      Math.floor(((convertedTax * serviceYearsRoundedUp) / 12) / 10) * 10;
  }

  const localIncomeTax =
    Math.floor(
      (retirementIncomeTax *
        (INSURANCE_AND_INCOME_TAX.localIncomeTaxRateOfIncomeTax / 100)) /
        10
    ) * 10;
  const totalTax = retirementIncomeTax + localIncomeTax;
  const netSeverance = Math.max(0, grossSeverance - totalTax);

  return {
    totalDays,
    isEligible,
    threeMonthDays,
    averageDailyWage,
    ordinaryDailyWage,
    appliedDailyWage,
    usedOrdinaryWage,
    grossSeverance,
    serviceYearsRoundedUp,
    serviceYearDeduction,
    retirementIncomeTax,
    localIncomeTax,
    totalTax,
    netSeverance,
  };
}

export const SEVERANCE_FAQS: FaqEntry[] = [
  {
    question: "퇴직금은 정확히 며칠 이상 근무해야 받을 수 있나요?",
    answer:
      "근로자퇴직급여 보장법에 따라 1주간 소정근로시간이 15시간 이상이고, 동일 사업장에서 계속근로기간이 1년(365일) 이상인 경우 퇴직금 지급 대상이 됩니다. 1년 미만 근무 시에는 법정 퇴직금이 발생하지 않습니다.",
  },
  {
    question: "1일 평균임금과 1일 통상임금은 왜 비교하나요?",
    answer:
      "근로기준법 제2조에 따라 산출된 '1일 평균임금'이 근로자의 '1일 통상임금'보다 적을 경우, 근로자 보호를 위해 더 높은 금액인 1일 통상임금을 평균임금으로 적용해 퇴직금을 계산하도록 규정하고 있습니다.",
  },
  {
    question: "연간 상여금과 미사용 연차수당도 퇴직금에 포함되나요?",
    answer:
      "네. 정기적·일률적으로 지급된 상여금은 연간 총액의 3/12(3개월분)을 퇴직 전 3개월 임금 총액에 합산하며, 퇴직 전년도 미사용 연차로 인해 발생한 연차수당 역시 3/12을 산입합니다.",
  },
  {
    question: "퇴직소득세는 일반 근로소득세보다 적은 편인가요?",
    answer:
      "네. 퇴직소득은 장기간 형성된 노후 자금 성격을 가지므로 근속연수공제(1년당 100만~300만 원)와 환산급여공제를 적용해 일반 급여보다 세 부담이 훨씬 낮습니다. IRP 계좌로 수령하면 퇴직 시점에 세금을 떼지 않고 과세 이연할 수 있습니다.",
  },
  {
    question: "퇴직금은 퇴사 후 언제까지 지급받아야 하나요?",
    answer:
      "사용자는 근로자가 퇴직한 날로부터 14일 이내에 퇴직금을 전액 지급해야 합니다. 특별한 사정이 있는 경우 당사자 간 합의로 지급 기일을 연장할 수 있으며, 기한 초과 시 연 20%의 지연이자가 발생할 수 있습니다.",
  },
];
