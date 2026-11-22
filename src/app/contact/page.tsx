import type { Metadata } from "next";
import { CopyEmailButton } from "@/components/common/CopyEmailButton";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "문의하기",
  description: `Beesvia Fin 서비스 오류 제보, 세법 업데이트 요청 및 제휴 문의는 ${CONTACT_EMAIL}로 연락해 주세요.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `문의하기 | ${SITE_NAME}`,
    description: `문의 이메일 ${CONTACT_EMAIL} 안내 및 원클릭 복사.`,
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          Contact Us
        </span>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          문의하기
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          계산기 수식 오류 제보, 세법 개정 반영 요청, 신규 계산기 제안 및
          서비스 문의를 환영합니다.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">공식 문의 이메일</h2>
        <p className="mt-2 text-sm text-slate-600">
          아래 이메일 주소로 내용을 보내주시면 영업일 기준 빠르게 확인 후
          회신드리겠습니다.
        </p>

        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-mono text-base font-bold text-slate-900 hover:text-blue-700"
          >
            {CONTACT_EMAIL}
          </a>
          <CopyEmailButton />
        </div>

        <div className="mt-8 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-600">
          <h3 className="font-bold text-slate-900">
            오류 제보 시 함께 알려주시면 좋은 정보
          </h3>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>이용하신 계산기 이름 (예: 부동산 취득세 계산기)</li>
            <li>입력하신 조건 및 금액</li>
            <li>예상하신 결과와 화면에 표시된 결과의 차이</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
