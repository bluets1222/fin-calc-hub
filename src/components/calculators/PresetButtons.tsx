"use client";

export interface PresetOption {
  label: string;
  amount: number;
}

interface PresetButtonsProps {
  presets: PresetOption[];
  onAdd: (amount: number) => void;
  onReset?: () => void;
  resetLabel?: string;
}

export function PresetButtons({
  presets,
  onAdd,
  onReset,
  resetLabel = "초기화",
}: PresetButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onAdd(preset.amount)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200"
        >
          {preset.label}
        </button>
      ))}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}
