import { SIGUNGU_CODES as RAW_SIGUNGU_CODES } from "../../scripts/sigungu-codes.mjs";

export interface SigunguMasterItem {
  sido: string;
  sigungu: string;
  code: string;
}

export const SIGUNGU_CODES: SigunguMasterItem[] = RAW_SIGUNGU_CODES;

export const SIDO_LIST: string[] = Array.from(
  new Set(SIGUNGU_CODES.map((item) => item.sido))
);

export const DEFAULT_SIDO = "서울특별시";
export const DEFAULT_SIGUNGU_CODE = "11680"; // 강남구
