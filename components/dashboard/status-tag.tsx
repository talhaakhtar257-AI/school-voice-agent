import type { Lang } from "@/lib/language";
import type { LeadStatus } from "@/lib/leads/rows";
import { leadsAdminStrings as s } from "@/lib/strings/leads-admin";
import ui from "./ui.module.css";

export const STATUS_LABEL: Record<LeadStatus, { en: string; ur: string }> = {
  new: s.statusNew,
  contacted: s.statusContacted,
  applied: s.statusApplied,
  closed: s.statusClosed,
};

export const STATUS_CLASS: Record<LeadStatus, string> = {
  new: ui.tagNew,
  contacted: ui.tagContacted,
  applied: ui.tagApplied,
  closed: ui.tagClosed,
};

export function StatusTag({ status, lang }: { status: LeadStatus; lang: Lang }) {
  return <span className={`${ui.tag} ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status][lang]}</span>;
}

export function LanguageTag({ language, lang }: { language: "en" | "ur" | null; lang: Lang }) {
  if (language === "en") return <span className={`${ui.tag} ${ui.tagEn}`}>{s.english[lang]}</span>;
  if (language === "ur") return <span className={`${ui.tag} ${ui.tagUr}`}>{s.urdu[lang]}</span>;
  return <span className={`${ui.tag} ${ui.tagNone}`}>{s.notGiven[lang]}</span>;
}
