import * as cheerio from "cheerio";

/**
 * Extract all pagination URLs from the given HTML.
 * Selector: div.kw-paginationleiste > nav > ul
 *
 * Returns an array of absolute URLs (including cHash parameter).
 * If no pagination is present, returns an empty array.
 *
 * baseHref should be the page URL used to resolve relative links (e.g., "https://www.vhs-vg.de/kurse").
 */
export function extractPaginationLinks(html: string, baseHref: string): string[] {
  const $ = cheerio.load(html);

  const container = $("div.kw-paginationleiste > nav > ul").first();
  if (!container || container.length === 0) {
    return [];
  }

  // Collect all anchor hrefs in the pagination list
  const hrefs: string[] = [];
  container.find("a.page-link, a.blaetternindex").each((_, a) => {
    const href = ($(a).attr("href") || "").trim();
    if (!href) return;
    hrefs.push(href);
  });

  // Normalize to absolute URLs and de-duplicate
  const urlSet = new Set<string>();
  for (const href of hrefs) {
    try {
      const url = new URL(href, baseHref).toString();
      urlSet.add(url);
    } catch {
      // ignore malformed links
    }
  }

  // It's possible that "next" chevron duplicates an already present page; Set handles deduplication.
  return Array.from(urlSet.values());
}