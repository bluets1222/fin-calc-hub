export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://fin.beesvia.com";

export const SITE_NAME = "Beesvia Fin";
export const SITE_TITLE = "Beesvia Fin | 부동산·세금·금융 통합 계산기";
export const SITE_DESCRIPTION =
  "부동산 취득세, 중개보수(복비), 주담대·신용대출 DSR, 증여세, 연봉 실수령액, 퇴직금, 대출이자, 예적금 이자를 서버 전송 없이 브라우저에서 100% 무료로 정확하게 계산해 보세요.";
export const CONTACT_EMAIL = "beesinfo83@gmail.com";

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  category: string;
}

export const REAL_ESTATE_TAX_NAV: NavItem[] = [
  {
    label: "부동산 취득세 계산기",
    shortLabel: "취득세",
    href: "/real-estate/acquisition-tax",
    category: "부동산",
  },
  {
    label: "부동산 중개보수·복비 계산기",
    shortLabel: "중개보수",
    href: "/real-estate/brokerage-fee",
    category: "부동산",
  },
  {
    label: "DSR·월 상환액 계산기",
    shortLabel: "DSR 계산",
    href: "/finance/dsr",
    category: "금융",
  },
  {
    label: "증여세 모의 계산기",
    shortLabel: "증여세",
    href: "/tax/gift-tax",
    category: "세금",
  },
];

export const SALARY_FINANCE_NAV: NavItem[] = [
  {
    label: "연봉 실수령액 계산기",
    shortLabel: "연봉 실수령",
    href: "/salary/net-pay",
    category: "연봉",
  },
  {
    label: "퇴직금 모의 계산기",
    shortLabel: "퇴직금",
    href: "/salary/severance",
    category: "퇴직",
  },
  {
    label: "대출 이자·스케줄 계산기",
    shortLabel: "대출이자",
    href: "/finance/loan-interest",
    category: "금융",
  },
  {
    label: "예금·적금 세후이자 계산기",
    shortLabel: "예적금 이자",
    href: "/finance/savings",
    category: "저축",
  },
];

export const CALCULATOR_NAV: NavItem[] = [
  ...REAL_ESTATE_TAX_NAV,
  ...SALARY_FINANCE_NAV,
];

export const POLICY_NAV = [
  { label: "서비스 소개", href: "/about" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
  { label: "문의하기", href: "/contact" },
];

export const FAMILY_SITES = [
  {
    name: "Beesvia Gov",
    description: "정부지원금 D-Day 허브",
    href: "https://gov.beesvia.com",
  },
  {
    name: "ExactImg",
    description: "무료 이미지·PDF 도구",
    href: "https://www.beesvia.com",
  },
];
