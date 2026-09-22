import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { extractLinks, htmlToText } from "./html-text";

export const CRAWL_MAX_PAGES = 10;
const PAGE_TIMEOUT_MS = 8000;
const PAGE_MAX_BYTES = 2 * 1024 * 1024;
const SKIP_EXTENSIONS = /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|pptx?|mp4|mp3|css|js|ico)$/i;

export type CrawledPage = { url: string; title: string; text: string };

export class CrawlRefused extends Error {}

/**
 * Read up to 10 pages of one website, starting at `start` and following links
 * on the same host, breadth first (research R-009). A page that is slow, huge
 * or not HTML is skipped; the rest still come back.
 *
 * The server must never be used to reach machines inside a private network,
 * so a host that resolves to a private or local address is refused.
 */
export async function crawlSite(start: string): Promise<CrawledPage[]> {
  let startUrl: URL;
  try {
    startUrl = new URL(start.trim());
  } catch {
    throw new CrawlRefused("invalid-url");
  }
  if (startUrl.protocol !== "https:" && startUrl.protocol !== "http:") throw new CrawlRefused("invalid-url");
  if (startUrl.username || startUrl.password) throw new CrawlRefused("invalid-url");
  await assertPublicHost(startUrl.hostname);
  startUrl.hash = "";

  const queue: URL[] = [startUrl];
  const seen = new Set<string>([startUrl.href]);
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < CRAWL_MAX_PAGES) {
    const url = queue.shift()!;
    const html = await fetchHtml(url);
    if (html === null) continue;

    const { title, text } = htmlToText(html);
    if (text.length >= 40) pages.push({ url: url.href, title: title || url.pathname, text });

    for (const link of extractLinks(html, url)) {
      if (seen.has(link.href) || SKIP_EXTENSIONS.test(link.pathname)) continue;
      seen.add(link.href);
      queue.push(link);
    }
  }
  return pages;
}

async function fetchHtml(url: URL): Promise<string | null> {
  try {
    // Redirects are followed by hand so each hop's host is checked too.
    let current = url;
    for (let hop = 0; hop < 4; hop++) {
      const res = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
        headers: { "User-Agent": "AlNoorAdmissionsKnowledgeImport/1.0", Accept: "text/html" },
      });
      if (res.status >= 300 && res.status < 400) {
        const next = res.headers.get("location");
        if (!next) return null;
        current = new URL(next, current);
        if (current.host !== url.host) return null;
        continue;
      }
      if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return null;
      const length = Number(res.headers.get("content-length") ?? 0);
      if (length > PAGE_MAX_BYTES) return null;
      const body = await res.text();
      return body.length > PAGE_MAX_BYTES ? null : body;
    }
    return null;
  } catch {
    return null; // timeout, network error: skip this page
  }
}

async function assertPublicHost(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new CrawlRefused("private");
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => [])).map((a) => a.address);
  if (addresses.length === 0) throw new CrawlRefused("unreachable");
  if (addresses.some(isPrivateAddress)) throw new CrawlRefused("private");
}

function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const v6 = ip.toLowerCase();
    return v6 === "::1" || v6 === "::" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80") || v6.startsWith("::ffff:");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
  );
}
