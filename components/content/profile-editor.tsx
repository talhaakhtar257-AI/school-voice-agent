"use client";

import type { Facts, Profile } from "@/lib/content/schema";
import { BilingualField } from "./bilingual-field";

type Stats = Facts["stats"];

const input = {
  padding: "0.4rem",
  fontSize: "1rem",
  minHeight: "44px",
  width: "8rem",
  boxSizing: "border-box" as const,
};

// An empty box means "not set" (null), so the website hides that figure.
function toCount(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Math.floor(Number(raw));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * The school profile shown on the website: tagline, about, address, the
 * figures strip, and the sample-content banner switch.
 */
export function ProfileEditor({
  profile,
  stats,
  onProfileChange,
  onStatsChange,
}: {
  profile: Profile;
  stats: Stats;
  onProfileChange: (next: Profile) => void;
  onStatsChange: (next: Stats) => void;
}) {
  const figures: { key: keyof Stats; label: string }[] = [
    { key: "studentsEnrolled", label: "Students enrolled" },
    { key: "teachers", label: "Qualified teachers" },
    { key: "foundedYear", label: "Year founded" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <BilingualField
        label="Tagline (short line under the school name)"
        value={profile.tagline}
        onChange={(tagline) => onProfileChange({ ...profile, tagline })}
      />
      <BilingualField
        label="About the school"
        value={profile.about}
        onChange={(about) => onProfileChange({ ...profile, about })}
      />
      <BilingualField
        label="Address"
        value={profile.address}
        onChange={(address) => onProfileChange({ ...profile, address })}
      />

      <div>
        <strong>Figures</strong>
        <p style={{ margin: "0.2rem 0 0.4rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Leave a box empty to hide that figure on the website.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {figures.map((figure) => (
            <label key={figure.key} style={{ display: "flex", flexDirection: "column", fontSize: "0.9rem", gap: "0.2rem" }}>
              {figure.label}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={stats[figure.key] ?? ""}
                onChange={(e) => onStatsChange({ ...stats, [figure.key]: toCount(e.target.value) })}
                style={input}
              />
            </label>
          ))}
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", minHeight: "44px" }}>
        <input
          type="checkbox"
          checked={profile.showSampleBanner}
          onChange={(e) => onProfileChange({ ...profile, showSampleBanner: e.target.checked })}
          style={{ width: "22px", height: "22px" }}
        />
        Show the &ldquo;sample content — not real school information&rdquo; banner on the website
      </label>
    </div>
  );
}
