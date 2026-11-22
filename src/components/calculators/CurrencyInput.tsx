"use client";

import { formatKoreanUnit, formatNumber, parseNumericInput } from "@/lib/format";

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  helperText?: string;
  unit?: string;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  helperText,
  unit = "원",
}: CurrencyInputProps) {
  const displayValue = value > 0 ? formatNumber(value) : "";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        <span className="text-xs font-semibold text-blue-700">
          {formatKoreanUnit(value)}
        </span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder}
          onChange={(e) => onChange(parseNumericInput(e.target.value))}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-right font-mono text-base font-semibold text-slate-900 shadow-xs transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-medium text-slate-500">
          {unit}
        </span>
      </div>
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
