import type { FaqEntry } from "@/components/seo/JsonLd";

export type LoanRepaymentType = "equalPI" | "equalP" | "bullet";

export interface LoanInterestInput {
  principal: number; // 대출 원금 (원)
  annualRate: number; // 연 이자율 (%)
  months: number; // 총 대출 기간 (개월)
  graceMonths: number; // 거치 기간 (개월)
  method: LoanRepaymentType;
}

export interface LoanScheduleRow {
  month: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  remainingBalance: number;
  isGrace: boolean;
}

export interface MethodComparisonItem {
  method: LoanRepaymentType;
  label: string;
  avgMonthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
}

export interface LoanInterestResult {
  avgMonthlyPayment: number;
  firstMonthPayment: number;
  totalInterest: number;
  totalRepayment: number;
  comparisons: MethodComparisonItem[];
  schedule: LoanScheduleRow[];
}

function buildSchedule(
  principal: number,
  annualRate: number,
  months: number,
  graceMonths: number,
  method: LoanRepaymentType
): LoanScheduleRow[] {
  if (principal <= 0 || months <= 0) return [];

  const safeGrace = Math.max(0, Math.min(months - 1, Math.round(graceMonths)));
  const repayMonths = months - safeGrace;
  const monthlyRate = annualRate / 100 / 12;
  const rows: LoanScheduleRow[] = [];
  let balance = principal;

  // 원리금균등 상환기 고정 월 납입금
  let fixedPIPayment = 0;
  if (method === "equalPI") {
    if (monthlyRate === 0) {
      fixedPIPayment = principal / repayMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, repayMonths);
      fixedPIPayment = (principal * monthlyRate * factor) / (factor - 1);
    }
  }

  // 원금균등 상환기 고정 월 원금
  const fixedPrincipal = method === "equalP" ? principal / repayMonths : 0;

  for (let m = 1; m <= months; m++) {
    const isGrace = m <= safeGrace;
    const interest = Math.round(balance * monthlyRate);
    let principalPay = 0;

    if (isGrace) {
      principalPay = 0;
    } else if (method === "bullet") {
      principalPay = m === months ? balance : 0;
    } else if (method === "equalP") {
      principalPay = m === months ? balance : Math.round(fixedPrincipal);
    } else {
      // equalPI
      principalPay =
        m === months
          ? balance
          : Math.min(balance, Math.round(fixedPIPayment - interest));
    }

    balance = Math.max(0, balance - principalPay);
    rows.push({
      month: m,
      principalPayment: principalPay,
      interestPayment: interest,
      totalPayment: principalPay + interest,
      remainingBalance: balance,
      isGrace,
    });
  }

  return rows;
}

function summarizeSchedule(
  method: LoanRepaymentType,
  label: string,
  schedule: LoanScheduleRow[]
): MethodComparisonItem {
  if (schedule.length === 0) {
    return {
      method,
      label,
      avgMonthlyPayment: 0,
      totalInterest: 0,
      totalRepayment: 0,
    };
  }
  const totalInterest = schedule.reduce((acc, r) => acc + r.interestPayment, 0);
  const totalRepayment = schedule.reduce((acc, r) => acc + r.totalPayment, 0);
  return {
    method,
    label,
    avgMonthlyPayment: Math.round(totalRepayment / schedule.length),
    totalInterest,
    totalRepayment,
  };
}

export function calculateLoanInterest(
  input: LoanInterestInput
): LoanInterestResult {
  const principal = Math.max(0, Math.round(input.principal));
  const annualRate = Math.max(0, input.annualRate);
  const months = Math.max(1, Math.min(600, Math.round(input.months)));
  const graceMonths = Math.max(0, Math.min(months - 1, Math.round(input.graceMonths)));

  const schedulePI = buildSchedule(principal, annualRate, months, graceMonths, "equalPI");
  const scheduleP = buildSchedule(principal, annualRate, months, graceMonths, "equalP");
  const scheduleBullet = buildSchedule(principal, annualRate, months, graceMonths, "bullet");

  const comparisons: MethodComparisonItem[] = [
    summarizeSchedule("equalPI", "원리금균등상환", schedulePI),
    summarizeSchedule("equalP", "원금균등상환", scheduleP),
    summarizeSchedule("bullet", "만기일시상환", scheduleBullet),
  ];

  const activeSchedule =
    input.method === "equalPI"
      ? schedulePI
      : input.method === "equalP"
        ? scheduleP
        : scheduleBullet;

  const activeSummary =
    comparisons.find((c) => c.method === input.method) ?? comparisons[0];

  return {
    avgMonthlyPayment: activeSummary.avgMonthlyPayment,
    firstMonthPayment: activeSchedule[0]?.totalPayment ?? 0,
    totalInterest: activeSummary.totalInterest,
    totalRepayment: activeSummary.totalRepayment,
    comparisons,
    schedule: activeSchedule,
  };
}

export const LOAN_INTEREST_FAQS: FaqEntry[] = [
  {
    question: "원리금균등상환과 원금균등상환 중 총이자가 적은 방식은 무엇인가요?",
    answer:
      "원금균등상환이 원리금균등상환보다 총 대출이자가 적습니다. 원금균등은 첫 달부터 원금을 동일하게 더 많이 갚아 나가기 때문에 잔액이 빠르게 줄어들고, 그만큼 이자 발생액이 감소하기 때문입니다.",
  },
  {
    question: "거치 기간을 설정하면 왜 총이자가 늘어나나요?",
    answer:
      "거치 기간 동안에는 원금을 갚지 않고 이자만 납부하므로 대출 잔액이 줄어들지 않습니다. 그만큼 원금 상환 기간이 뒤로 밀리고 거치 기간분의 이자가 추가되어 전체 대출 기간의 총이자가 증가합니다.",
  },
  {
    question: "만기일시상환은 어떤 경우에 활용하나요?",
    answer:
      "전세자금대출, 단기 신용대출, 사업자 운전자금 대출처럼 만기 시점에 보증금 반환이나 자금 회수가 예정되어 있어 매월 원금 상환 부담을 줄이고자 할 때 주로 활용됩니다.",
  },
  {
    question: "중도상환을 하면 이자 계산은 어떻게 달라지나요?",
    answer:
      "여유 자금으로 원금을 일부 중도상환하면 그 시점부터 남은 원금 잔액에 대해서만 이자가 부과되므로 이후 총이자가 크게 줄어듭니다. 다만 약정 기간 내 상환 시 중도상환수수료가 부과되는지 확인해야 합니다.",
  },
];
