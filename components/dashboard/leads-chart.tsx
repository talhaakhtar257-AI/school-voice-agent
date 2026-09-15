"use client";

import { useRef, useState } from "react";
import type { Lang } from "@/lib/language";
import type { DayLeads } from "@/lib/dashboard/overview";
import { formatDayLabel } from "@/lib/dashboard/format";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import ui from "./ui.module.css";
import panels from "./panels.module.css";

// A fixed drawing space; the SVG scales to its card with width:100%, so no
// resize listener is needed.
const W = 640;
const H = 270;
const PAD_T = 22;
const PAD_B = 50;
const PAD_L = 48;
const PAD_R = 8;
const PLOT_H = H - PAD_T - PAD_B;
const PLOT_W = W - PAD_L - PAD_R;

// Stacked bottom to top. The design's validated English/Urdu pair plus a neutral grey.
const SERIES = [
  { key: "ur", color: "#C98500" },
  { key: "none", color: "#9AA8A2" },
  { key: "en", color: "#12A67B" },
] as const;

function niceStep(rawMax: number) {
  if (rawMax <= 5) return 1;
  const rough = rawMax / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  return [1, 2, 5, 10].map((m) => m * magnitude).find((step) => step >= rough) ?? 10 * magnitude;
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, Math.max(0, h));
  return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
}

/**
 * Leads per day, stacked by language — the design's hand-built bar chart as
 * JSX. Hover shows a tooltip; the data table toggle gives the same numbers to
 * screen readers and to anyone who prefers reading figures. The page only
 * renders this when at least one lead exists; the empty state lives there.
 */
export function LeadsChart({ days, lang }: { days: DayLeads[]; lang: Lang }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ index: number; left: number; top: number } | null>(null);
  const [showTable, setShowTable] = useState(false);

  const labels = { en: s.seriesEn[lang], ur: s.seriesUr[lang], none: s.seriesNone[lang] };
  const totals = days.map((d) => d.en + d.ur + d.none);
  const step = niceStep(Math.max(0, ...totals));
  const max = Math.max(step, Math.ceil(Math.max(0, ...totals) / step) * step);
  const y = (value: number) => PAD_T + PLOT_H - (value / max) * PLOT_H;
  const band = PLOT_W / days.length;
  const barWidth = Math.min(46, band * 0.54);
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);

  function trackPointer(index: number, event: React.MouseEvent) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    setHover({
      index,
      left: Math.max(4, Math.min(box.width - 150, event.clientX - box.left + 12)),
      top: Math.max(4, event.clientY - box.top - 80),
    });
  }

  const hovered = hover ? days[hover.index] : null;

  return (
    <div className={panels.chartBox} ref={boxRef}>
      <div className={panels.legend}>
        {[...SERIES].reverse().map((series) => (
          <span key={series.key}>
            <i className={panels.swatch} style={{ background: series.color }} />
            {labels[series.key]}
          </span>
        ))}
      </div>

      <div dir="ltr">
        <svg
          className={panels.chartSvg}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${s.chartTitle[lang]} — ${s.chartSub[lang]}`}
          style={{ fontFamily: "var(--font-en), var(--font-ur), sans-serif" }}
        >
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke={v === 0 ? "#D2DCD7" : "#EDF1EE"} />
              <text x={PAD_L - 9} y={y(v) + 4} textAnchor="end" fontSize="11" fontWeight="600" fill="#6E7F78">
                {v}
              </text>
            </g>
          ))}

          <text transform={`translate(13 ${PAD_T + PLOT_H / 2}) rotate(-90)`} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#4B605A">
            {s.axisLeads[lang]}
          </text>

          {days.map((day, i) => {
            const cx = PAD_L + band * i + band / 2;
            const x = cx - barWidth / 2;
            let running = 0;
            const segments = SERIES.map((series) => {
              const from = running;
              running += day[series.key];
              return { ...series, from, to: running };
            }).filter((segment) => segment.to > segment.from);

            return (
              <g key={day.date}>
                {segments.map((segment, index) => {
                  const top = y(segment.to);
                  const height = y(segment.from) - top;
                  return index === segments.length - 1 ? (
                    <path key={segment.key} d={roundedTop(x, top, barWidth, height, 4)} fill={segment.color} stroke="#fff" strokeWidth="1" />
                  ) : (
                    <rect key={segment.key} x={x} y={top} width={barWidth} height={height} fill={segment.color} stroke="#fff" strokeWidth="1" />
                  );
                })}
                {totals[i] > 0 && (
                  <text x={cx} y={y(totals[i]) - 8} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#4B605A">
                    {totals[i]}
                  </text>
                )}
                <text x={cx} y={PAD_T + PLOT_H + 18} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#6E7F78">
                  {formatDayLabel(day.date, lang)}
                </text>
                <rect
                  x={PAD_L + band * i}
                  y={PAD_T}
                  width={band}
                  height={PLOT_H}
                  fill="transparent"
                  onMouseMove={(event) => trackPointer(i, event)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            );
          })}

          <text x={PAD_L + PLOT_W / 2} y={H - 6} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#4B605A">
            {s.axisDay[lang]}
          </text>
        </svg>
      </div>

      {hover && hovered && (
        <div className={panels.tip} style={{ left: hover.left, top: hover.top }} aria-hidden="true">
          {formatDayLabel(hovered.date, lang)}
          <br />
          {labels.en}: <b>{hovered.en}</b>
          <br />
          {labels.ur}: <b>{hovered.ur}</b>
          <br />
          {labels.none}: <b>{hovered.none}</b>
        </div>
      )}

      <button type="button" className={panels.linkButton} aria-expanded={showTable} onClick={() => setShowTable((open) => !open)}>
        {showTable ? s.hideTable[lang] : s.showTable[lang]}
      </button>

      {showTable && (
        <div className={ui.tscroll}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">{s.axisDay[lang]}</th>
                <th scope="col">{labels.en}</th>
                <th scope="col">{labels.ur}</th>
                <th scope="col">{labels.none}</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.date}>
                  <td>{formatDayLabel(day.date, lang)}</td>
                  <td className={ui.num}>{day.en}</td>
                  <td className={ui.num}>{day.ur}</td>
                  <td className={ui.num}>{day.none}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
