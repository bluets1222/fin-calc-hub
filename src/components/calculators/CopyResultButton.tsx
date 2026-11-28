"use client";

import { useState } from "react";

interface CopyResultButtonProps {
  getSummaryText: () => string;
  label?: string;
  showLinkCopy?: boolean;
}

export function CopyResultButton({
  getSummaryText,
  label = "계산 결과 복사",
  showLinkCopy = true,
}: CopyResultButtonProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  async function handleCopy() {
    await copyToClipboard(getSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function handleCopyLink() {
    await copyToClipboard(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2200);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
          copied
            ? "bg-emerald-600 text-white shadow-sm"
            : "border border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-50"
        }`}
      >
        {copied ? (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <span>클립보드에 복사되었습니다</span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
              />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>

      {showLinkCopy && (
        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            linkCopied
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-blue-200 bg-blue-50 text-blue-800 shadow-xs hover:bg-blue-100"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
            />
          </svg>
          <span>{linkCopied ? "링크 복사 완료!" : "계산 결과 링크 복사"}</span>
        </button>
      )}
    </div>
  );
}
