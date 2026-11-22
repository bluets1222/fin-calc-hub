/**
 * Beesvia Fin (fin.beesvia.com) 세법·금융 요율 및 한도 중앙 설정 파일
 * 모든 계산기 로직, UI 옵션, 하단 기준표 및 면책 문구는 이 파일의 상수를 참조합니다.
 */

/** 적용 세법·금융 기준 연도 */
export const TAX_YEAR = 2026;

/** 요율·한도 데이터 최종 업데이트 연월 (YYYY-MM) */
export const LAST_UPDATED = "2026-11";

/**
 * 1) 4대보험 · 근로소득세 · 퇴직소득세 · 이자소득세 기준
 */
export const INSURANCE_AND_INCOME_TAX = {
  /** 국민연금 근로자 부담 요율 (총 9% 중 절반, %) */
  nationalPensionRate: 4.5,
  /** 국민연금 기준소득월액 하한액 (원) */
  nationalPensionLowerLimit: 390_000,
  /** 국민연금 기준소득월액 상한액 (원) */
  nationalPensionUpperLimit: 6_170_000,

  /** 건강보험 근로자 부담 요율 (총 7.09% 중 절반, %) */
  healthInsuranceRate: 3.545,
  /** 장기요양보험 요율 (건강보험료 대비 비율, %) */
  longTermCareRateOfHealth: 12.95,
  /** 고용보험 실업급여 근로자 부담 요율 (%) */
  employmentInsuranceRate: 0.9,

  /** 기본 월 비과세 식대 한도 (원) */
  defaultNonTaxableMeal: 200_000,
  /** 인적공제 1인당 연간 공제액 (원) */
  personalDeductionPerPerson: 1_500_000,
  /** 근로소득 간이세액 근사용 특별소득공제 추정치 (원) */
  standardExtraDeductionEstimate: 2_500_000,
  /** 근로소득 표준세액공제 (원) */
  standardTaxCredit: 130_000,
  /** 지방소득세율 (소득세액 대비 비율, %) */
  localIncomeTaxRateOfIncomeTax: 10,

  /** 법정 퇴직금 최소 계속근로일수 (일) */
  severanceMinDays: 365,
  /** 퇴직금 산정 기준 월 일수 (일) */
  severanceDaysPerMonth: 30,

  /** 예·적금 이자소득 과세 구분별 세율 (%) */
  savingsTaxRates: {
    /** 일반과세 (소득세 14% + 지방소득세 1.4%) */
    general: 15.4,
    /** 세금우대 / 저율과세 (농어촌특별세 1.4%) */
    preferential: 1.4,
    /** 비과세 종합저축 (0%) */
    exempt: 0,
  },
} as const;

/**
 * 2) 부동산 취득세율 및 감면 한도 기준 (지방세법·지방세특례제한법)
 */
export const ACQUISITION_TAX = {
  /** 주택 일반세율 구간 경계 (6억 원) */
  standardLowerBound: 600_000_000,
  /** 주택 일반세율 구간 경계 (9억 원) */
  standardUpperBound: 900_000_000,
  /** 6억 원 이하 1주택 일반 취득세율 (%) */
  standardMinRate: 1.0,
  /** 9억 원 초과 1주택 일반 취득세율 (%) */
  standardMaxRate: 3.0,
  /** 일반세율 지방교육세 비율 (취득세율의 10%) */
  standardEducationTaxMultiplier: 0.1,
  /** 일반세율 전용 85㎡ 초과 시 농어촌특별세율 (%) */
  standardOver85RuralTaxRate: 0.2,

  /** 조정 2주택 / 비조정 3주택 중과세율 (%) */
  heavyTax8: {
    acquisition: 8.0,
    education: 0.4,
    rural: 0.6,
    total: 9.0,
  },
  /** 조정 3주택 이상 중과세율 (%) */
  heavyTax12: {
    acquisition: 12.0,
    education: 0.4,
    rural: 1.0,
    total: 13.4,
  },

  /** 오피스텔 일반 유상거래 세율 (%) */
  officetel: {
    acquisition: 4.0,
    education: 0.4,
    rural: 0.2,
    total: 4.6,
  },

  /** 생애최초 주택구입 취득세 감면 최대 한도 (원) */
  firstHomeMaxDiscount: 2_000_000,
  /** 생애최초 주택구입 취득세 감면 주택가액 상한 (원, 12억 원 이하) */
  firstHomePriceLimit: 1_200_000_000,
} as const;

export interface BrokerageBracketSpec {
  /** 구간 상한 금액 (원, 마지막 구간은 null) */
  maxAmount: number | null;
  /** 법정 상한요율 (%) */
  maxRate: number;
  /** 한도액 (원, 없으면 null) */
  limitAmount: number | null;
  /** 구간 표시 라벨 */
  label: string;
}

/**
 * 3) 부동산 중개보수(복비) 상한요율 및 부가가치세 기준 (공인중개사법 시행규칙)
 */
export const BROKERAGE_FEE = {
  /** 월세 환산보증금 기본 배수 (보증금 + 월세 × 100) */
  monthlyStandardMultiplier: 100,
  /** 월세 환산보증금 5천만 원 미만 특례 배수 (보증금 + 월세 × 70) */
  monthlyLowMultiplier: 70,
  /** 월세 환산보증금 특례 적용 기준 금액 (5,000만 원) */
  monthlyLowThreshold: 50_000_000,

  /** 주택 매매·교환 상한요율 구간표 */
  houseSaleBrackets: [
    {
      maxAmount: 50_000_000,
      maxRate: 0.6,
      limitAmount: 250_000,
      label: "5천만 원 미만",
    },
    {
      maxAmount: 200_000_000,
      maxRate: 0.5,
      limitAmount: 800_000,
      label: "5천만 원 이상 ~ 2억 원 미만",
    },
    {
      maxAmount: 900_000_000,
      maxRate: 0.4,
      limitAmount: null,
      label: "2억 원 이상 ~ 9억 원 미만",
    },
    {
      maxAmount: 1_200_000_000,
      maxRate: 0.5,
      limitAmount: null,
      label: "9억 원 이상 ~ 12억 원 미만",
    },
    {
      maxAmount: 1_500_000_000,
      maxRate: 0.6,
      limitAmount: null,
      label: "12억 원 이상 ~ 15억 원 미만",
    },
    {
      maxAmount: null,
      maxRate: 0.7,
      limitAmount: null,
      label: "15억 원 이상",
    },
  ] satisfies BrokerageBracketSpec[],

  /** 주택 임대차(전세·월세) 상한요율 구간표 */
  houseLeaseBrackets: [
    {
      maxAmount: 50_000_000,
      maxRate: 0.5,
      limitAmount: 200_000,
      label: "5천만 원 미만",
    },
    {
      maxAmount: 100_000_000,
      maxRate: 0.4,
      limitAmount: 300_000,
      label: "5천만 원 이상 ~ 1억 원 미만",
    },
    {
      maxAmount: 600_000_000,
      maxRate: 0.3,
      limitAmount: null,
      label: "1억 원 이상 ~ 6억 원 미만",
    },
    {
      maxAmount: 1_200_000_000,
      maxRate: 0.4,
      limitAmount: null,
      label: "6억 원 이상 ~ 12억 원 미만",
    },
    {
      maxAmount: 1_500_000_000,
      maxRate: 0.5,
      limitAmount: null,
      label: "12억 원 이상 ~ 15억 원 미만",
    },
    {
      maxAmount: null,
      maxRate: 0.6,
      limitAmount: null,
      label: "15억 원 이상",
    },
  ] satisfies BrokerageBracketSpec[],

  /** 오피스텔 상한요율 (%) */
  officetelRates: {
    sale: 0.5,
    lease: 0.4,
  },
  /** 주택 외 부동산(상가·토지 등) 상한요율 (%) */
  otherMaxRate: 0.9,

  /** 중개사무소 과세유형별 부가가치세율 (%) */
  vatRates: {
    /** 일반과세자 (10%) */
    general: 10,
    /** 간이과세자 (4%) */
    simple: 4,
    /** 면세·미청구 (0%) */
    exempt: 0,
  },
} as const;

export interface GiftTaxBracketSpec {
  /** 과세표준 상한 (원, 마지막 구간은 null) */
  maxTaxBase: number | null;
  /** 적용 세율 (%) */
  rate: number;
  /** 누진공제액 (원) */
  progressiveDeduction: number;
  /** 구간 표시 라벨 */
  label: string;
  /** 표기용 과세표준 구간명 */
  rangeLabel: string;
}

/**
 * 4) 증여세 공제한도, 누진세율표 및 할증·공제율 (상속세 및 증여세법)
 */
export const GIFT_TAX = {
  /** 증여자 관계별 10년 합산 증여재산공제 한도 (원) */
  deductions: {
    spouse: 600_000_000,
    linealAscendantAdult: 50_000_000,
    linealAscendantMinor: 20_000_000,
    linealDescendant: 50_000_000,
    otherRelative: 10_000_000,
  },

  /** 과세표준 구간별 세율 및 누진공제액 */
  brackets: [
    {
      maxTaxBase: 100_000_000,
      rate: 10,
      progressiveDeduction: 0,
      label: "1억 원 이하 (10%)",
      rangeLabel: "1억 원 이하",
    },
    {
      maxTaxBase: 500_000_000,
      rate: 20,
      progressiveDeduction: 10_000_000,
      label: "1억 초과 ~ 5억 이하 (20%)",
      rangeLabel: "1억 원 초과 ~ 5억 원 이하",
    },
    {
      maxTaxBase: 1_000_000_000,
      rate: 30,
      progressiveDeduction: 60_000_000,
      label: "5억 초과 ~ 10억 이하 (30%)",
      rangeLabel: "5억 원 초과 ~ 10억 원 이하",
    },
    {
      maxTaxBase: 3_000_000_000,
      rate: 40,
      progressiveDeduction: 160_000_000,
      label: "10억 초과 ~ 30억 이하 (40%)",
      rangeLabel: "10억 원 초과 ~ 30억 원 이하",
    },
    {
      maxTaxBase: null,
      rate: 50,
      progressiveDeduction: 460_000_000,
      label: "30억 원 초과 (50%)",
      rangeLabel: "30억 원 초과",
    },
  ] satisfies GiftTaxBracketSpec[],

  /** 세대생략 증여 할증률 (30%) */
  generationSkippingSurchargeRate: 30,
  /** 기한 내 자진신고 세액공제율 (3%) */
  selfReportDiscountRate: 3,
} as const;

/**
 * 5) DSR 대출 한도 및 스트레스 DSR 가산금리 기준
 */
export const DSR_LIMITS = {
  /** 1금융권 (시중은행) DSR 한도 (%) */
  tier1BankLimit: 40,
  /** 2금융권 (저축은행·보험·캐피탈) DSR 한도 (%) */
  tier2BankLimit: 50,
  /** 스트레스 DSR 가산금리 선택 프리셋 (%) */
  stressRatePresets: [0, 0.75, 1.5] as const,
} as const;
