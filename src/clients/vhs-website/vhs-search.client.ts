import * as cheerio from "cheerio";
import { Location, LocationsResponse } from "./locations.schema";

/**
 * Simple in-memory caches with TTL
 */
type CacheEntry&lt;T&gt; = { value: T; ts: number };
const DAY_MS = 24 * 60 * 60 * 1000;

let searchFormLocationsCache: CacheEntry&lt;
  Array&lt;{ id: string; name: string; count?: number }&gt;
&gt; | null = null;

let locationDetailsCache: CacheEntry&lt;
  Record&lt;string, { address?: string }&gt;
&gt; | null = null;

/**
 * Slugify helper for location ids
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Fetch helper with timeout and basic error surface
 */
async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() =&gt; controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      const body = await res.text().catch(() =&gt; "");
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} ${body ? "- " + body.slice(0, 200) : ""}`);
    }
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Parse VHS-VG search form at https://www.vhs-vg.de/kurse to extract location options.
 * Tries to also pick up the course counts shown next to the locations if present.
 * Cached for 1 day.
 */
export async function extractLocationsFromSearchForm(): Promise&lt;
  Array&lt;{ id: string; name: string; count?: number }&gt;
&gt; {
  if (searchFormLocationsCache &amp;&amp; Date.now() - searchFormLocationsCache.ts &lt; DAY_MS) {
    return searchFormLocationsCache.value;
  }

  const url = "https://www.vhs-vg.de/kurse";
  const res = await fetchWithTimeout(url, { method: "GET" });
  const html = await res.text();
  const $ = cheerio.load(html);

  const entries: Array&lt;{ id: string; name: string; count?: number }&gt; = [];

  // Strategy: find inputs for katortfilter[] or labels that include that input,
  // fallback to find filter list around #kw-filter-ortvalues
  const selectorInputs = 'input[name="katortfilter[]"]';
  $(selectorInputs).each((_, el) =&gt; {
    const $input = $(el);
    const val = ($input.attr("value") || "").trim();
    if (!val || val === "__reset__") return;

    // label may be sibling or parent
    let labelText = "";
    const id = $input.attr("id");
    if (id) {
      const labelFor = $(`label[for="${id}"]`).first().text();
      if (labelFor) labelText = labelFor;
    }
    if (!labelText) {
      labelText = $input.closest("label").text() || $input.parent().find("label").first().text();
    }
    if (!labelText) labelText = val;

    // extract count if in parentheses e.g. "Greifswald (123)"
    let count: number | undefined = undefined;
    const m = labelText.match(/\\((\\d+)\\)/);
    if (m) {
      count = Number(m[1]);
      labelText = labelText.replace(/\\(\\d+\\)/, "").trim();
    } else {
      // also look for sibling .badge or small with digits
      const badgeText = $input.closest("li,div").find(".badge, small").first().text();
      const num = Number((badgeText || "").replace(/[^0-9]/g, ""));
      if (!Number.isNaN(num) &amp;&amp; num &gt; 0) count = num;
    }

    entries.push({ id: slugify(labelText), name: labelText, count });
  });

  // Fallback: if nothing found, try get filter values list
  if (entries.length === 0) {
    $("#kw-filter-ortvalues li label").each((_, el) =&gt; {
      const txt = $(el).text().trim();
      if (!txt) return;
      let count: number | undefined;
      const m = txt.match(/\\((\\d+)\\)/);
      if (m) {
        count = Number(m[1]);
      }
      const name = txt.replace(/\\(\\d+\\)/, "").trim();
      entries.push({ id: slugify(name), name, count });
    });
  }

  // De-duplicate by id
  const map = new Map&lt;string, { id: string; name: string; count?: number }&gt;();
  for (const e of entries) {
    if (!map.has(e.id)) map.set(e.id, e);
  }
  const result = Array.from(map.values());

  searchFormLocationsCache = { value: result, ts: Date.now() };
  return result;
}

/**
 * Get detailed information for each location from
 * https://www.vhs-vg.de/ihre-vhs/aussenstellenuebersicht
 * within 'div.hauptseite_ohnestatus'. Cached for 1 day.
 */
export async function extractLocationDetails(): Promise&lt;Record&lt;string, { address?: string }&gt;&gt; {
  if (locationDetailsCache &amp;&amp; Date.now() - locationDetailsCache.ts &lt; DAY_MS) {
    return locationDetailsCache.value;
  }

  const url = "https://www.vhs-vg.de/ihre-vhs/aussenstellenuebersicht";
  const res = await fetchWithTimeout(url, { method: "GET" });
  const html = await res.text();
  const $ = cheerio.load(html);

  const container = $("div.hauptseite_ohnestatus");
  const details: Record&lt;string, { address?: string }&gt; = {};

  // Heuristic: look for blocks that contain a city name in a heading and an address in paragraphs/lists
  container.find("h1,h2,h3,h4,h5").each((_, h) =&gt; {
    const heading = $(h).text().trim();
    if (!heading) return;
    const id = slugify(heading.split(/[–|-]/)[0].trim());
    // collect following siblings until next heading
    let address = "";
    let el = $(h).next();
    const chunks: string[] = [];
    let steps = 0;
    while (el.length &gt; 0 &amp;&amp; steps &lt; 10 &amp;&amp; !/^H[1-6]$/.test(el[0].tagName?.toUpperCase() || "")) {
      const text = el.text().replace(/\\s+/g, " ").trim();
      if (text) chunks.push(text);
      el = el.next();
      steps++;
    }
    if (chunks.length) {
      // find first chunk that looks like address (contains digits and city)
      const addrChunk = chunks.find((c) =&gt; /\\d{4,5}\\s+\\p{L}+/u.test(c)) || chunks[0];
      address = addrChunk;
    }
    if (id) {
      details[id] = { address };
    }
  });

  locationDetailsCache = { value: details, ts: Date.now() };
  return details;
}

/**
 * Public wrapper combining locations from the search form and enriching with address details.
 */
export async function getLocations(): Promise&lt;LocationsResponse&gt; {
  const [formLocations, detailMap] = await Promise.all([
    extractLocationsFromSearchForm(),
    extractLocationDetails(),
  ]);

  const locations: Location[] = formLocations.map((loc) =&gt; {
    const detail = detailMap[loc.id] || {};
    return {
      id: loc.id,
      name: loc.name,
      address: detail.address,
    };
  });

  // Attempt to compute totalCourses from counts if available
  const counts = formLocations.map((l) =&gt; l.count).filter((n): n is number =&gt; typeof n === "number");
  const totalCourses = counts.length &gt; 0 ? counts.reduce((a, b) =&gt; a + b, 0) : undefined;

  return {
    locations,
    totalLocations: locations.length,
    totalCourses,
    lastUpdated: new Date().toISOString(),
  };
}