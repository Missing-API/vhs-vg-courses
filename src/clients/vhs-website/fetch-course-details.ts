import * as cheerio from "cheerio";
import { fetchWithTimeout } from "./fetch-with-timeout";
import { CourseDetailsSchema, type CourseDetails, type CourseSession } from "./course-details.schema";
import { findCourseJsonLd } from "./parse-json-ld";
import { parseScheduleEntry, parseGermanDate } from "./parse-course-dates";
import { optimizeLocationAddress } from "./optimize-location-address";
import { addCoursePrefix } from "./add-course-prefix";
import { htmlToText } from "../../utils/data-text-mapper";

/**
 * Validates a VHS course id - accepts any non-empty string with reasonable characters
 */
function validateCourseId(id: string) {
  // Allow any non-empty string that contains alphanumeric characters
  // This covers patterns like: 252P40405, 252G404904, 252G50302D, 252G10505T, etc.
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new Error(`Invalid course id format: ${id}`);
  }
  
  // Basic sanity check - should contain at least some alphanumeric characters
  if (!/[a-zA-Z0-9]/.test(id)) {
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
 * Extract text content from a cheerio element while preserving line breaks.
 * Returns plain text string.
 */
function simplifyContentToText(element: cheerio.Cheerio<any>): string {
  // Remove hidden elements first
  const cleanElement = element.clone();
  cleanElement.find('[style*="display:none"], [style*="display: none"]').remove();
  cleanElement.find('script, style').remove();
  
  const textParts: string[] = [];
  
  // Extract text from different types of elements
  cleanElement.find('p, div, li').each((_, el) => {
    const $el = cleanElement.find(el).first();
    const text = $el.text().trim();
    if (text) {
      textParts.push(text);
    }
  });
  
  // If no structured content found, get the overall text
  if (textParts.length === 0) {
    const fullText = cleanElement.text().trim();
    if (fullText) {
      textParts.push(fullText);
    }
  }
  
  return textParts.join('\n');
}

/**
 * Extract description primarily from div.kw-kurs-info-text, with fallbacks.
 * Returns plain text string.
 */
function extractDescription($: cheerio.CheerioAPI, jsonld?: { description?: string }): string {
  // Primary: div.kw-kurs-info-text
  const info = $("div.kw-kurs-info-text").first();
  if (info.length) {
    // Use text extraction to get plain text
    return simplifyContentToText(info);
  }

  // Secondary: JSON-LD description
  if (jsonld?.description) {
    return htmlToText(jsonld.description);
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
    return htmlToText(texts.join("\n"));
  }

  // Final: empty
  return "";
}

/**
 * Extract field by label from definition lists or label/value rows
 */
function extractLabeledField($: cheerio.CheerioAPI, label: string): string | undefined {
  const candidates: string[] = [];
  // dt/dd
  $("dt, th, .label").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    if (new RegExp(`^${label}\\s*:?`, "i").test(txt)) {
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

  // Iterate over rows (skip header-only rows)
  table.find("tr").each((idx, tr) => {
    const row = $(tr);
    
    // Skip header-only rows (rows that only contain th elements and no data)
    const thElements = row.find("th");
    const tdElements = row.find("td");
    
    // If this is a pure header row (only th, no td), skip it
    if (thElements.length > 0 && tdElements.length === 0) {
      return;
    }

    // Extract text from td elements (data cells)
    const cells = tdElements.toArray().map((td) => $(td).text().replace(/\s+/g, " ").trim()).filter(Boolean);
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
 * Main fetcher with Next.js caching via fetchWithTimeout and directive
 */
export async function fetchCourseDetails(
  courseId: string
): Promise<CourseDetails> {
  "use cache";
  validateCourseId(courseId);

  const url = buildCourseUrl(courseId);
  const res = await fetchWithTimeout(url, { method: "GET" });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Title: prefer H1, fallback to JSON-LD
  const titleH1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  const jsonld = findCourseJsonLd(html);
  const title = addCoursePrefix(titleH1 || jsonld?.name || "");

  // Description: extract from div.kw-kurs-info-text primarily, with fallbacks; simplified to <div>...</div>
  const description = extractDescription($, jsonld);

  // Start info: collect from multiple sources and prefer the one with explicit time
  let startFromJsonLd: string | undefined;
  let startFromLabel: string | undefined;
  let venueName: string | undefined;
  let room: string | undefined;
  let addressStr: string | undefined;

  if (jsonld && jsonld.hasCourseInstance) {
    const instances = Array.isArray(jsonld.hasCourseInstance) ? jsonld.hasCourseInstance : [jsonld.hasCourseInstance];
    const first = instances.find((i) => i?.startDate) ?? instances[0];
    if (first?.startDate) {
      const d = new Date(first.startDate);
      if (!isNaN(d.getTime())) startFromJsonLd = d.toISOString();
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

  // Also parse labeled "Beginn" which often includes local time like "um 16:00 Uhr"
  const beginn = extractLabeledField($, "Beginn");
  if (beginn) {
    try {
      const d = parseGermanDate(beginn);
      startFromLabel = d.toISOString();
    } catch {}
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
  if (!venueName && schedule.length) venueName = undefined;
  // Note: room is no longer part of CourseSession, so we don't try to extract it from schedule

  // Location aggregate
  let addressOptimized = addressStr || "";
  if (!addressOptimized) {
    const rawLoc = venueName || "";
    addressOptimized = optimizeLocationAddress(rawLoc);
  }
  const location = {
    name: venueName || "",
    room,
    address: addressOptimized || "",
  };

  // Prefer schedule start (has explicit time), then label "Beginn", then JSON-LD (may be date-only)
  const startValue =
    (schedule[0]?.start && schedule[0].start) ||
    startFromLabel ||
    startFromJsonLd ||
    new Date().toISOString(); // Fallback to current time if no start date found

  // Calculate end datetime from schedule duration if available
  let endValue: string | undefined;
  if (startValue && schedule[0]?.start && schedule[0]?.end) {
    try {
      const startDate = new Date(startValue);
      const sessionStart = new Date(schedule[0].start);
      const sessionEnd = new Date(schedule[0].end);
      
      if (!isNaN(startDate.getTime()) && !isNaN(sessionStart.getTime()) && !isNaN(sessionEnd.getTime())) {
        // Calculate duration in minutes from first schedule entry
        const durationMs = sessionEnd.getTime() - sessionStart.getTime();
        
        // Add duration to the course start time
        const endDate = new Date(startDate.getTime() + durationMs);
        endValue = endDate.toISOString();
      }
    } catch {
      // Ignore calculation errors, endValue remains undefined
    }
  }

  // Determine bookable status from detail page indicators (e.g., .ampelicon.buchbar)
  const isBookable = $(".ampelicon.buchbar").length > 0;

  // Build enhanced description with timing and booking information
  let enhancedDescription = description;
  
  // Add timing information to description if available
  if (startValue || duration) {
    const startFormatted = startValue ? formatGermanDateTime(startValue) : null;
    const hasStart = !!startFormatted;
    const hasDuration = !!(duration && duration.trim());
    let timingInfo = "";

    if (hasStart && hasDuration) {
      timingInfo = `Der Kurs beginnt am ${startFormatted!} und hat ${duration.trim()}.`;
    } else if (hasStart) {
      timingInfo = `Der Kurs beginnt am ${startFormatted!}.`;
    } else if (hasDuration) {
      timingInfo = `Der Kurs hat ${duration.trim()}.`;
    }

    if (timingInfo) {
      enhancedDescription = enhancedDescription ? `${enhancedDescription}\n\n${timingInfo}` : timingInfo;
    }
  }

  // Add bookable information
  if (isBookable) {
    const bookableInfo = "Dieser Kurs ist online buchbar.";
    enhancedDescription = enhancedDescription ? `${enhancedDescription}\n\n${bookableInfo}` : bookableInfo;
  }

  const result: CourseDetails = {
    id: courseId,
    title,
    link: url,
    start: startValue,
    end: endValue,
    available: true, // Assume available if we can fetch details
    bookable: isBookable,
    description: enhancedDescription,
    url: url,
    tags: ["Bildung", "Volkshochschule"],
    scopes: ["Region"],
    duration,
    numberOfDates: numberOfDates || schedule.length || 0,
    schedule,
    location,
  };

  return CourseDetailsSchema.parse(result);
}