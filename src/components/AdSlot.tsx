"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export interface AdSlotProps {
  slotId: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-6678397214278641";

export function AdSlot({
  slotId,
  format = "auto",
  className = "",
}: AdSlotProps) {
  const pushedRef = useRef(false);
  const isNumericSlot = /^\d+$/.test(slotId);
  const minHeightClass =
    format === "rectangle" ? "min-h-[250px]" : "min-h-[100px]";

  useEffect(() => {
    if (!ADSENSE_CLIENT || !isNumericSlot || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 차단기 또는 스크립트 미로드 시 안전하게 무시
    }
  }, [isNumericSlot]);

  if (!ADSENSE_CLIENT || !isNumericSlot) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          aria-hidden="true"
          className={`flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 text-xs font-medium text-slate-400 ${minHeightClass} ${className}`}
        >
          AdSense Slot ({slotId} · {format})
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`overflow-hidden ${minHeightClass} ${className}`}
      aria-label="광고"
    >
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
