#!/usr/bin/env node
/**
 * Beesvia Fin (fin.beesvia.com) 자동 색인 파이프라인
 * - IndexNow (네이버 서치어드바이저 + Bing/IndexNow 글로벌 엔드포인트)
 * - Google Indexing API v3 (서비스 계정 JWT RS256 인증)
 *
 * 사용법:
 *   node scripts/auto-indexing.mjs
 *   node scripts/auto-indexing.mjs --google-limit=100 --dry-run
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://fin.beesvia.com"
).replace(/\/+$/, "");
const SITE_HOST = new URL(SITE_URL).host;
const DEFAULT_INDEXNOW_KEY = "9a4f7c2e8b1d40e6a3c5f8d2b7e1940a";
const INDEXNOW_KEY = (process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY).trim();
const GOOGLE_SA_RAW = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim();

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const googleLimitArg = args.find((a) => a.startsWith("--google-limit="));
const GOOGLE_LIMIT = googleLimitArg
  ? Math.max(1, Math.min(200, Number(googleLimitArg.split("=")[1]) || 80))
  : 80;

const CORE_STATIC_PATHS = [
  "/",
  "/subscription",
  "/real-estate",
  "/real-estate/acquisition-tax",
  "/real-estate/brokerage-fee",
  "/finance/dsr",
  "/tax/gift-tax",
  "/salary/net-pay",
  "/salary/severance",
  "/finance/loan-interest",
  "/finance/savings",
  "/guide",
];

function extractSitemapUrls(xmlText) {
  const urls = [];
  const regex = /<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/g;
  let match;
  while ((match = regex.exec(xmlText)) !== null) {
    urls.push(match[1].replace(/&amp;/g, "&"));
  }
  return Array.from(new Set(urls));
}

async function fetchUrlsFromSitemap() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  try {
    const res = await fetch(sitemapUrl, {
      headers: { "User-Agent": "BeesviaFinAutoIndexer/1.0" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const xml = await res.text();
    const urls = extractSitemapUrls(xml);
    if (urls.length > 0) {
      console.log(`[Sitemap] ${sitemapUrl} 에서 ${urls.length}개 URL 로드 완료`);
      return urls;
    }
  } catch (err) {
    console.warn(`[Sitemap] 원격 조회 실패 (${err.message}), 로컬 데이터 폴백 사용`);
  }

  // 로컬 JSON 폴백
  const fallback = CORE_STATIC_PATHS.map((p) => `${SITE_URL}${p}`);
  try {
    const subRaw = await fs.readFile(
      path.join(process.cwd(), "public", "data", "subscriptions.json"),
      "utf8"
    );
    const subData = JSON.parse(subRaw);
    for (const item of subData.items ?? []) {
      fallback.push(`${SITE_URL}/subscription/${item.id}`);
    }
  } catch {
    // ignore
  }
  return Array.from(new Set(fallback));
}

async function submitIndexNow(urls) {
  if (!INDEXNOW_KEY) {
    console.log("[IndexNow] INDEXNOW_KEY가 비어 있어 건너뜁니다.");
    return;
  }

  const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
  const endpoints = [
    { name: "Naver IndexNow", url: "https://searchadvisor.naver.com/indexnow" },
    { name: "Bing/Global IndexNow", url: "https://api.indexnow.org/indexnow" },
  ];

  // IndexNow는 요청당 최대 10,000개 URL 지원
  const batch = urls.slice(0, 10000);
  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: batch,
  };

  console.log(`[IndexNow] 전송 대상 ${batch.length}개 URL (keyLocation: ${keyLocation})`);
  if (DRY_RUN) {
    console.log("[IndexNow] --dry-run 모드: 실제 전송 생략");
    return;
  }

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const bodyText = (await res.text()).slice(0, 200);
      console.log(
        `[IndexNow] ${ep.name} 응답: HTTP ${res.status} ${res.statusText} ${bodyText ? `| ${bodyText}` : ""}`
      );
    } catch (err) {
      console.error(`[IndexNow] ${ep.name} 요청 오류: ${err.message}`);
    }
  }
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(serviceAccount) {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    iat: nowSec,
    exp: nowSec + 3600,
  };

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(claim)
  )}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedJwt);
  signer.end();
  const signature = signer
    .sign(serviceAccount.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const assertion = `${unsignedJwt}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`OAuth 토큰 발급 실패 (${tokenRes.status}): ${errBody}`);
  }

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token;
}

function selectGooglePriorityUrls(allUrls, limit) {
  // 1) 핵심 정적 허브·계산기 우선
  const coreSet = new Set(CORE_STATIC_PATHS.map((p) => `${SITE_URL}${p}`));
  const prioritized = [];

  for (const url of allUrls) {
    if (coreSet.has(url)) prioritized.push(url);
  }
  // 2) 청약 상세 페이지 우선
  for (const url of allUrls) {
    if (url.includes("/subscription/") && !prioritized.includes(url)) {
      prioritized.push(url);
    }
  }
  // 3) 나머지 가이드 및 주요 실거래가 단지 상세
  for (const url of allUrls) {
    if (!prioritized.includes(url)) {
      prioritized.push(url);
    }
  }

  return prioritized.slice(0, limit);
}

async function submitGoogleIndexing(allUrls) {
  if (!GOOGLE_SA_RAW) {
    console.log(
      "[Google Indexing API] GOOGLE_SERVICE_ACCOUNT_JSON 환경변수가 설정되지 않아 건너뜁니다."
    );
    return;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(GOOGLE_SA_RAW);
  } catch (err) {
    console.error(`[Google Indexing API] JSON 파싱 오류: ${err.message}`);
    return;
  }

  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    console.error(
      "[Google Indexing API] client_email 또는 private_key 필드가 누락되었습니다."
    );
    return;
  }

  const targetUrls = selectGooglePriorityUrls(allUrls, GOOGLE_LIMIT);
  console.log(
    `[Google Indexing API] 우선순위 ${targetUrls.length}개 URL 전송 시작 (서비스 계정: ${serviceAccount.client_email})`
  );

  if (DRY_RUN) {
    console.log("[Google Indexing API] --dry-run 모드: 실제 전송 생략");
    return;
  }

  let accessToken;
  try {
    accessToken = await getGoogleAccessToken(serviceAccount);
  } catch (err) {
    console.error(`[Google Indexing API] 인증 실패: ${err.message}`);
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const targetUrl of targetUrls) {
    try {
      const res = await fetch(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            url: targetUrl,
            type: "URL_UPDATED",
          }),
        }
      );

      if (res.ok) {
        successCount++;
      } else {
        failCount++;
        const errText = (await res.text()).slice(0, 180);
        if (failCount <= 5) {
          console.warn(
            `[Google Indexing API] 실패 (${res.status}) ${targetUrl}: ${errText}`
          );
        }
        if (res.status === 429) {
          console.warn("[Google Indexing API] 일일 할당량(429) 도달로 중단합니다.");
          break;
        }
      }
    } catch (err) {
      failCount++;
      console.warn(`[Google Indexing API] 요청 오류 ${targetUrl}: ${err.message}`);
    }
  }

  console.log(
    `[Google Indexing API] 완료: 성공 ${successCount}건 / 실패 ${failCount}건`
  );
}

async function main() {
  console.log(`=== Beesvia Fin Auto Indexing 시작 (${SITE_URL}) ===`);
  const urls = await fetchUrlsFromSitemap();
  console.log(`[Target] 총 색인 대상 URL: ${urls.length}개`);

  await submitIndexNow(urls);
  await submitGoogleIndexing(urls);
  console.log("=== Beesvia Fin Auto Indexing 종료 ===");
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
