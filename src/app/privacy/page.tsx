import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "Beesvia Fin의 개인정보처리방침입니다. 입력 데이터의 서버 미전송·로컬 처리 원칙 및 Google AdSense 쿠키 사용 안내를 확인하세요.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `개인정보처리방침 | ${SITE_NAME}`,
    description:
      "입력 데이터 서버 미전송 원칙 및 Google AdSense 광고 쿠키 안내.",
    url: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          Privacy Policy
        </span>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          개인정보처리방침
        </h1>
        <p className="text-xs text-slate-500">시행일: 2026년 1월 1일</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700 sm:text-base">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            1. 개인정보 수집 및 서버 미전송 원칙
          </h2>
          <p>
            <strong>{SITE_NAME}</strong>(<code>{SITE_URL}</code>)은 별도의
            회원가입 기능을 운영하지 않으며, 이용자의 성명, 주민등록번호,
            연락처 등 개인정보를 수집하거나 서버에 저장하지 않습니다.
            계산기 화면에 입력하시는 금액, 연소득, 대출 조건 등의 모든 수치는
            이용자의 웹 브라우저(클라이언트) 메모리 내에서만 일시적으로 연산된
            후 페이지를 닫으면 즉시 소멸됩니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            2. 쿠키(Cookie) 및 Google AdSense 광고 안내
          </h2>
          <p>
            본 서비스는 서비스 운영 및 무료 제공을 위해 Google AdSense 등
            제3자 광고 서비스를 게재할 수 있습니다.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Google을 포함한 제3자 공급업체는 쿠키를 사용하여 이용자의 본
              사이트 또는 다른 웹사이트 과거 방문 기록을 기반으로 맞춤형 광고를
              게재할 수 있습니다.
            </li>
            <li>
              Google의 광고 쿠키 사용으로 인해 Google과 파트너는 이용자의 본
              사이트 및 인터넷상의 다른 사이트 방문 기록을 바탕으로 적절한 광고를
              표시할 수 있습니다.
            </li>
            <li>
              이용자는{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 underline"
              >
                Google 광고 설정(adssettings.google.com)
              </a>{" "}
              또는{" "}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 underline"
              >
                aboutads.info
              </a>
              를 방문하여 맞춤 광고를 위한 쿠키 사용을 거부(Opt-out)할 수
              있습니다.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            3. 접속 로그 및 분석 도구
          </h2>
          <p>
            웹 호스팅 환경 및 보안 유지를 위해 일반적인 접속 로그(IP 주소,
            브라우저 유형, 방문 일시 등)가 서버 인프라 수준에서 일시적으로
            기록될 수 있으며, 이는 서비스 안정성 확보 및 부정 이용 방지 목적
            외에는 사용되지 않습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            4. 개인정보 보호 문의처
          </h2>
          <p>
            본 개인정보처리방침에 관한 문의 사항은 아래 이메일로 연락해 주시면
            신속히 안내해 드리겠습니다.
          </p>
          <p className="font-semibold text-slate-900">
            이메일:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-blue-700 underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
