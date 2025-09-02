import * as cheerio from "cheerio";
import { Course } from "./courses.schema";

/**
 * Parse a localized date/time string like "Mo. 08.09.2025, 13.00 Uhr" into ISO8601 (UTC).
 * Assumes the extracted date/time is local and returns an ISO string in UTC.
 */
function parseStartIso(text: string): string | undefined {
  // Extract DD.MM.YYYY and HH.MM patterns
  const dmy = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  const hm = text.match(/(\d{1,2})\.(\d{2})\s*Uhr/); // Match time pattern followed by "Uhr"
  if (!dmy || !hm) return undefined;

  const day = Number(dmy[1]);
  const month = Number(dmy[2]);
  const year = Number(dmy[3]);
  const hour = Number(hm[1]);
  const minute = Number(hm[2]);

  // Build UTC date to ensure deterministic output
  const iso = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0)).toISOString();
  return iso;
}

/**
 * Parse "Belegung" text like "4 von 6" and determine availability.
 * available = (total - used) > 0
 */
function parseAvailable(text: string): boolean {
  const m = text.match(/(\d+)\s*von\s*(\d+)/i);
  if (!m) return false;
  const used = Number(m[1]);
  const total = Number(m[2]);
  if (Number.isNaN(used) || Number.isNaN(total)) return false;
  return total - used > 0;
}

/**
 * Parse the course results table into structured Course objects.
 * Selector: div.kw-kursuebersicht > table
 */
export function parseCourseResults(html: string, baseHref: string): Course[] {
  const $ = cheerio.load(html);
  const table = $("div.kw-kursuebersicht > table").first();
  if (!table || table.length === 0) {
    return [];
  }

  const courses: Course[] = [];
  table.find("tbody > tr.kw-table-row").each((_, tr) => {
    const $tr = $(tr);

    // Title and detail URL
    const titleLink = $tr.find('td[headers="kue-columnheader2"] a').first();
    const title = titleLink.text().replace(/\s+/g, " ").trim();
    const relHref =
      (titleLink.attr("href") || $tr.attr("data-href") || "").trim();
    if (!title || !relHref) return;

    let detailUrl: string;
    try {
      detailUrl = new URL(relHref, baseHref).toString();
    } catch {
      // If baseHref is malformed or relHref invalid, skip row
      return;
    }

    // Raw date cell -> start ISO
    const dateCellText = $tr
      .find('td[headers="kue-columnheader3"]')
      .text()
      .replace(/\s+/g, " ")
      .replace(/\s,/, ",")
      .trim();
    const start = parseStartIso(dateCellText);
    if (!start) return;

    // Location cell text (fallback; will be replaced by details.location.address if details are fetched)
    const locationCell = $tr
      .find('td[headers="kue-columnheader4"]')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    // Belegung -> available
    const belegungText = $tr
      .find('td[headers="kue-columnheader5"]')
      .text()
      .replace(/\s+/g, " ")
      .trim();
    const available = parseAvailable(belegungText);

    // Course number (used as id when present)
    const courseNumber = $tr
      .find('td[headers="kue-columnheader6"]')
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const ampel = $tr.find(".ampelicon").first();
    const bookable = ampel.hasClass("buchbar");

    const id = courseNumber || title;

    courses.push({
      id,
      title,
      detailUrl,
      start,
      locationText: locationCell,
      address: "", // filled by optimizer in get-courses
      available,
      bookable,
    });
  });

  return courses;
}