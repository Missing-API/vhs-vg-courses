const WEEKDAYS_DE = [
  "sonntag",
  "montag",
  "dienstag",
  "mittwoch",
  "donnerstag",
  "freitag",
  "samstag",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Parse German date like "Sa., 15.11.2025" or "Montag • 10.11.2025"
 */
export function parseGermanDate(dateString: string): Date {
  const s = dateString
    .normalize("NFKC")
    .trim()
    .replace(/,\s*um .*/i, "")
    .replace(/\s*•\s*/g, " ")
    .replace(/[A-Za-zäöüÄÖÜß]+\.*\s*,?\s*/u, "") // remove weekday text at the start
    .trim();

  // Now expect formats like 15.11.2025 or 10.11.2025
  const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!m) {
    // try ISO
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    throw new Error(`Unable to parse German date: ${dateString}`);
  }
  const [_, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0, 0);
  return d;
}

/**
 * Parse time range like "09:00 - 16:00 Uhr" or "17:00 - 20:15 Uhr"
 */
export function parseTimeRange(timeString: string): { start: { h: number; m: number }; end: { h: number; m: number } } {
  const s = timeString.normalize("NFKC").replace(/Uhr/gi, "").trim();
  const m = s.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) {
    throw new Error(`Unable to parse time range: ${timeString}`);
  }
  return {
    start: { h: Number(m[1]), m: Number(m[2]) },
    end: { h: Number(m[3]), m: Number(m[4]) },
  };
}

export function convertToISO8601(date: Date): string {
  return date.toISOString();
}

import type { CourseSession } from "./course-details.schema";

/**
 * Accepts texts like:
 * - "Montag • 10.11.2025 • 17:00 - 20:15 Uhr • VHS in Pasewalk • Raum 302"
 * - "Sa., 15.11.2025, um 09:00 Uhr" (may require end time from elsewhere)
 */
export function parseScheduleEntry(scheduleText: string): CourseSession {
  const parts = scheduleText
    .replace(/\s*\|\s*/g, " • ")
    .split("•")
    .map((p) => p.trim())
    .filter(Boolean);

  // Find date portion
  const datePart = parts.find((p) => /\d{1,2}\.\d{1,2}\.\d{4}/.test(p)) ?? scheduleText;
  const baseDate = parseGermanDate(datePart);

  // Find time portion
  const timePart = parts.find((p) => /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})|(um\s*\d{1,2}:\d{2}\s*Uhr)/i.test(p));

  let start = new Date(baseDate);
  let end = new Date(baseDate);
  if (timePart) {
    const rangeMatch = timePart.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
    const atTimeMatch = timePart.match(/um\s*(\d{1,2}):(\d{2})/i);

    if (rangeMatch) {
      const { start: s, end: e } = parseTimeRange(rangeMatch[0]);
      start.setHours(s.h, s.m, 0, 0);
      end.setHours(e.h, e.m, 0, 0);
    } else if (atTimeMatch) {
      start.setHours(Number(atTimeMatch[1]), Number(atTimeMatch[2]), 0, 0);
      // default end +3h if not known
      end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    }
  }

  // Extract location and room if present in parts after time
  let location = "";
  let room: string | undefined;
  const timeIndex = parts.findIndex((p) => p === timePart);
  for (let i = timeIndex + 1; i < parts.length; i++) {
    const p = parts[i];
    if (/^raum\s+/i.test(p)) {
      room = p;
    } else if (!location) {
      location = p;
    }
  }

  const yyyy = start.getUTCFullYear();
  const mm = pad(start.getUTCMonth() + 1);
  const dd = pad(start.getUTCDate());
  const dateIso = `${yyyy}-${mm}-${dd}`;

  return {
    date: dateIso,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    location,
    room,
  };
}