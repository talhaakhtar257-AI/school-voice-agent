/**
 * The emails the system sends (feature 010, redesigned in 011). Every value
 * that came from a call or a lead is escaped before it goes into HTML. The
 * parent email never says the admission is confirmed and never mentions a
 * discount (constitution II).
 */

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const shell = (body: string) => `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#10201b">
<div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e4e9e6;border-radius:14px;overflow:hidden">
<div style="background:#0b3f33;color:#fff;padding:16px 22px;font-weight:bold;font-size:17px">Al-Noor Public School · Admissions</div>
<div style="padding:22px;font-size:15px;line-height:1.6">${body}</div></div></body></html>`;

export type EnquiryForEmail = {
  parentName: string | null;
  phone: string | null;
  studentName: string | null;
  classWanted: string | null;
  studentAge: number | null;
  email: string | null;
  summary: string;
  transcript: { role: "agent" | "user"; content: string }[];
  leadUrl: string;
};

/**
 * To the school: who called, the summary, and the whole conversation, so the
 * office can see exactly what was said before calling back.
 */
export function schoolEnquiryEmail(e: EnquiryForEmail) {
  const rows: [string, string | null][] = [
    ["Parent", e.parentName],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Child", e.studentName],
    ["Class wanted", e.classWanted],
    ["Age", e.studentAge === null ? null : `${e.studentAge} years`],
  ];
  const table = rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6e7f78">${k}</td><td style="padding:4px 0"><b>${esc(v ?? "—")}</b></td></tr>`)
    .join("");
  const turns = e.transcript
    .map(
      (t) =>
        `<p style="margin:0 0 8px" dir="auto"><b style="color:${t.role === "agent" ? "#0f5c4a" : "#a86e00"}">${
          t.role === "agent" ? "Assistant" : "Parent"
        }:</b> ${esc(t.content)}</p>`,
    )
    .join("");
  const subject = `New admission enquiry${e.classWanted ? ` — ${e.classWanted}` : ""}${e.parentName ? ` — ${e.parentName}` : ""}`;
  const html = shell(`<p style="margin:0 0 12px">A parent spoke to the admissions assistant.</p>
<table style="border-collapse:collapse;margin-bottom:14px">${table}</table>
<p style="margin:0 0 6px;font-weight:bold">Summary</p>
<p style="margin:0 0 18px" dir="auto">${esc(e.summary)}</p>
<a href="${esc(e.leadUrl)}" style="display:inline-block;background:#0f5c4a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:bold">Open the lead</a>
${turns ? `<p style="margin:22px 0 8px;font-weight:bold">Full conversation</p><div style="padding:12px 14px;background:#f4f7f5;border-radius:10px;font-size:14px">${turns}</div>` : ""}`);
  const text = `A parent spoke to the admissions assistant.\n\n${rows.map(([k, v]) => `${k}: ${v ?? "—"}`).join("\n")}\n\nSummary:\n${e.summary}\n\nOpen the lead: ${e.leadUrl}\n\nFull conversation:\n${e.transcript
    .map((t) => `${t.role === "agent" ? "Assistant" : "Parent"}: ${t.content}`)
    .join("\n")}`;
  return { subject: subject.slice(0, 180), html, text };
}

/**
 * To the parent: the details they asked for, built from the school's
 * published content — not a description of the call.
 */
export function parentDetailsEmail(name: string | null, pack: { html: string; text: string }) {
  const greetEn = name ? `Dear ${esc(name)},` : "Dear parent,";
  const greetUr = name ? `محترم ${esc(name)}،` : "محترم والدین،";
  const html = shell(`<p style="margin:0 0 8px">${greetEn}</p>
<p style="margin:0 0 4px">Thank you for your interest in Al-Noor Public School. Here are the admission details you asked about.</p>
<p style="margin:0 0 4px" dir="rtl">${greetUr} النور پبلک اسکول میں دلچسپی کا شکریہ۔ آپ کی مطلوبہ داخلے کی معلومات یہ ہیں۔</p>
${pack.html}
<p style="margin:20px 0 0"><b>Next step:</b> the admissions office will contact you soon.</p>
<p style="margin:0" dir="rtl"><b>اگلا قدم:</b> داخلہ دفتر جلد آپ سے رابطہ کرے گا۔</p>
<p style="margin:18px 0 0;color:#6e7f78;font-size:13px">This email is information only. It is not an admission confirmation — only the school office confirms admissions.</p>
<p style="margin:0;color:#6e7f78;font-size:13px" dir="rtl">یہ ای میل صرف معلومات کے لیے ہے، داخلے کی تصدیق نہیں۔ داخلے کی تصدیق صرف اسکول کا دفتر کرتا ہے۔</p>`);
  const text = `${name ? `Dear ${name},` : "Dear parent,"}\n\nThank you for your interest in Al-Noor Public School. Here are the admission details you asked about.\n\n${pack.text}\n\nNext step: the admissions office will contact you soon.\n\nThis email is information only. It is not an admission confirmation.`;
  return { subject: "Al-Noor Public School — your admission details / داخلے کی معلومات", html, text };
}
