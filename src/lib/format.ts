/**
 * 숫자를 천단위 콤마가 포함된 원화 문자열로 변환합니다.
 */
export function formatKRW(amount: number): string {
  const rounded = Math.round(Number.isFinite(amount) ? amount : 0);
  return `${rounded.toLocaleString("ko-KR")}원`;
}

/**
 * 숫자를 천단위 콤마 문자열로 변환합니다 (단위 미포함).
 */
export function formatNumber(value: number): string {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  return rounded.toLocaleString("ko-KR");
}

/**
 * 원 단위 금액을 'O억 O,OOO만 원' 형태의 읽기 쉬운 한글 단위로 변환합니다.
 */
export function formatKoreanUnit(amount: number): string {
  const safe = Math.round(Number.isFinite(amount) ? Math.max(0, amount) : 0);
  if (safe === 0) return "0원";

  const eok = Math.floor(safe / 100_000_000);
  const man = Math.floor((safe % 100_000_000) / 10_000);
  const rest = safe % 10_000;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man > 0) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (rest > 0 && eok === 0) parts.push(`${rest.toLocaleString("ko-KR")}`);

  if (parts.length === 0) {
    return `${safe.toLocaleString("ko-KR")}원`;
  }
  return `${parts.join(" ")}원`;
}

/**
 * 퍼센트 값을 지정된 소수점 자리수로 포맷합니다.
 */
export function formatPercent(value: number, digits = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(digits)}%`;
}

/**
 * 숫자 입력 문자열에서 숫자만 추출해 정수로 파싱합니다.
 */
export function parseNumericInput(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
