import type { Metadata } from "next";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용약관 및 면책조항",
  description:
    "Beesvia Fin 이용약관입니다. 본 서비스의 계산 결과는 참고용 모의 계산이며 세무·법률·금융 자문을 대체하지 않습니다.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `이용약관 | ${SITE_NAME}`,
    description:
      "Beesvia Fin 서비스 이용약관 및 세무·법률 자문 대체 불가 면책 조항.",
    url: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          Terms of Service
        </span>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          이용약관 및 면책 조항
        </h1>
        <p className="text-xs text-slate-500">시행일: 2026년 1월 1일</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700 sm:text-base">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">제1조 (목적)</h2>
          <p>
            본 약관은 <strong>{SITE_NAME}</strong>(<code>{SITE_URL}</code>)이
            제공하는 부동산·세금·금융 계산기 및 관련 정보 콘텐츠의 이용 조건과
            책임의 한계를 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            제2조 (세무·법률·금융 자문 대체 불가 및 면책)
          </h2>
          <p>
            본 서비스가 제공하는 취득세, 중개보수, DSR, 증여세 등의 모든 계산
            결과와 가이드 문서는 공개된 법령과 일반 기준을 바탕으로 작성된{" "}
            <strong>참고용 모의 계산</strong>입니다.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              개별 납세자의 특수 사정(주택 수 산정 예외, 감면 추징 요건, 기납부
              세액, 지자체 조례 등)이나 금융기관별 내부 심사 기준에 따라 실제
              금액과 차이가 발생할 수 있습니다.
            </li>
            <li>
              본 서비스의 결과는 세무사·변호사·법무사·금융상담사의 공식적인
              자문이나 유권해석을 대체하지 않습니다.
            </li>
            <li>
              이용자가 본 서비스의 계산 결과만을 근거로 행한 계약, 신고, 대출
              실행 등의 의사결정에 대해 운영자는 법적 책임을 지지 않으며,
              최종적인 확인은 반드시 국세청 홈택스, 위택스(WETAX), 해당
              금융기관 또는 전문가와 상의하시기 바랍니다.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            제3조 (지식재산권)
          </h2>
          <p>
            본 사이트에 게시된 UI, 계산 로직, 가이드 콘텐츠에 대한 저작권은{" "}
            {SITE_NAME}에 귀속되며, 사전 서면 동의 없이 무단 복제, 크롤링,
            상업적 재배포를 금지합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            제4조 (서비스 변경 및 문의)
          </h2>
          <p>
            운영자는 법령 개정 반영이나 서비스 개선을 위해 계산식과 콘텐츠를
            수시로 업데이트할 수 있습니다. 서비스 이용 관련 문의는{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-blue-700 underline"
            >
              {CONTACT_EMAIL}
            </a>
            로 접수해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
