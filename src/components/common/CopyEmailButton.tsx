"use client";

import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/site";

export function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
        copied
          ? "bg-emerald-600 text-white"
          : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {copied ? "이메일 주소 복사 완료!" : "이메일 주소 복사하기"}
    </button>
  );
}
