import * as cheerio from "cheerio";
import { Location, LocationId, LocationSchema } from "./locations.schema";

/**
 * Lightweight logger helpers
 */
const log = {
  info: (...args: any[]) => console.log("[vhs-search]", ...args),
  warn: (...args: any[]) => console.warn("[vhs-search]", ...args),
  error: (...args: any[]) => console.error("[vhs-search]", ...args),
};

/**
 * Cache structures (simple in-memory, process local)
 */
type Cached&lt;T&gt; = { at: number; ttl: number; value: T };
const DAY = 24 * 60 * 60 * 1000;

let cachedSearchForm: Cached&lt;ReturnType&lt;typeof parseLocationsFromSearchForm&gt;&gt; | null =
  null;
let cachedDetails: Cached&lt;ReturnType&lt;typeof parseLocationDetails&gt;&gt; | null = null;

/**
 * Fetch a URL and return its HTML as string
 */
async function fetchHtml(url: string): Promise&lt;string&gt; {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "vhs-vg-courses/1.0 (+https://www.vhs-vg.de) scraper for public data",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

/**
 * Parse the locations and counts from the search form page HTML
 * Fallbacks try to be robust to minor markup changes.
 */
export function parseLocationsFromSearchForm(html: string): Array&lt;{
  id: LocationId;
  name: string;
  courseCount?: number;
}&gt; {
  const $ = cheerio.load(html);

  // Primary strategy: labels inside the location filter block
  // Typical selector: #kw-filter-ortvalues label
  const results: Array&lt;{ id: LocationId; name: string; courseCount?: number }&gt; =
    [];

  const pushUnique = (name: string, count?: number) =&gt; {
    const id = name.toLowerCase() as LocationId;
    if (!["anklam", "greifswald", "pasewalk"].includes(id)) return;
    if (!results.find((r) =&gt; r.id === id)) {
      results.push({ id, name, courseCount: typeof count === "number" ? count : undefined });
    }
  };

  $("#kw-filter-ortvalues label").each((_, el) =&gt; {
    const text = $(el).text().trim();
    const match = text.match(/(Anklam|Greifswald|Pasewalk)\s*\((\d+)\)/i);
    if (match) {
      pushUnique(match[1], Number(match[2]));
    } else {
      const nameOnly = text.match(/(Anklam|Greifswald|Pasewalk)/i);
      if (nameOnly) {
        pushUnique(nameOnly[1]);
      }
    }
  });

  // Fallback: search in the whole HTML text (as read_url output may be simplified)
  if (results.length &lt; 3) {
    const text = $.text();
    const nameCountRegex = /(Anklam|Greifswald|Pasewalk)\s*\((\d+)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = nameCountRegex.exec(text))) {
      pushUnique(m[1], Number(m[2]));
    }
    // Finally ensure the three known locations exist even without counts
    ["Anklam", "Greifswald", "Pasewalk"].forEach((n) =&gt; pushUnique(n));
  }

  return results;
}

/**
 * Parse the location detail page HTML for addresses
 */
export function parseLocationDetails(html: string): Array&lt;{
  id: LocationId;
  name: string;
  address: string;
}&gt; {
  const $ = cheerio.load(html);
  const items: Array&lt;{ id: LocationId; name: string; address: string }&gt; = [];

  const add = (name: string, lines: string[]) =&gt; {
    const id = name.toLowerCase() as LocationId;
    if (!["anklam", "greifswald", "pasewalk"].includes(id)) return;

    // Expect two consecutive address lines: street and "PLZ City"
    const cleaned = lines.map((l) =&gt; l.trim()).filter(Boolean);
    let address = cleaned.slice(0, 2).join(", ");
    if (!address || address.length &lt; 3) {
      // Fallback: try to find the next two non-empty text nodes after an 'Adresse:' label
      address = cleaned.join(", ");
    }

    // Normalize spacing
    address = address.replace(/\s{2,}/g, " ").trim();

    // Ensure unique
    if (!items.find((i) =&gt; i.id === id)) {
      items.push({ id, name, address });
    }
  };

  // Strategy: Find headings like "Außenstelle:  Anklam"
  $("h2, h3").each((_, el) =&gt; {
    const heading = $(el).text().trim();
    const match = heading.match(/Außenstelle:\s*(Anklam|Greifswald|Pasewalk)/i);
    if (match) {
      const name = match[1];

      // Find the address section near this heading
      // Common structure: a following text block that contains "Adresse:" and two lines
      const container = $(el).parent();
      let addressLines: string[] = [];

      // Look for a nearby element containing the word "Adresse:"
      const addrAnchor =
        container.find(":contains('Adresse')").first().length &gt; 0
          ? container.find(":contains('Adresse')").first()
          : $(el).nextAll(":contains('Adresse')").first();

      if (addrAnchor &amp;&amp; addrAnchor.length &gt; 0) {
        // Collect subsequent text nodes/elements lines
        const texts: string[] = [];
        addrAnchor
          .nextAll()
          .slice(0, 4)
          .each((_, n) =&gt; {
            const t = $(n).text().trim();
            if (t) texts.push(t);
          });

        // The read_url output has blank lines between street and city; try to split by blank lines too
        if (texts.length === 0) {
          const raw = container.text();
          const after = raw.split(/Adresse:/i)[1] || "";
          const parts = after.split(/\n+/).map((s) =&gt; s.trim()).filter(Boolean);
          addressLines = parts.slice(0, 2);
        } else {
          addressLines = texts.slice(0, 2);
        }
      }

      add(name, addressLines);
    }
  });

  // Fallback using plain text when DOM selection fails
  const plain = $.text();
  ["Anklam", "Greifswald", "Pasewalk"].forEach((name) =&gt; {
    if (!items.find((i) =&gt; i.name === name)) {
      // Find "Außenstelle:  Name" then capture next 2 non-empty lines
      const pattern = new RegExp(
        `Außenstelle:\\s*${name}[\\s\\S]*?Adresse:\\s*([\\s\\S]*?)\\n\\n`,
        "i"
      );
      const m = plain.match(pattern);
      if (m) {
        const lines = m[1]
          .split(/\n+/)
          .map((s) =&gt; s.trim())
          .filter(Boolean)
          .slice(0, 2);
        add(name, lines);
      }
    }
  });

  return items;
}

/**
 * Fetch and extract locations from the search form page.
 * Caches results for 1 day.
 */
export async function extractLocationsFromSearchForm(): Promise&lt;
  Array&lt;{ id: LocationId; name: string; courseCount?: number }&gt;
&gt; {
  const now = Date.now();
  if (cachedSearchForm &amp;&amp; now - cachedSearchForm.at &lt; cachedSearchForm.ttl) {
    return cachedSearchForm.value;
  }

  const url = "https://www.vhs-vg.de/kurse";
  log.info("Fetching search form:", url);
  const html = await fetchHtml(url);
  const parsed = parseLocationsFromSearchForm(html);

  cachedSearchForm = { at: now, ttl: DAY, value: parsed };
  return parsed;
}

/**
 * Fetch and extract location details (addresses) from the overview page.
 * Caches results for 1 day.
 */
export async function extractLocationDetails(): Promise&lt;
  Array&lt;{ id: LocationId; name: string; address: string }&gt;
&gt; {
  const now = Date.now();
  if (cachedDetails &amp;&amp; now - cachedDetails.at &lt; cachedDetails.ttl) {
    return cachedDetails.value;
  }

  const url = "https://www.vhs-vg.de/ihre-vhs/aussenstellenuebersicht";
  log.info("Fetching location details:", url);
  const html = await fetchHtml(url);
  const parsed = parseLocationDetails(html);

  cachedDetails = { at: now, ttl: DAY, value: parsed };
  return parsed;
}

/**
 * Combine search-form locations and details into a final list
 */
export async function getLocations(): Promise&lt;Location[]&gt; {
  try {
    const [options, details] = await Promise.all([
      extractLocationsFromSearchForm(),
      extractLocationDetails(),
    ]);

    const byId = new Map&lt;LocationId, Partial&lt;Location&gt;&gt;();
    options.forEach((o) =&gt; {
      byId.set(o.id, { id: o.id, name: o.name, courseCount: o.courseCount });
    });

    details.forEach((d) =&gt; {
      const existing = byId.get(d.id) || { id: d.id, name: d.name };
      byId.set(d.id, { ...existing, address: d.address, name: d.name });
    });

    const combined: Location[] = [];
    for (const v of byId.values()) {
      // Validate using Zod
      const loc = LocationSchema.parse({
        id: v.id,
        name: v.name,
        address: v.address || "",
        courseCount: v.courseCount,
      });
      combined.push(loc);
    }

    // Ensure consistent ordering
    combined.sort((a, b) =&gt; a.name.localeCompare(b.name));

    return combined;
  } catch (error) {
    log.error(error as object, "Failed to get locations");
    throw error;
  }
}