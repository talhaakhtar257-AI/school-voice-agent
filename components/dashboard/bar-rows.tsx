import ui from "./ui.module.css";

export type BarRow = { key: string; label: string; value: number; valueLabel: string };

/** Horizontal bar list, scaled to the largest value. Labels may be Urdu script. */
export function BarRows({ rows }: { rows: BarRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <ul className={ui.barList}>
      {rows.map((row) => (
        <li key={row.key} className={ui.barRow}>
          <div className={ui.barRowHead}>
            <span dir="auto" className={ui.barLabel}>
              {row.label}
            </span>
            <span className={ui.num}>{row.valueLabel}</span>
          </div>
          <div className={ui.barTrack} aria-hidden="true">
            <div className={ui.barFill} style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
