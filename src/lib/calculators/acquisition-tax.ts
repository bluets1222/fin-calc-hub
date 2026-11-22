import type { FaqEntry } from "@/components/seo/JsonLd";
import { ACQUISITION_TAX } from "@/constants/rates";

export type PropertyType = "house" | "officetel";
export type HouseCount = "1" | "temp2" | "2" | "3plus";
export type AreaType = "under85" | "over85";

export interface AcquisitionTaxInput {
  propertyType: PropertyType;
  price: number;
  houseCount: HouseCount;
  isRegulatedArea: boolean;
  isFirstHome: boolean;
  areaType: AreaType;
}

export interface AcquisitionTaxResult {
  acquisitionTaxRate: number; // %
  educationTaxRate: number; // %
  ruralTaxRate: number; // %
  totalRate: number; // %
  rawAcquisitionTax: number;
  firstHomeDiscount: number;
  acquisitionTax: number;
  educationTax: number;
  ruralTax: number;
  totalTax: number;
  taxCategoryLabel: string;
  firstHomeApplied: boolean;
  firstHomeNotice?: string;
}

/**
 * 주택 일반 유상거래 취득세율(%)을 계산합니다.
 * 6억 이하 1%, 6억 초과~9억 이하 구간 비례식, 9억 초과 3%
 */
function calcStandardHouseRatePercent(price: number): number {
  if (price <= 0) return 0;
  if (price <= ACQUISITION_TAX.standardLowerBound) {
    return ACQUISITION_TAX.standardMinRate;
  }
  if (price <= ACQUISITION_TAX.standardUpperBound) {
    const rate = (price / 100_000_000) * (2 / 3) - 3;
    return Math.round(rate * 100) / 100;
  }
  return ACQUISITION_TAX.standardMaxRate;
}

export function calculateAcquisitionTax(
  input: AcquisitionTaxInput
): AcquisitionTaxResult {
  const price = Math.max(0, Math.round(input.price));

  if (price === 0) {
    return {
      acquisitionTaxRate: 0,
      educationTaxRate: 0,
      ruralTaxRate: 0,
      totalRate: 0,
      rawAcquisitionTax: 0,
      firstHomeDiscount: 0,
      acquisitionTax: 0,
      educationTax: 0,
      ruralTax: 0,
      totalTax: 0,
      taxCategoryLabel: "금액을 입력해 주세요",
      firstHomeApplied: false,
    };
  }

  // 오피스텔: 단일 4.6% (취득세 4% + 지방교육세 0.4% + 농어촌특별세 0.2%)
  if (input.propertyType === "officetel") {
    const acquisitionTaxRate = ACQUISITION_TAX.officetel.acquisition;
    const educationTaxRate = ACQUISITION_TAX.officetel.education;
    const ruralTaxRate = ACQUISITION_TAX.officetel.rural;

    const rawAcquisitionTax = Math.round(price * (acquisitionTaxRate / 100));
    const educationTax = Math.round(price * (educationTaxRate / 100));
    const ruralTax = Math.round(price * (ruralTaxRate / 100));

    return {
      acquisitionTaxRate,
      educationTaxRate,
      ruralTaxRate,
      totalRate: ACQUISITION_TAX.officetel.total,
      rawAcquisitionTax,
      firstHomeDiscount: 0,
      acquisitionTax: rawAcquisitionTax,
      educationTax,
      ruralTax,
      totalTax: rawAcquisitionTax + educationTax + ruralTax,
      taxCategoryLabel: `오피스텔 일반세율 (${ACQUISITION_TAX.officetel.total}%)`,
      firstHomeApplied: false,
      firstHomeNotice: input.isFirstHome
        ? "생애최초 주택구입 감면은 주택에 한해 적용되며, 오피스텔은 대상에서 제외됩니다."
        : undefined,
    };
  }

  // 주택 세율 판정
  let acquisitionTaxRate = 0;
  let educationTaxRate = 0;
  let ruralTaxRate = 0;
  let taxCategoryLabel = "";
  let isHeavyTax = false;

  if (
    input.houseCount === "1" ||
    input.houseCount === "temp2" ||
    (input.houseCount === "2" && !input.isRegulatedArea)
  ) {
    acquisitionTaxRate = calcStandardHouseRatePercent(price);
    educationTaxRate =
      Math.round(
        acquisitionTaxRate *
          ACQUISITION_TAX.standardEducationTaxMultiplier *
          1000
      ) / 1000;
    ruralTaxRate =
      input.areaType === "over85"
        ? ACQUISITION_TAX.standardOver85RuralTaxRate
        : 0;
    taxCategoryLabel =
      input.houseCount === "temp2"
        ? "일시적 2주택 (일반세율 적용)"
        : input.houseCount === "2"
          ? "비조정대상지역 2주택 (일반세율)"
          : "무주택·1주택 일반세율";
  } else if (
    (input.houseCount === "2" && input.isRegulatedArea) ||
    (input.houseCount === "3plus" && !input.isRegulatedArea)
  ) {
    isHeavyTax = true;
    acquisitionTaxRate = ACQUISITION_TAX.heavyTax8.acquisition;
    educationTaxRate = ACQUISITION_TAX.heavyTax8.education;
    ruralTaxRate = ACQUISITION_TAX.heavyTax8.rural;
    taxCategoryLabel =
      input.houseCount === "2"
        ? `조정대상지역 2주택 중과 (${ACQUISITION_TAX.heavyTax8.acquisition}%)`
        : `비조정대상지역 3주택 중과 (${ACQUISITION_TAX.heavyTax8.acquisition}%)`;
  } else {
    isHeavyTax = true;
    acquisitionTaxRate = ACQUISITION_TAX.heavyTax12.acquisition;
    educationTaxRate = ACQUISITION_TAX.heavyTax12.education;
    ruralTaxRate = ACQUISITION_TAX.heavyTax12.rural;
    taxCategoryLabel = `조정대상지역 3주택 이상 중과 (${ACQUISITION_TAX.heavyTax12.acquisition}%)`;
  }

  const rawAcquisitionTax = Math.round(price * (acquisitionTaxRate / 100));
  const educationTax = Math.round(price * (educationTaxRate / 100));
  const ruralTax = Math.round(price * (ruralTaxRate / 100));

  let firstHomeDiscount = 0;
  let firstHomeApplied = false;
  let firstHomeNotice: string | undefined;

  if (input.isFirstHome) {
    if (isHeavyTax || input.houseCount !== "1") {
      firstHomeNotice =
        "생애최초 감면은 세대원 전원 무주택 상태에서 1주택을 취득하는 경우에만 적용됩니다.";
    } else if (price > ACQUISITION_TAX.firstHomePriceLimit) {
      firstHomeNotice =
        "취득가액 12억 원을 초과하는 주택은 생애최초 취득세 감면 대상에서 제외됩니다.";
    } else {
      firstHomeDiscount = Math.min(
        rawAcquisitionTax,
        ACQUISITION_TAX.firstHomeMaxDiscount
      );
      firstHomeApplied = true;
    }
  }

  const acquisitionTax = Math.max(0, rawAcquisitionTax - firstHomeDiscount);
  const totalTax = acquisitionTax + educationTax + ruralTax;
  const totalRate =
    Math.round((acquisitionTaxRate + educationTaxRate + ruralTaxRate) * 1000) /
    1000;

  return {
    acquisitionTaxRate,
    educationTaxRate,
    ruralTaxRate,
    totalRate,
    rawAcquisitionTax,
    firstHomeDiscount,
    acquisitionTax,
    educationTax,
    ruralTax,
    totalTax,
    taxCategoryLabel,
    firstHomeApplied,
    firstHomeNotice,
  };
}

export const ACQUISITION_TAX_FAQS: FaqEntry[] = [
  {
    question: "생애최초 주택구입 취득세 감면 조건과 한도는 어떻게 되나요?",
    answer:
      "본인과 배우자 모두 주택을 소유한 이력이 없는 생애최초 주택 구입자가 실거래가 12억 원 이하의 주택을 취득할 경우, 소득 기준과 무관하게 취득세를 최대 200만 원까지 감면받을 수 있습니다. 단, 취득일로부터 3개월 이내 전입신고 및 3년 이상 실거주 요건을 충족해야 추징되지 않습니다.",
  },
  {
    question: "전용면적 85㎡ 이하와 초과에 따라 세금이 달라지나요?",
    answer:
      "네. 일반세율(1~3%)이 적용되는 주택의 경우 전용면적 85㎡(국민평형) 이하이면 농어촌특별세 0.2%가 비과세됩니다. 반면 85㎡를 초과하면 취득세 외에 농어촌특별세 0.2%가 추가로 부과됩니다. 중과세율(8%, 12%) 적용 시에는 면적과 무관하게 농어촌특별세가 부과됩니다.",
  },
  {
    question: "일시적 2주택자도 1주택 일반세율을 적용받을 수 있나요?",
    answer:
      "기존 주택을 보유한 상태에서 신규 주택을 취득해 일시적 2주택이 된 경우, 신규 주택 취득 시점에는 일반세율(1~3%)로 신고·납부할 수 있습니다. 이후 법정 처분 기한(통상 3년 이내, 규제지역 여부에 따라 상이) 내에 종전 주택을 처분해야 중과세율 추징을 피할 수 있습니다.",
  },
  {
    question: "주거용 오피스텔도 주택 취득세율(1~3%)이 적용되나요?",
    answer:
      "아니요. 오피스텔은 취득 시점의 공부상 용도가 업무시설이므로 주거용으로 사용할 예정이라도 취득세는 4.0%(지방교육세·농특세 포함 총 4.6%) 단일 세율이 적용됩니다. 다만 취득 이후 주택 수 산정 시에는 주거용 오피스텔 여부에 따라 포함될 수 있으므로 주의해야 합니다.",
  },
  {
    question: "취득세 신고 및 납부 기한은 언제까지인가요?",
    answer:
      "부동산 유상거래(매매)의 경우 잔금지급일(또는 등기일 중 빠른 날)로부터 60일 이내에 관할 시·군·구청 세무과 또는 위택스(WETAX)를 통해 신고 및 납부를 완료해야 합니다. 기한을 넘기면 무신고가산세(20%) 및 납부지연가산세가 부과됩니다.",
  },
];
