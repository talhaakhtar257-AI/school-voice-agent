import { listLeads } from "@/lib/leads/queries";
import { orNull } from "@/lib/dashboard/overview";
import { readLang } from "@/lib/language-server";
import { leadsAdminStrings as s } from "@/lib/strings/leads-admin";
import { screenStrings as d } from "@/lib/strings/dashboard-screens";
import { LeadsTable } from "@/components/leads/leads-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import ui from "@/components/dashboard/ui.module.css";

export const dynamic = "force-dynamic";

/** Staff see every parent enquiry, newest first (User Story 1, FR-003/FR-004). */
export default async function LeadsPage() {
  const lang = await readLang();
  const leads = await orNull("leads", listLeads());

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <div>
          <h2 className={ui.cardTitle}>{s.title[lang]}</h2>
          <div className={ui.sub}>{d.leadsSub[lang]}</div>
        </div>
      </div>
      {leads === null ? (
        <EmptyState tone="error" title={s.errorTitle[lang]} body={s.errorBody[lang]} />
      ) : (
        <LeadsTable initialLeads={leads} lang={lang} />
      )}
    </section>
  );
}
