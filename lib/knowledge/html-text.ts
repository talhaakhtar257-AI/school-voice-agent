/**
 * Readable text from a web page, without a parsing library (research R-009):
 * school sites are simple, and a dependency is not worth it. Menus, footers
 * and scripts are dropped because they repeat on every page and say nothing
 * about admissions.
 */
const DROP_BLOCKS = /<(script|style|noscript|svg|nav|footer|header|form|iframe|template)\b[^>]*>[\s\S]*?<\/\1>/gi;
const BLOCK_TAGS = /<\/?(p|div|section|article|li|ul|ol|h[1-6]|tr|td|th|table|br|hr|main|aside|blockquote|dd|dt)\b[^>]*>/gi;

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…",
};

export function htmlToText(html: string): { title: string; text: string } {
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim());
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  const text = decode(
    body
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(DROP_BLOCKS, " ")
      .replace(BLOCK_TAGS, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line !== "")
    .join("\n");
  return { title, text };
}

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : " ";
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Links on the page that stay on the same site, without #fragments. */
export function extractLinks(html: string, pageUrl: URL): URL[] {
  const links: URL[] = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)[^"']*["']/gi)) {
    try {
      const url = new URL(decode(match[1]), pageUrl);
      url.hash = "";
      if (url.host === pageUrl.host && (url.protocol === "https:" || url.protocol === "http:")) links.push(url);
    } catch {
      // A malformed href is simply skipped.
    }
  }
  return links;
}
