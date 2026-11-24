export type PropertyBridgeSource = "apt" | "officetel" | "subscription";
export type BridgeHouseCount = "1" | "2" | "3+";
export type BridgeTab = "tax" | "dsr" | "brokerage";

export interface PropertyBridgeParams {
  /** 매물 유형: 아파트(apt) / 오피스텔(officetel) / 분양권·청약(subscription) */
  source: PropertyBridgeSource;
  /** 단지명 또는 청약 공고명 */
  name: string;
  /** 거래가 또는 분양가 (원 단위 정수) */
  price: number;
  /** 전용면적 (㎡) - 85㎡ 초과 여부에 따라 농어촌특별세 0.2% 자동 반영 */
  area: number;
  /** 보유 주택 수 (기본값 "1") */
  houseCount: BridgeHouseCount;
}

export interface CalculatorBridgeState extends PropertyBridgeParams {
  tab: BridgeTab;
  annualIncome: number;
  ltvPercent: number;
  isRegulatedArea: boolean;
  isFirstHome: boolean;
}
