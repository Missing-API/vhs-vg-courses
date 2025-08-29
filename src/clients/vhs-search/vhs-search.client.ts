import { load } from "cheerio";
import { STATIC_LOCATIONS } from "./locations.constants";

/**
 * Parse the VHS-VG search form and extract available locations.
 * This works with either:
 *  - input[type=checkbox][name="katortfilter[]"] + label
 *  - select[name="katortfilter[]"] > option
 */
export async function extractLocationsFromSearchForm(html: string) {
  const $ = load(html);

  const found: Array<{ id: string; name: string }> = [];

  // Checkbox-style filters
  $('input[name="katortfilter[]"]').each((_, el) => {
    const value = ($(el).attr("value") || "").trim();
    if (!value || value === "__reset__") return;

    // try to get associated label text
    let labelText = "";
    const id = $(el).attr("id");
    if (id) {
      const lbl = $(`label[for="${id}"]`).first();
      labelText = lbl.text().trim();
    }
    if (!labelText) {
      // fallback: parent text
      labelText = $(el).parent().text().trim();
    }
    if (!labelText) labelText = value;

    found.push({
      id: normalizeLocationId(value),
      name: labelText,
    });
  });

  // Select/option-style filters
  $('select[name="katortfilter[]"] option').each((_, el) => {
    const value = ($(el).attr("value") || "").trim();
    const text = $(el).text().trim();
    if (!value || value === "__reset__") return;

    found.push({
      id: normalizeLocationId(value),
      name: text || value,
    });
  });

  // Deduplicate by id
  const unique = new Map<string, { id: string; name: string }>();
  for (const f of found) {
    if (!unique.has(f.id)) unique.set(f.id, f);
  }

  return Array.from(unique.values());
}

/**
 * Fetch static details for a given location id.
 * For now, we rely on curated static data to ensure stability and speed.
 */
export async function fetchLocationDetails(id: string) {
  const key = normalizeLocationId(id);
  const loc = STATIC_LOCATIONS[key as keyof typeof STATIC_LOCATIONS];
  if (!loc) {
    throw new Error(`Unknown location id: ${id}`);
  }
  return loc;
}

function normalizeLocationId(value: string) {
  return value.toLowerCase().trim();
}