import { OFFICE_PHONE_DISPLAY } from "@/lib/office";

/**
 * The two summary emails (FR-022, FR-023). Every value that came from a call
 * or a lead is escaped before it goes into HTML. The parent email never says
 * the admission is confirmed and never mentions a discount (constitution II).
 */

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const shell = (body: string) => `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#10201b">
<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e9e6;border-radius:14px;overflow:hidden">
<div style="background:#0b3f33;color:#fff;padding:16px 22px;font-weight:bold;font-size:17px">Al-Noor Public School · Admissions</div>
<div style="padding:22px;font-size:15px;line-height:1.6">${body}</div></div></body></html>`;

export type EnquiryForEmail = {
  parentName: string | null;
  phone: string | null;
  studentName: string | null;
  classWanted: string | null;
  email: string | null;
  summary: string;
  leadUrl: string;
};

export function schoolEnquiryEmail(e: EnquiryForEmail) {
  const rows: [string, string | null][] = [
    ["Parent", e.parentName],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Child", e.studentName],
    ["Class wanted", e.classWanted],
  ];
  const table = rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6e7f78">${k}</td><td style="padding:4px 0"><b>${esc(v ?? "—")}</b></td></tr>`)
    .join("");
  const subject = `New admission enquiry${e.classWanted ? ` — ${e.classWanted}` : ""}${e.parentName ? ` — ${e.parentName}` : ""}`;
  const html = shell(`<p style="margin:0 0 12px">A parent spoke to the admissions assistant.</p>
<table style="border-collapse:collapse;margin-bottom:14px">${table}</table>
<p style="margin:0 0 6px;font-weight:bold">Summary</p>
<p style="margin:0 0 18px" dir="auto">${esc(e.summary)}</p>
<a href="${esc(e.leadUrl)}" style="display:inline-block;background:#0f5c4a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:bold">Open the lead</a>`);
  const text = `A parent spoke to the admissions assistant.\n\n${rows.map(([k, v]) => `${k}: ${v ?? "—"}`).join("\n")}\n\nSummary:\n${e.summary}\n\nOpen the lead: ${e.leadUrl}`;
  return { subject: subject.slice(0, 180), html, text };
}

export function parentSummaryEmail(summary: string, officeHours: string | null) {
  const hoursEn = officeHours ? ` (${esc(officeHours)})` : "";
  const html = shell(`<p style="margin:0 0 12px">Thank you for speaking to Al-Noor Public School's admissions assistant. Here is a summary of your call:</p>
<p style="margin:0 0 14px;padding:12px 14px;background:#e9f6f1;border-radius:10px" dir="auto">${esc(summary)}</p>
<p style="margin:0 0 12px"><b>Next step:</b> the school office will contact you. You can also call the office on <b>${OFFICE_PHONE_DISPLAY}</b>${hoursEn}.</p>
<p style="margin:0 0 20px;color:#6e7f78;font-size:13px">This email is a summary of an enquiry. It is not an admission confirmation — only the school office confirms admissions.</p>
<div dir="rtl" style="text-align:right;border-top:1px solid #e4e9e6;padding-top:16px">
<p style="margin:0 0 12px">النور پبلک اسکول کے داخلہ اسسٹنٹ سے بات کرنے کا شکریہ۔ اوپر آپ کی کال کا خلاصہ ہے۔</p>
<p style="margin:0 0 12px"><b>اگلا قدم:</b> اسکول کا دفتر آپ سے رابطہ کرے گا۔ آپ دفتر کو اس نمبر پر بھی کال کر سکتے ہیں: <b dir="ltr">${OFFICE_PHONE_DISPLAY}</b></p>
<p style="margin:0;color:#6e7f78;font-size:13px">یہ ای میل صرف آپ کی معلومات کا خلاصہ ہے، داخلے کی تصدیق نہیں۔ داخلے کی تصدیق صرف اسکول کا دفتر کرتا ہے۔</p>
</div>`);
  const text = `Thank you for speaking to Al-Noor Public School's admissions assistant.\n\nSummary of your call:\n${summary}\n\nNext step: the school office will contact you. Office phone: ${OFFICE_PHONE_DISPLAY}${officeHours ? ` (${officeHours})` : ""}.\n\nThis email is not an admission confirmation — only the school office confirms admissions.\n\n—\n\nالنور پبلک اسکول کے داخلہ اسسٹنٹ سے بات کرنے کا شکریہ۔ اسکول کا دفتر آپ سے رابطہ کرے گا۔ دفتر کا نمبر: ${OFFICE_PHONE_DISPLAY}\nیہ ای میل داخلے کی تصدیق نہیں۔`;
  return { subject: "Your call with Al-Noor Public School admissions — شکریہ", html, text };
}
