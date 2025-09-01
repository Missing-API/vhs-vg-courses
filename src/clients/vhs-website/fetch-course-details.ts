"use cache";

import * as cheerio from "cheerio";
import { fetchWithTimeout } from "./fetch-with-timeout";
import { CourseDetailsSchema, type CourseDetails, type CourseSession } from "./course-details.schema";
import { findCourseJsonLd } from "./parse-json-ld";
import { parseScheduleEntry, parseGermanDate } from "./parse-course-dates";

/**
 * Validates a VHS course id (observed patterns like 252P40405, 252A21003)
 */
function validateCourseId(id: string) {
  if (!/^[0-9]{3}[A-Z][0-9]{5}$/i.test(id)) {
    throw new Error(`Invalid course id format: ${id}`);
  }
}

/**
 * Build course url
 */
function buildCourseUrl(id: string) {
  return `https://www.vhs-vg.de/kurse/kurs/${encodeURIComponent(id)}`;
}

/**
 * Extract description from HTML paragraphs within course content blocks
 */
function extractDescription($: cheerio.CheerioAPI): string {
  // Heuristic: look for main content area and paragraphs
  const texts: string[] = [];
  // common content containers
  const containers = [
    ".hauptseite_mitstatus",
    "div.hauptseite_ohnestatus",
    "main",
    "#content",
    ".course-detail",
  ];
  for (const sel of containers) {
    $(sel).find("p").each((_, p) => {
      const t = $(p).text().replace(/\s+/g, " ").trim();
      if (t && t.length > 0) texts.push(t);
    });
    if (texts.length) break;
  }
  // fallback: any paragraph
  if (!texts.length) {
    $("p").each((_, p) => {
      const t = $(p).text().replace(/\s+/g, " ").trim();
      if (t && t.length > 0) texts.push(t);
    });
  }
  // filter boilerplate
  const joined = texts.join("\n");
  return joined.trim();
}

/**
 * Extract field by label from definition lists or label/value rows
 */
function extractLabeledField($: cheerio.CheerioAPI, label: string): string | undefined {
  const candidates: string[] = [];
  // dt/dd
  $("dt, th, .label").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    if (new RegExp(`^${label}\\s*:?$`, "i").test(txt)) {
      const next = $(el).next();
      const val = next.text().replace(/\s+/g, " ").trim();
      if (val) candidates.push(val);
    }
  });
  if (candidates.length) return candidates[0];
  // generic search
  const re = new RegExp(`${label}\\s*:?\\s*(.+)`, "i");
  let out: string | undefined;
  $("*").each((_, el) => {
    const t = $(el).text();
    const m = t.match(re);
    if (m) {
      out = m[1].trim();
      return false;
    }
  });
  return out;
}

/**
 * Parse detailed schedule entries exclusively from the schedule table `#kw-kurstage`.
 * We intentionally ignore any sidebar lists or other tables that may duplicate or summarise dates.
 */
function extractSchedule($: cheerio.CheerioAPI): CourseSession[] {
  const sessions: CourseSession[] = [];

  const table = $("#kw-kurstage");
  if (!table.length) {
    return sessions;
  }

  // Iterate over rows (skip header if present)
  table.find("tr").each((idx, tr) => {
    const row = $(tr);
    // Skip header rows that contain th
    if (row.find("th").length) return;

    const cells = row.find("td").toArray().map((td) => $(td).text().replace(/\s+/g, " ").trim()).filter(Boolean);
    if (!cells.length) return;

    // Join the row cells with separators so parseScheduleEntry can detect date/time/location
    const rowText = cells.join(" • ");
    if (/\d{1,2}\.\d{1,2}\.\d{4}/.test(rowText)) {
      try {
        sessions.push(parseScheduleEntry(rowText));
      } catch {
        // ignore entry parse errors for robustness
      }
    }
  });

  return sessions;
}

/**
 * Main fetcher with Next.js caching via fetchWithTimeout and directive
 */
export async function fetchCourseDetails(courseId: string): Promise<CourseDetails> {
  validateCourseId(courseId);

  const url = buildCourseUrl(courseId);
  const res = await fetchWithTimeout(url, { method: "GET" });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Title: prefer H1, fallback to JSON-LD
  const titleH1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  const jsonld = findCourseJsonLd(html);
  const title = titleH1 || jsonld?.name || "";

  // Description: from HTML paragraphs, not JSON-LD if possible
  const description = extractDescription($);

  // Start info: from JSON-LD hasCourseInstance, else labeled fields
  let startIso: string | undefined;
  let venueName: string | undefined;
  let room: string | undefined;
  let addressStr: string | undefined;

  if (jsonld && jsonld.hasCourseInstance) {
    const instances = Array.isArray(jsonld.hasCourseInstance) ? jsonld.hasCourseInstance : [jsonld.hasCourseInstance];
    const first = instances.find((i) => i?.startDate) ?? instances[0];
    if (first?.startDate) {
      const d = new Date(first.startDate);
      if (!isNaN(d.getTime())) startIso = d.toISOString();
    }
    const loc = first?.location;
    if (loc) {
      venueName = loc.name;
      const addr = loc.address;
      if (addr) {
        const addrParts = [addr.streetAddress, addr.postalCode, addr.addressLocality].filter(Boolean);
        addressStr = addrParts.join(", ");
      }
    }
  }

  if (!startIso) {
    const beginn = extractLabeledField($, "Beginn");
    if (beginn) {
      try {
        const d = parseGermanDate(beginn);
        startIso = d.toISOString();
      } catch {}
    }
  }

  // Duration and Termine
  const duration = extractLabeledField($, "Dauer") || "";
  let numberOfDates = 0;
  const termine = extractLabeledField($, "Termine");
  if (termine) {
    const m = termine.match(/(\d+)/);
    if (m) numberOfDates = Number(m[1]);
  }
  // If no explicit "Termine" field, try to infer count from the "Dauer" text e.g. "10 Termine"
  if (!numberOfDates && duration) {
    const m = duration.match(/(\d+)\s*Termine?/i);
    if (m) numberOfDates = Number(m[1]);
  }

  const schedule = extractSchedule($);

  // Infer venue/room from schedule entries if not present yet
  if (!venueName && schedule.length) venueName = schedule[0].location || undefined;
  if (!room && schedule[0]?.room) room = schedule[0].room;

  // Location aggregate
  const location = {
    name: venueName || "",
    room,
    address: addressStr || "",
  };

  const result: CourseDetails = {
    id: courseId,
    title,
    description,
    start: startIso || (schedule[0]?.startTime ?? ""),
    duration,
    numberOfDates: numberOfDates || schedule.length || 0,
    schedule,
    location,
  };

  return CourseDetailsSchema.parse(result);
}