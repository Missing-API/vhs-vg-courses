"use cache";

import * as cheerio from "cheerio";
import slugify from "slugify";
import { fetchWithTimeout } from "./fetch-with-timeout";
import logger from "@/logging/logger";
import { withCategory, startTimer } from "@/logging/helpers";

/**
 * Parse VHS-VG search form at https://www.vhs-vg.de/kurse to extract location options.
 * Tries to also pick up the course counts shown next to the locations if present.
 * Cached for 24 hours using Next.js cache.
 */
export async function extractLocationsFromSearchForm(): Promise<
  Array<{ id: string; name: string; count?: number }>
> {
  const log = withCategory(logger, 'locationProcessing');
  const end = startTimer();

  const url = "https://www.vhs-vg.de/kurse";
  log.debug({ operation: 'fetch', url }, 'Fetching search form');
  const res = await fetchWithTimeout(url, { method: "GET" });
  const html = await res.text();
  const $ = cheerio.load(html);

  const entries: Array<{ id: string; name: string; count?: number }> = [];

  // Strategy: find inputs for katortfilter[] or labels that include that input,
  // fallback to find filter list around #kw-filter-ortvalues
  const selectorInputs = 'input[name="katortfilter[]"]';
  const inputs = $(selectorInputs);
  log.debug({ operation: 'parse', selector: selectorInputs, count: inputs.length }, 'Scanning location inputs');
  inputs.each((_, el) => {
    const $input = $(el);
    const val = ($input.attr("value") || "").trim();
    if (!val || val === "__reset__") return;

    // label may be sibling or parent
    let labelText = "";
    const id = $input.attr("id");
    if (id) {
      const labelFor = $(`label[for="${id}"]`).first().text().trim();
      if (labelFor) labelText = labelFor;
    }
    if (!labelText) {
      labelText = $input.closest("label").text().trim() || $input.parent().find("label").first().text().trim();
    }
    if (!labelText) labelText = val;

    // Clean up the label text - remove newlines and extra whitespace
    labelText = labelText.replace(/\s+/g, " ").trim();

    // extract count if in parentheses e.g. "Greifswald (123)"
    let count: number | undefined = undefined;
    const m = labelText.match(/\((\d+)\)/);
    if (m) {
      count = Number(m[1]);
      labelText = labelText.replace(/\(\d+\)/, "").trim();
    } else {
      // also look for sibling .badge or small with digits
      const badgeText = $input.closest("li,div").find(".badge, small").first().text();
      const num = Number((badgeText || "").replace(/[^0-9]/g, ""));
      if (!Number.isNaN(num) && num > 0) count = num;
    }

    entries.push({ id: slugify(labelText, { lower: true }), name: labelText, count });
  });

  // Fallback: if nothing found, try get filter values list
  if (entries.length === 0) {
    const fallbackSelector = "#kw-filter-ortvalues li label";
    log.debug({ operation: 'parse', selector: fallbackSelector }, 'Falling back to filter values list');
    $(fallbackSelector).each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim();
      if (!txt) return;
      let count: number | undefined;
      const m = txt.match(/\((\d+)\)/);
      if (m) {
        count = Number(m[1]);
      }
      const name = txt.replace(/\(\d+\)/, "").trim();
      entries.push({ id: slugify(name, { lower: true }), name, count });
    });
  }

  // De-duplicate by id
  const map = new Map<string, { id: string; name: string; count?: number }>();
  for (const e of entries) {
    if (!map.has(e.id)) map.set(e.id, e);
  }
  const result = Array.from(map.values());

  const durationMs = end();
  log.info({ operation: 'parse', locations: result.length, durationMs }, 'Extracted locations from search form');
  return result;
}
