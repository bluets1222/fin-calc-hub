import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";
import { SIGUNGU_CODES } from "./sigungu-codes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(ROOT_DIR, ".env.local") });
dotenv.config({ path: path.join(ROOT_DIR, ".env") });

const API_KEY = process.env.DATA_GO_KR_API_KEY?.trim();
if (!API_KEY) {
  console.error(
    "[ERROR] DATA_GO_KR_API_KEY 환경변수가 설정되지 않았습니다. (.env.local 또는 GitHub Secrets 확인)"
  );
  process.exit(1);
}

const REQUEST_DELAY_MS = 150;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 500;
const RETENTION_MONTHS = 6;

// 기본값: 당월 + 직전 1개월(총 2개월) 호출 (필요 시 --months=6 옵션 지원)
const monthsArg = process.argv.find((a) => a.startsWith("--months="));
const FETCH_MONTHS = monthsArg
  ? Math.max(1, Math.min(12, Number(monthsArg.split("=")[1]) || 2))
  : 2;

const DATA_DIR = path.join(ROOT_DIR, "public", "data");
const APT_DIR = path.join(DATA_DIR, "apt");
const OFFICETEL_DIR = path.join(DATA_DIR, "officetel");

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: false,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildServiceKeyParam(rawKey) {
  return rawKey.includes("%") ? rawKey : encodeURIComponent(rawKey);
}

async function fetchWithRetry(url, label) {
  await sleep(REQUEST_DELAY_MS);

  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json, application/xml, text/xml, */*",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (response.status === 429 || response.status >= 500) {
        const waitMs = BASE_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(
          `[WARN] ${label} HTTP ${response.status} -> ${waitMs}ms 후 재시도 (${attempt + 1}/${MAX_RETRIES})`
        );
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      lastError = err;
      const waitMs = BASE_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(
        `[WARN] ${label} 요청 오류(${err.message}) -> ${waitMs}ms 후 재시도 (${attempt + 1}/${MAX_RETRIES})`
      );
      await sleep(waitMs);
    }
  }

  throw new Error(
    `[FAIL] ${label} 최대 재시도(${MAX_RETRIES}회) 초과: ${lastError?.message ?? "Unknown error"}`
  );
}

function getKstTodayString() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function getRecentMonths(count = 2) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth();

  const result = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(year, month - i, 1));
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    result.push(`${yyyy}${mm}`);
  }
  return result;
}

/**
 * 최근 6개월 보존 기준일 (YYYY-MM-01)
 */
function getRetentionCutoffDate(months = RETENTION_MONTHS) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const d = new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth() - (months - 1), 1)
  );
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

function diffDays(targetDateStr, baseDateStr) {
  const t = new Date(`${targetDateStr}T00:00:00Z`).getTime();
  const b = new Date(`${baseDateStr}T00:00:00Z`).getTime();
  if (Number.isNaN(t) || Number.isNaN(b)) return null;
  return Math.round((t - b) / (1000 * 60 * 60 * 24));
}

function normalizeDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return null;
}

function parseIntClean(raw) {
  if (raw === undefined || raw === null) return 0;
  const cleaned = String(raw).replace(/[,\s]/g, "").trim();
  const num = Number.parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : 0;
}

function parseFloatClean(raw) {
  if (raw === undefined || raw === null) return 0;
  const cleaned = String(raw).replace(/[,\s]/g, "").trim();
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function pad2(val) {
  return String(val ?? "").trim().padStart(2, "0");
}

function makeShortHash(text) {
  return crypto.createHash("md5").update(text).digest("hex").slice(0, 8);
}

function makeRouteComplexId(type, sigunguCode, dong, name) {
  const safeDong = dong.replace(/\//g, "_").trim();
  const safeName = name.replace(/\//g, "_").trim();
  return `${type}-${sigunguCode}-${safeDong}--${safeName}`;
}

async function readExistingJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * 기존 데이터 + 신규 데이터 증분 병합(Upsert) 및 최근 6개월 필터링
 * 중복 키: 거래일 + 단지명 + 법정동 + 전용면적 + 층 + 거래금액
 */
function mergeAndPruneTrades(existingItems, newItems, cutoffDate) {
  const map = new Map();

  for (const item of existingItems ?? []) {
    if (!item?.dealDate || item.dealDate < cutoffDate) continue;
    const dedupKey = `${item.dealDate}|${item.name}|${item.dong}|${item.area}|${item.floor}|${item.price}`;
    map.set(dedupKey, item);
  }

  for (const item of newItems ?? []) {
    if (!item?.dealDate || item.dealDate < cutoffDate) continue;
    const dedupKey = `${item.dealDate}|${item.name}|${item.dong}|${item.area}|${item.floor}|${item.price}`;
    map.set(dedupKey, item);
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => b.dealDate.localeCompare(a.dealDate));
  return merged;
}

/**
 * 1. 청약홈 분양정보 조회 API (ApplyhomeInfoDetailSvc)
 */
async function syncSubscriptions() {
  console.log("[1/3] 청약홈 분양정보조회 API 수집 시작...");
  const todayStr = getKstTodayString();
  const keyParam = buildServiceKeyParam(API_KEY);
  const allRows = [];

  for (let page = 1; page <= 3; page++) {
    const url =
      `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail` +
      `?page=${page}&perPage=100&serviceKey=${keyParam}`;

    try {
      const text = await fetchWithRetry(url, `청약홈 p.${page}`);
      const json = JSON.parse(text);
      const rows = Array.isArray(json?.data) ? json.data : [];
      allRows.push(...rows);
      if (rows.length < 100) break;
    } catch (err) {
      console.error(`[ERROR] 청약홈 p.${page} 실패:`, err.message);
      break;
    }
  }

  const filtered = [];
  for (const row of allRows) {
    const applyStart = normalizeDate(row.RCEPT_BGNDE);
    const applyEnd = normalizeDate(row.RCEPT_ENDDE);
    if (!applyStart || !applyEnd) continue;

    const daysToStart = diffDays(applyStart, todayStr);
    const daysToEnd = diffDays(applyEnd, todayStr);
    if (daysToStart === null || daysToEnd === null) continue;

    let status = null;
    let dDay = null;

    if (daysToStart > 0) {
      status = "upcoming";
      dDay = daysToStart;
    } else if (daysToEnd >= 0) {
      status = "active";
      dDay = daysToEnd;
    } else if (daysToEnd >= -30) {
      status = "closed";
      dDay = daysToEnd;
    }

    if (!status) continue;

    filtered.push({
      id: String(row.PBLANC_NO ?? "").trim(),
      name: String(row.HOUSE_NM ?? "").trim(),
      region: String(row.SUBSCRPT_AREA_CODE_NM ?? "").trim(),
      address: String(row.HSSPLY_ADRES ?? "").trim(),
      houseType: String(row.HOUSE_SECD_NM ?? "").trim(),
      totalCount: parseIntClean(row.TOT_SUPLY_HSHLDCO),
      applyStart,
      applyEnd,
      winnerDate: normalizeDate(row.PRZWNER_PRESNATN_DE),
      moveInDate: String(row.MVN_PREARNGE_YM ?? "").trim() || null,
      dDay,
      status,
      url: String(row.PBLANC_URL ?? "").trim(),
    });
  }

  const order = { active: 0, upcoming: 1, closed: 2 };
  filtered.sort((a, b) => {
    if (order[a.status] !== order[b.status]) {
      return order[a.status] - order[b.status];
    }
    return a.applyStart.localeCompare(b.applyStart);
  });

  // Minify 저장
  await fs.writeFile(
    path.join(DATA_DIR, "subscriptions.json"),
    JSON.stringify({
      updatedAt: new Date().toISOString(),
      baseDate: todayStr,
      count: filtered.length,
      items: filtered,
    }),
    "utf8"
  );

  console.log(`[1/3] 청약홈 저장 완료: ${filtered.length}건`);
  return filtered;
}

function extractRtmsItems(rawText) {
  const trimmed = rawText.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("{")) {
    const json = JSON.parse(trimmed);
    const items = json?.response?.body?.items?.item ?? json?.data ?? [];
    return Array.isArray(items) ? items : items ? [items] : [];
  }

  const parsed = xmlParser.parse(trimmed);
  const resultCode = parsed?.response?.header?.resultCode;
  if (resultCode && resultCode !== "00" && resultCode !== "000") {
    const msg = parsed?.response?.header?.resultMsg ?? "API Error";
    throw new Error(`RTMS resultCode=${resultCode} (${msg})`);
  }
  const rawItems = parsed?.response?.body?.items?.item;
  if (!rawItems) return [];
  return Array.isArray(rawItems) ? rawItems : [rawItems];
}

/**
 * 2. 국토부 아파트/오피스텔 실거래가 증분 수집 공통 함수
 */
async function syncTradeCategory(kind, months, cutoffDate) {
  const isApt = kind === "apt";
  const label = isApt ? "아파트" : "오피스텔";
  const outDir = isApt ? APT_DIR : OFFICETEL_DIR;
  const endpoint = isApt
    ? "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev"
    : "https://apis.data.go.kr/1613000/RTMSDataSvcOffiTrade/getRTMSDataSvcOffiTrade";

  console.log(
    `[${isApt ? "2/3" : "3/3"}] 국토부 ${label} 실거래가 증분 수집 시작 (전국 ${SIGUNGU_CODES.length}개 시군구 × ${months.length}개월)...`
  );

  const keyParam = buildServiceKeyParam(API_KEY);
  const searchCandidates = [];

  for (const areaInfo of SIGUNGU_CODES) {
    const filePath = path.join(outDir, `${areaInfo.code}.json`);
    const existingFile = await readExistingJson(filePath);
    const newRecords = [];

    for (const dealYmd of months) {
      const url = `${endpoint}?serviceKey=${keyParam}&LAWD_CD=${areaInfo.code}&DEAL_YMD=${dealYmd}&pageNo=1&numOfRows=1000`;

      try {
        const text = await fetchWithRetry(
          url,
          `${kind.toUpperCase()} ${areaInfo.sido} ${areaInfo.sigungu}(${areaInfo.code}) ${dealYmd}`
        );
        const items = extractRtmsItems(text);

        for (const item of items) {
          const name = String(
            isApt
              ? (item.aptNm ?? item.아파트 ?? "")
              : (item.offiNm ?? item.단지 ?? "")
          ).trim();
          const dong = String(item.umdNm ?? item.법정동 ?? "").trim();
          const jibun = isApt
            ? String(item.jibun ?? item.지번 ?? "").trim()
            : undefined;
          const buildYear = parseIntClean(item.buildYear ?? item.건축년도);
          const area = parseFloatClean(item.excluUseAr ?? item.전용면적);
          const floor = parseIntClean(item.floor ?? item.층);
          const price = parseIntClean(item.dealAmount ?? item.거래금액);
          const year = String(item.dealYear ?? item.년 ?? "").trim();
          const month = pad2(item.dealMonth ?? item.월);
          const day = pad2(item.dealDay ?? item.일);
          const dealDate = year ? `${year}-${month}-${day}` : "";
          const dealType = String(item.dealingGbn ?? item.거래유형 ?? "").trim();
          const cdealType = String(item.cdealType ?? item.해제여부 ?? "").trim();
          const cancelYn = cdealType === "O" || cdealType === "Y";
          const aptSeq = isApt ? String(item.aptSeq ?? "").trim() : "";

          if (!name || price <= 0) continue;

          newRecords.push({
            id: `${areaInfo.code}-${aptSeq || makeShortHash(`${dong}|${name}`)}`,
            name,
            dong,
            ...(jibun !== undefined ? { jibun } : {}),
            buildYear,
            area,
            floor,
            price,
            dealDate,
            dealType,
            cancelYn,
          });
        }
      } catch (err) {
        console.error(
          `[ERROR] ${kind.toUpperCase()} ${areaInfo.sido} ${areaInfo.sigungu}(${areaInfo.code}) ${dealYmd} 실패:`,
          err.message
        );
      }
    }

    const mergedRecords = mergeAndPruneTrades(
      existingFile?.items,
      newRecords,
      cutoffDate
    );

    const fullSigunguName = `${areaInfo.sido} ${areaInfo.sigungu}`;

    // Minify 저장 (들여쓰기 제거로 30~40% 용량 절감)
    await fs.writeFile(
      filePath,
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        sigunguCode: areaInfo.code,
        sigunguName: fullSigunguName,
        sido: areaInfo.sido,
        sigungu: areaInfo.sigungu,
        count: mergedRecords.length,
        items: mergedRecords,
      }),
      "utf8"
    );

    // 검색 인덱스용 단지별 최신 정상 거래 1건 추출
    const seen = new Set();
    for (const r of mergedRecords) {
      if (r.cancelYn) continue;
      const key = `${r.dong}|${r.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      searchCandidates.push({
        id: makeRouteComplexId(kind, areaInfo.code, r.dong, r.name),
        name: r.name,
        sido: areaInfo.sido,
        sigungu: areaInfo.sigungu,
        dong: r.dong,
        latestPrice: r.price,
        type: kind,
      });
    }
  }

  console.log(
    `[${isApt ? "2/3" : "3/3"}] ${label} 저장 완료 (검색 인덱스 ${searchCandidates.length}개 단지)`
  );
  return searchCandidates;
}

async function main() {
  const startedAt = Date.now();
  await fs.mkdir(APT_DIR, { recursive: true });
  await fs.mkdir(OFFICETEL_DIR, { recursive: true });

  const months = getRecentMonths(FETCH_MONTHS);
  const cutoffDate = getRetentionCutoffDate(RETENTION_MONTHS);
  console.log(
    `=== 전국 ${SIGUNGU_CODES.length}개 시군구 공공데이터 증분 동기화 시작 (호출 월: ${months.join(", ")}, 보존 기준: ${cutoffDate}~) ===`
  );

  const subscriptions = await syncSubscriptions();
  const aptIndex = await syncTradeCategory("apt", months, cutoffDate);
  const officetelIndex = await syncTradeCategory("officetel", months, cutoffDate);

  const subIndex = subscriptions.map((s) => ({
    id: s.id,
    name: s.name,
    sido: s.region,
    sigungu: "",
    dong: s.address,
    latestPrice: 0,
    type: "sub",
  }));

  const searchIndex = [...aptIndex, ...officetelIndex, ...subIndex];
  const indexJson = JSON.stringify(searchIndex);
  const indexSizeKB = (Buffer.byteLength(indexJson, "utf8") / 1024).toFixed(1);

  await fs.writeFile(path.join(DATA_DIR, "search-index.json"), indexJson, "utf8");

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `=== 동기화 완료 (${elapsedSec}초 소요, search-index 총 ${searchIndex.length}건, ${indexSizeKB} KB) ===`
  );
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
