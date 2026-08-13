"use client";

import type { ProjectionResult } from "@/lib/resources/breakeven-analysis-worksheet/projection";
import { currency } from "./ui";

// The one chart in the tool: cumulative cash position from launch through month
// 36, and where it crosses zero.
//
// It earns its place because the crossing is the one thing the table cannot
// show — "where does the line hit zero" is a glance versus nine rows, and it is
// the emotional payload of the whole exercise. A second chart would not: with
// step-function growth, a revenue-vs-expense bar chart is three identical
// plateaus.
//
// Hand-rolled SVG, no library. package.json ships no charting dependency and
// ~80 lines of path math beats adding ~100KB to a marketing tool.

const W = 640;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 26, left: 56 };

export default function CumulativeChart({ projection }: { projection: ProjectionResult }) {
  const points = [
    { m: 0, cumulative: -projection.inputs.totalOneTime },
    ...projection.months.map((m) => ({ m: m.m, cumulative: m.cumulative })),
  ];

  const values = points.map((p) => p.cumulative);
  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);
  // Pad the range so the line never rides the frame.
  const span = rawMax - rawMin || 1;
  const min = rawMin - span * 0.08;
  const max = rawMax + span * 0.08;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (m: number) => PAD.left + (m / 36) * innerW;
  const y = (v: number) => PAD.top + ((max - v) / (max - min)) * innerH;

  const zeroY = y(0);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.m).toFixed(1)},${y(p.cumulative).toFixed(1)}`).join(" ");
  const area = `${line} L${x(36).toFixed(1)},${zeroY.toFixed(1)} L${x(0).toFixed(1)},${zeroY.toFixed(1)} Z`;

  const be = projection.breakEven.capitalPaybackMonth;
  const crossing = be !== null && be <= 36 ? { m: be, v: projection.months[be - 1]?.cumulative ?? 0 } : null;

  const endValue = points[points.length - 1].cumulative;
  const label =
    `Cumulative cash position from launch through month 36. ` +
    `Starts at ${currency(-projection.inputs.totalOneTime)}` +
    (crossing ? `, crosses zero in month ${crossing.m}` : ", never crosses zero within three years") +
    `, ending year 3 at ${currency(endValue)}.`;

  return (
    <figure className="mt-5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={label}
        /* Default xMidYMid meet on purpose — preserveAspectRatio="none" would
           stretch the stroke weight along with the geometry. */
      >
        <defs>
          {/* Two clips split at the zero line so the fill can be terracotta
              below and teal above with a single area path drawn twice. */}
          <clipPath id="plp-clip-below">
            <rect x={0} y={zeroY} width={W} height={Math.max(0, H - zeroY)} />
          </clipPath>
          <clipPath id="plp-clip-above">
            <rect x={0} y={0} width={W} height={Math.max(0, zeroY)} />
          </clipPath>
        </defs>

        {/* Year gridlines */}
        {[12, 24, 36].map((m) => (
          <g key={m}>
            <line
              x1={x(m)}
              y1={PAD.top}
              x2={x(m)}
              y2={H - PAD.bottom}
              stroke="#e6e2d9"
              strokeWidth={1}
            />
            <text
              x={x(m)}
              y={H - 8}
              textAnchor="middle"
              className="font-sans"
              fontSize={11}
              fill="#807868"
            >
              Y{m / 12}
            </text>
          </g>
        ))}

        <path d={area} fill="var(--color-terracotta, #c0674a)" opacity={0.1} clipPath="url(#plp-clip-below)" />
        <path d={area} fill="var(--color-deep-teal, #5b9a2f)" opacity={0.1} clipPath="url(#plp-clip-above)" />

        {/* Zero baseline */}
        <line x1={PAD.left} y1={zeroY} x2={W - PAD.right} y2={zeroY} stroke="#d9d5cc" strokeWidth={1.5} />
        <text x={PAD.left - 6} y={zeroY + 4} textAnchor="end" fontSize={11} fill="#807868">
          $0
        </text>

        {/* Start and end labels */}
        <text x={PAD.left - 6} y={y(rawMin) + 4} textAnchor="end" fontSize={11} fill="#807868">
          {currency(rawMin)}
        </text>
        {rawMax > 0 && (
          <text x={PAD.left - 6} y={y(rawMax) + 4} textAnchor="end" fontSize={11} fill="#807868">
            {currency(rawMax)}
          </text>
        )}

        <path d={line} fill="none" stroke="#1a1a1a" strokeWidth={2} strokeLinejoin="round" />

        {crossing && (
          <g>
            <circle cx={x(crossing.m)} cy={zeroY} r={5} fill="var(--color-warm-gold, #f5a623)" />
            <text
              x={x(crossing.m)}
              y={zeroY - 12}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="#1a1a1a"
            >
              Month {crossing.m}
            </text>
          </g>
        )}
      </svg>
      <figcaption className="font-sans text-xs text-charcoal/55 mt-1 text-center">
        Cumulative cash position. Below the line you are still paying back what
        it cost to open.
      </figcaption>
    </figure>
  );
}
