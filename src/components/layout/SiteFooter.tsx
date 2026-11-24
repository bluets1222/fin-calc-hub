import Link from "next/link";
import {
  CALCULATOR_NAV,
  CONTACT_EMAIL,
  FAMILY_SITES,
  POLICY_NAV,
  SITE_NAME,
} from "@/lib/site";

const REAL_ESTATE_LOOKUP_NAV = [
  { label: "청약 분양정보 조회", href: "/subscription" },
  { label: "아파트 실거래가 조회", href: "/real-estate?type=apt" },
  { label: "오피스텔 실거래가 조회", href: "/real-estate?type=officetel" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1열: 브랜드 소개 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-900">
                BF
              </span>
              <span className="text-base font-bold text-white">{SITE_NAME}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              전국 아파트·오피스텔 실거래가 및 청약 분양정보 조회부터
              취득세·중개보수·DSR 대출 한도까지 한 번에 계산하는 스마트
              부동산·금융 허브입니다.
            </p>
            <p className="text-xs text-slate-400">
              문의:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-slate-200 underline decoration-slate-600 underline-offset-2 hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          {/* 2열: 부동산 조회 */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              부동산 조회
            </h3>
            <ul className="space-y-2 text-sm">
              {REAL_ESTATE_LOOKUP_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3열: 세금·금융 계산기 (8종) */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              세금·금융 계산기 (8종)
            </h3>
            <ul className="space-y-1.5 text-sm">
              {CALCULATOR_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4열: 운영 정책 및 가이드 + BEESVIA 패밀리 사이트 */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                운영 정책 및 가이드
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/guide"
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    세무·금융 가이드
                  </Link>
                </li>
                {POLICY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-slate-300 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                BEESVIA 패밀리 사이트
              </h3>
              <ul className="space-y-2.5 text-sm">
                {FAMILY_SITES.map((site) => (
                  <li key={site.href}>
                    <a
                      href={site.href}
                      target="_blank"
                      rel="noopener"
                      className="group block rounded-lg border border-slate-800 bg-slate-800/50 p-2.5 transition-colors hover:border-slate-700 hover:bg-slate-800"
                    >
                      <div className="flex items-center justify-between font-medium text-slate-100">
                        <span>{site.name}</span>
                        <span className="text-xs text-slate-400 group-hover:text-white">
                          ↗
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {site.description}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-xs leading-relaxed text-slate-400">
          <p>
            면책 안내: 본 사이트의 모든 계산 결과는 현행 법령 및 일반 기준에
            기초한 모의 참고용이며, 개별 감면 요건·특례·금융기관 심사 기준에 따라
            실제 금액과 다를 수 있습니다. 정확한 세액 및 대출 한도는 국세청
            홈택스, 위택스(WETAX), 해당 금융기관 또는 세무 전문가에게 반드시
            최종 확인하시기 바랍니다.
          </p>
          <p className="mt-3 text-slate-500">
            © 2026 {SITE_NAME} (fin.beesvia.com). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
