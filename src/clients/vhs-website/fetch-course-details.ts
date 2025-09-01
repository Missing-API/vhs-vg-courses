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
 * HTML escape for text nodes/attributes
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Simplify rich HTML into a single wrapping <div> with text and <br> for line breaks.
 * - Removes all tags/attributes
 * - Preserves line breaks for paragraphs, divs, list items and <br>
 * - Collapses duplicate/empty lines
 */
function simplifyHtmlToDiv(fragmentHtml: string): string {
  if (!fragmentHtml) return "<div></div>";

  // Convert obvious line break boundaries to \n
  let s = fragmentHtml
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
    // remove scripts/styles entirely
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, "");

  // Strip all remaining tags
  s = s.replace(/<[^>]+>/g, "");

  // Normalize whitespace and lines
  s = s.replace(/\u00a0/g, " "); // nbsp to space
  const lines = s
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);

  // Join with single <br>
  const inner = lines.map((l) => escapeHtml(l)).join("<br>");
  return `<div>${inner}</div>`;
}

/**
 * Extract description primarily from div.kw-kurs-info-text, with fallbacks.
 * Returns simplified HTML (<div> ... <br> ... </div>) as string.
 */
function extractDescription($: cheerio.CheerioAPI, jsonld?: { description?: string }): string {
  // Primary: div.kw-kurs-info-text
  const info = $("div.kw-kurs-info-text").first();
  if (info.length) {
    const raw = info.html() || "";
    return simplifyHtmlToDiv(raw);
  }

  // Secondary: JSON-LD description
  if (jsonld?.description) {
    return simplifyHtmlToDiv(jsonld.description);
  }

  // Tertiary: generic paragraphs in known containers
  const texts: string[] = [];
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
      if (t) texts.push(t);
    });
    if (texts.length) break;
  }
  if (!texts.length) {
    $("p").each((_, p) => {
      const t = $(p).text().replace(/\s+/g, " ").trim();
      if (t) texts.push(t);
    });
  }
  if (texts.length) {
    return simplifyHtmlToDiv(texts.join("\n"));
  }

  // Final: empty
  return "<div></div>";
}

/**
 * Extract field by label from definition lists or label/value rows
 */
function extractLabeledField($: cheerio.CheerioAPI, label: string): string | undefined {
  const candidates: string[] = [];
  // dt/dd
  $("dt, th, .label").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    if (new RegExp(`^${label}\\s*:?, "i").test(txt)) {
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
 * Format an ISO date to German format "Sa., 15.11.2025, um 09:00 Uhr"
 * Falls back gracefully if invalid.
 */
function formatGermanDateTime(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;

  const datePart = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(d);

  const timePart = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  }).format(d);

  return `${datePart}, um ${timePart} Uhr`;
}

/**
 * Build a summary HTML snippet combining description, start info and link.
 */
export function buildSummary(
  description: string,
  startDateIso: string,
  duration: string,
  courseDetailUrl: string
): string {
  // Pull inner content of description's outer <div> (if present)
  let descInner = "";
  if (description) {
    const $desc = cheerio.load(description);
    const inner = $desc("div").first().html() ?? $desc.root().html() ?? "";
    // We only allow text and <br> from the cleaned description; ensure no attributes remain
    // Clean any stray tags except <br>
    const cleaned = inner
      .replace(/<\s*(?!br\s*\/?)[^>]+>/gi, "")
      .replace(/<\s*br\s*\/?>/gi, "<br>")
      .replace(/(\s*<br>\s*)+/gi, "<br>")
      .trim();
    descInner = cleaned;
  }

  const startFormatted = formatGermanDateTime(startDateIso);
  const hasStart = !!startFormatted;
  const hasDuration = !!(duration && duration.trim());
  let startLine = "";

  if (hasStart && hasDuration) {
    startLine = `Der Kurs beginnt am ${escapeHtml(startFormatted!)} und hat ${escapeHtml(duration.trim())}.`;
  } else if (hasStart) {
    startLine = `Der Kurs beginnt am ${escapeHtml(startFormatted!)}.`;
  } else if (hasDuration) {
    startLine = `Der Kurs hat ${escapeHtml(duration.trim())}.`;
  } else {
    startLine = `Details zum Starttermin folgen.`;
  }

  const safeHref = escapeHtml(courseDetailUrl);

  // Assemble required structure
  const p1 = `<p>${descInner}</p>`;
  const p2 = `<p>${startLine}</p>`;
  const p3 = `<p><a href="${safeHref}">alle Kursinfos</a></p>`;

  return `<div>\n  ${p1}\n  ${p2}\n  ${p3}\n</div>`;
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

  // Description: extract from div.kw-kurs-info-text primarily, with fallbacks; simplified to <div>...</div>
  const description = extractDescription($, jsonld);

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

  const startValue = startIso || (schedule[0]?.startTime ?? "");
  const summary = buildSummary(
    description,
    startValue,
    duration || (numberOfDates ? `${numberOfDates} Termin${numberOfDates > 1 ? "e" : ""}` : ""),
    url
  );

  const result: CourseDetails = {
    id: courseId,
    title,
    description,
    start: startValue,
    duration,
    numberOfDates: numberOfDates || schedule.length || 0,
    schedule,
    location,
    summary,
  };

  return CourseDetailsSchema.parse(result);
}