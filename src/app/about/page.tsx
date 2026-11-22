import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "Beesvia Fin(fin.beesvia.com)은 한국 사용자를 위해 100% 브라우저 로컬 연산으로 동작하는 무료 부동산·세금·금융 통합 계산기 허브입니다.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `서비스 소개 | ${SITE_NAME}`,
    description:
      "100% 클라이언트 사이드 수식 기반 부동산·세금·금융 통합 계산기 안내 및 데이터·세법 기준 설명.",
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          About {SITE_NAME}
        </span>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          서비스 소개 및 데이터·세법 기준 안내
        </h1>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700 sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            1. Beesvia Fin의 목표
          </h2>
          <p>
            <strong>{SITE_NAME}</strong>(<code>fin.beesvia.com</code>)은
            부동산 매수·임대차, 대출 한도 점검, 사전 증여 등 중요한 재무적
            결정을 앞두고 복잡한 세율과 금융 규정을 빠르게 시뮬레이션할 수
            있도록 만든 무료 통합 계산기 서비스입니다.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            2. 100% 클라이언트 사이드 연산 (개인정보 보호)
          </h2>
          <p>
            본 서비스의 모든 계산기는 회원가입이나 로그인을 요구하지 않으며,
            사용자가 입력하는 부동산 가액, 연소득, 대출 금액, 증여 금액 등의
            데이터는 외부 서버나 데이터베이스로 전송되지 않고 사용자의 웹
            브라우저 내에서만 즉시 계산됩니다.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            3. 적용 법령 및 계산 기준
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>부동산 취득세:</strong> 지방세법 및 지방세특례제한법상
              주택·오피스텔 유상거래 세율, 생애최초 주택구입 감면(최대 200만 원
              한도), 전용면적 85㎡ 기준 농어촌특별세 비과세 규정을 반영합니다.
            </li>
            <li>
              <strong>부동산 중개보수(복비):</strong> 공인중개사법 시행규칙상
              거래 유형(매매·전세·월세) 및 물건별 법정 상한요율·한도액, 월세
              환산보증금 특례(×100 / ×70)를 반영합니다.
            </li>
            <li>
              <strong>DSR 및 월 상환액:</strong> 금융위원회·금융감독원
              총부채원리금상환비율(DSR) 산정 방식 및 스트레스 DSR 가산금리
              구조를 반영합니다.
            </li>
            <li>
              <strong>증여세 모의 계산:</strong> 상속세 및 증여세법상 증여자
              관계별 공제 한도(10년 합산), 누진세율표(10%~50%), 세대생략
              할증(30%) 및 기한 내 자진신고 세액공제(3%)를 반영합니다.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">문의 및 제보</h2>
          <p className="mt-2 text-sm text-slate-600">
            세법 개정에 따른 계산기 업데이트 요청이나 오류 제보는{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-blue-700 underline"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            또는{" "}
            <Link href="/contact" className="font-semibold text-blue-700 underline">
              문의하기 페이지
            </Link>
            를 통해 언제든지 전달해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
