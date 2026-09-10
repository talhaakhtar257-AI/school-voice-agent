import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";

/**
 * The school office phone number, shown on the staff sign-in screen and reusable
 * by every parent-facing screen (FR-013; Constitution VII — every screen has a
 * route to a human).
 *
 * A tel: link so a tap starts the call on a phone. The tap target is at least
 * 44px tall (frontend rules). Both languages sit next to each other so a missing
 * translation is visible here; the number itself is language-neutral and comes
 * from lib/office.ts.
 */
export function OfficePhone() {
  return (
    <div dir="auto" style={{ textAlign: "center", lineHeight: 1.4 }}>
      <p
        style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary)" }}
      >
        Call the school office · اسکول کے دفتر سے رابطہ کریں
      </p>
      <a
        href={`tel:${OFFICE_PHONE_E164}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "44px",
          padding: "0.4rem 0.75rem",
          fontSize: "1.1rem",
          fontWeight: 600,
        }}
      >
        {OFFICE_PHONE_DISPLAY}
      </a>
    </div>
  );
}
