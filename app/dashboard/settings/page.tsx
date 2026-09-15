import { OFFICE_PHONE_DISPLAY } from "@/lib/office";
import { retellConfigured, voiceLimits } from "@/lib/dashboard/settings";
import { readLang } from "@/lib/language-server";
import { screenStrings as h } from "@/lib/strings/dashboard-screens";
import ui from "@/components/dashboard/ui.module.css";
import panels from "@/components/dashboard/panels.module.css";

export const dynamic = "force-dynamic";

/**
 * Read-only view of the settings the app actually runs with, and where each is
 * changed. Editable settings (004 User Story 6) need their own table and plan.
 * Secret values are never shown — Retell is reported only as yes or no.
 */
export default async function DashboardSettingsPage() {
  const lang = await readLang();
  const limits = voiceLimits();
  const notSet = h.notSet[lang];

  const rows = [
    {
      key: "phone",
      label: h.officePhone[lang],
      value: <span dir="ltr" className={ui.num}>{OFFICE_PHONE_DISPLAY}</span>,
      where: h.whereOffice[lang],
    },
    {
      key: "max-call",
      label: h.maxCallLength[lang],
      value:
        limits.maxCallSeconds === null
          ? notSet
          : `${limits.maxCallSeconds} ${h.seconds[lang]} (${Number((limits.maxCallSeconds / 60).toFixed(1))} ${h.minutes[lang]})`,
      where: h.whereEnv[lang],
    },
    {
      key: "per-visitor",
      label: h.callsPerVisitor[lang],
      value: limits.callsPerVisitorPerDay === null ? notSet : `${limits.callsPerVisitorPerDay} ${h.callsUnit[lang]}`,
      where: h.whereEnv[lang],
    },
    {
      key: "monthly-cap",
      label: h.monthlyCap[lang],
      value: limits.monthlyCapMinutes === null ? notSet : `${limits.monthlyCapMinutes} ${h.minutes[lang]}`,
      where: h.whereEnv[lang],
    },
    {
      key: "retell",
      label: h.retellConfigured[lang],
      value: retellConfigured() ? h.yes[lang] : h.no[lang],
      where: h.whereEnv[lang],
    },
  ];

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <h2 className={ui.cardTitle}>{h.settingsTitle[lang]}</h2>
      </div>
      <p className={panels.banner}>{h.settingsBanner[lang]}</p>
      <dl className={panels.settingsList}>
        {rows.map((row) => (
          <div key={row.key} className={panels.settingsRow}>
            <dt>{row.label}</dt>
            <dd className={panels.settingsValue}>{row.value}</dd>
            <dd className={panels.settingsWhere}>{row.where}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
