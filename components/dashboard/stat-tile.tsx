import ui from "./ui.module.css";

/** One headline number. `percent` adds a progress bar under it. */
export function StatTile({
  label,
  value,
  hint,
  percent,
}: {
  label: string;
  value: string;
  hint?: string;
  percent?: number;
}) {
  return (
    <div className={ui.tile}>
      <div className={ui.tileLabel}>{label}</div>
      <div className={`${ui.tileValue} ${ui.num}`}>
        {/* Isolated LTR so "12 / 500" never reorders inside an Urdu page. */}
        <span dir="ltr">{value}</span>
      </div>
      {percent !== undefined && (
        <div className={ui.barTrack} aria-hidden="true">
          <div className={ui.barFill} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
        </div>
      )}
      {hint && <div className={ui.tileHint}>{hint}</div>}
    </div>
  );
}
