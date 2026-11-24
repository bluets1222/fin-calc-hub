import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

export type ComplexType = "apt" | "officetel";

export interface RawTradeRecord {
  id?: string;
  name: string;
  dong: string;
  jibun?: string;
  buildYear?: number;
  price: number; // 만원 단위
  area: number; // ㎡
  floor: number;
  dealDate: string; // YYYY-MM-DD
  dealType: string; // 중개거래 / 직거래
  cancelYn: boolean;
}

export interface SigunguTradeFile {
  updatedAt: string;
  sigunguCode: string;
  sigunguName: string;
  count: number;
  items: RawTradeRecord[];
}

export interface SubscriptionItem {
  id: string;
  name: string;
  region: string;
  address: string;
  houseType: string;
  totalCount: number;
  applyStart: string;
  applyEnd: string;
  winnerDate: string | null;
  moveInDate: string | null;
  status: "upcoming" | "active" | "closed";
  dDay: number;
  url: string;
}

export interface SearchIndexItem {
  id: string;
  name: string;
  region: string;
  dong: string;
  latestPrice: number;
  dealDate: string;
  type: "apt" | "officetel" | "sub";
}

export interface SubscriptionsFile {
  updatedAt: string;
  baseDate: string;
  count: number;
  items: SubscriptionItem[];
}

export interface ComplexDetail {
  id: string;
  type: ComplexType;
  sigunguCode: string;
  sigunguName: string;
  dongName: string;
  name: string;
  latestPrice: number; // 만원
  latestArea: number; // ㎡
  latestDealDate: string;
  areaList: number[];
  avgPricePerSqm: number; // 만원/㎡
  dongAvgPricePerSqm: number; // 같은 법정동 평균 만원/㎡
  diffPercentFromDong: number; // 주변 시세 대비 % (+고평가/-저평가)
  tradeCount: number;
  trades: RawTradeRecord[];
  monthlyTrend: Array<{
    month: string; // YYYY-MM
    avgPrice: number; // 만원
    count: number;
  }>;
}

const DATA_ROOT = path.join(process.cwd(), "public", "data");

/**
 * 단지 식별용 URL 파라미터 ID를 생성합니다.
 * 형식: {type}-{sigunguCode}-{base64url(dongName + "\0" + name)} 또는 URL 안전 슬러그
 * 한글 SEO와 특수문자 안전성을 모두 확보하기 위해 encodeURIComponent 기반 구분자(--) 사용
 */
export function encodeComplexId(
  type: ComplexType,
  sigunguCode: string,
  dongName: string,
  name: string
): string {
  const safeDong = dongName.replace(/\//g, "_").trim();
  const safeName = name.replace(/\//g, "_").trim();
  return `${type}-${sigunguCode}-${safeDong}--${safeName}`;
}

export function decodeComplexId(rawId: string): {
  type: ComplexType;
  sigunguCode: string;
  dongName: string;
  name: string;
} | null {
  let decoded = rawId;
  for (let i = 0; i < 2; i++) {
    if (!/%[0-9A-Fa-f]{2}/.test(decoded)) break;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
  }

  const match = /^(apt|officetel)-(\d{5})-(.+)$/.exec(decoded);
  if (!match) return null;

  const type = match[1] as ComplexType;
  const sigunguCode = match[2];
  const rest = match[3];
  const sepIdx = rest.indexOf("--");
  if (sepIdx === -1) return null;

  const dongName = rest.slice(0, sepIdx);
  const name = rest.slice(sepIdx + 2);
  if (!dongName || !name) return null;

  return { type, sigunguCode, dongName, name };
}

async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * 특정 단지의 실거래 상세 및 주변 시세 비교 데이터를 조회합니다. (1일 온디맨드 ISR 캐싱)
 */
export async function getComplexDetail(
  rawId: string
): Promise<ComplexDetail | null> {
  "use cache";
  cacheLife("days");

  const parsed = decodeComplexId(rawId);
  if (!parsed) return null;

  const dirName = parsed.type === "apt" ? "apt" : "officetel";
  const filePath = path.join(DATA_ROOT, dirName, `${parsed.sigunguCode}.json`);
  const fileData = await readJsonSafe<SigunguTradeFile>(filePath);
  if (!fileData) return null;

  const normalizeName = (s: string) => s.replace(/\//g, "_").trim();
  const trades = fileData.items.filter(
    (item) =>
      normalizeName(item.dong) === parsed.dongName &&
      normalizeName(item.name) === parsed.name
  );

  if (trades.length === 0) return null;

  const validTrades = trades.filter((t) => !t.cancelYn && t.price > 0);
  const referenceTrades = validTrades.length > 0 ? validTrades : trades;
  const latest = referenceTrades[0];

  // 전용면적 목록 (중복 제거, 오름차순)
  const areaSet = new Set<number>();
  for (const t of referenceTrades) {
    if (t.area > 0) areaSet.add(Math.round(t.area));
  }
  const areaList = Array.from(areaSet).sort((a, b) => a - b);

  // 단지 평균 ㎡당 단가
  const totalSqmPrice = referenceTrades.reduce(
    (acc, t) => acc + (t.area > 0 ? t.price / t.area : 0),
    0
  );
  const avgPricePerSqm =
    referenceTrades.length > 0
      ? Math.round(totalSqmPrice / referenceTrades.length)
      : 0;

  // 같은 법정동 평균 ㎡당 단가 비교
  const dongTrades = fileData.items.filter(
    (item) =>
      normalizeName(item.dong) === parsed.dongName &&
      !item.cancelYn &&
      item.price > 0 &&
      item.area > 0
  );
  const dongTotalSqmPrice = dongTrades.reduce(
    (acc, t) => acc + t.price / t.area,
    0
  );
  const dongAvgPricePerSqm =
    dongTrades.length > 0
      ? Math.round(dongTotalSqmPrice / dongTrades.length)
      : avgPricePerSqm;

  const diffPercentFromDong =
    dongAvgPricePerSqm > 0
      ? Math.round(
          ((avgPricePerSqm - dongAvgPricePerSqm) / dongAvgPricePerSqm) * 1000
        ) / 10
      : 0;

  // 월별 평균 실거래가 추이 (오래된 월 -> 최신 월 순)
  const monthMap = new Map<string, { sum: number; count: number }>();
  for (const t of referenceTrades) {
    if (!t.dealDate || t.dealDate.length < 7) continue;
    const ym = t.dealDate.slice(0, 7);
    const prev = monthMap.get(ym) ?? { sum: 0, count: 0 };
    monthMap.set(ym, { sum: prev.sum + t.price, count: prev.count + 1 });
  }
  const monthlyTrend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      avgPrice: Math.round(v.sum / v.count),
      count: v.count,
    }));

  return {
    id: encodeComplexId(
      parsed.type,
      parsed.sigunguCode,
      latest.dong,
      latest.name
    ),
    type: parsed.type,
    sigunguCode: parsed.sigunguCode,
    sigunguName: fileData.sigunguName,
    dongName: latest.dong,
    name: latest.name,
    latestPrice: latest.price,
    latestArea: latest.area,
    latestDealDate: latest.dealDate,
    areaList,
    avgPricePerSqm,
    dongAvgPricePerSqm,
    diffPercentFromDong,
    tradeCount: trades.length,
    trades,
    monthlyTrend,
  };
}

/**
 * 거래량 상위 N개 단지의 generateStaticParams 목록을 반환합니다. (빌드 타임아웃 방지)
 */
export async function getTopComplexStaticParams(
  limit = 500
): Promise<Array<{ id: string }>> {
  const counts = new Map<string, number>();

  for (const type of ["apt", "officetel"] as const) {
    const dirPath = path.join(DATA_ROOT, type);
    let files: string[] = [];
    try {
      files = await fs.readdir(dirPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const data = await readJsonSafe<SigunguTradeFile>(
        path.join(dirPath, file)
      );
      if (!data?.items) continue;

      for (const item of data.items) {
        if (!item.name || !item.dong) continue;
        const id = encodeComplexId(
          type,
          data.sigunguCode,
          item.dong,
          item.name
        );
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => ({ id }));
}

export async function getSubscriptionsData(): Promise<SubscriptionsFile | null> {
  "use cache";
  cacheLife("days");
  return readJsonSafe<SubscriptionsFile>(
    path.join(DATA_ROOT, "subscriptions.json")
  );
}

export async function getSubscriptionById(
  id: string
): Promise<SubscriptionItem | null> {
  "use cache";
  cacheLife("days");
  const data = await getSubscriptionsData();
  if (!data) return null;
  return data.items.find((item) => item.id === id) ?? null;
}

/**
 * 청약 진행중(active) 및 예정(upcoming) 공고 전체의 static params를 반환합니다.
 */
export async function getActiveSubscriptionStaticParams(): Promise<
  Array<{ id: string }>
> {
  const data = await getSubscriptionsData();
  if (!data) return [];
  return data.items
    .filter((item) => item.status === "active" || item.status === "upcoming")
    .map((item) => ({ id: item.id }));
}

export async function getSearchIndexData(): Promise<SearchIndexItem[]> {
  "use cache";
  cacheLife("days");
  const data = await readJsonSafe<SearchIndexItem[]>(
    path.join(DATA_ROOT, "search-index.json")
  );
  return data ?? [];
}
