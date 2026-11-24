import { formatManwonPrice } from "@/lib/real-estate-seo";

interface TrendPoint {
  month: string;
  avgPrice: number;
  count: number;
}

interface PriceTrendChartProps {
  points: TrendPoint[];
  complexName: string;
}

/**
 * 외부 차트 라이브러리 없이 동작하는 경량 SVG 실거래가 추이 차트입니다.
 */
export function PriceTrendChart({ points, complexName }: PriceTrendChartProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        최근 추이 데이터가 충분하지 않습니다.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padX = 56;
  const padTop = 28;
  const padBottom = 38;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const prices = points.map((p) => p.avgPrice);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = Math.max(1, maxP - minP);

  const coords = points.map((p, idx) => {
    const x =
      points.length === 1
        ? padX + chartW / 2
        : padX + (idx / (points.length - 1)) * chartW;
    const y =
      points.length === 1 || maxP === minP
        ? padTop + chartH / 2
        : padTop + (1 - (p.avgPrice - minP) / range) * chartH;
    return { ...p, x, y };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${coords[0].x} ${padTop + chartH} Z`
      : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          {complexName} 최근 실거래가 추이
        </h2>
        <span className="text-xs text-slate-500">
          월별 평균 거래가 기준 ({points.length}개월)
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full min-w-[360px]"
          role="img"
          aria-label={`${complexName} 월별 평균 실거래가 추이 차트`}
        >
          <defs>
            <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = padTop + ratio * chartH;
            return (
              <line
                key={ratio}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#priceAreaGrad)" />}
          {coords.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {coords.map((c) => (
            <g key={c.month}>
              <circle
                cx={c.x}
                cy={c.y}
                r="5.5"
                fill="#ffffff"
                stroke="#1e3a8a"
                strokeWidth="3"
              />
              <text
                x={c.x}
                y={c.y - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
              >
                {formatManwonPrice(c.avgPrice).replace(" 원", "원")}
              </text>
              <text
                x={c.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {c.month} ({c.count}건)
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
