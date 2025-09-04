import ical, { ICalCalendar, ICalEventStatus, ICalCategoryData } from 'ical-generator';
import type { Course } from './courses.schema';
import { addCoursePrefix } from './add-course-prefix';

/**
 * Extract categories from our HTML summary.
 * We look for spans like: <span class="tag">#Bildung</span>
 * and return ["Bildung", ...].
 */
function extractCategoriesFromSummary(summaryHtml?: string): string[] {
  if (!summaryHtml) return [];
  try {
    const matches = Array.from(summaryHtml.matchAll(/<span[^>]*class=["']?tag["']?[^>]*>\s*#([^<]+)\s*<\/span>/gi));
    const cats = matches.map(m => m[1]?.trim()).filter(Boolean) as string[];
    // de-duplicate while preserving order
    const seen = new Set<string>();
    const out: string[] = [];
    for (const c of cats) {
      if (!seen.has(c)) {
        seen.add(c);
        out.push(c);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Convert the HTML summary into a plain text string.
 * - Replace <br> with newlines
 * - Strip remaining tags
 * - Collapse whitespace
 */
function htmlToPlain(summaryHtml?: string): string {
  if (!summaryHtml) return '';
  let s = summaryHtml.replace(/<\s*br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ''); // strip tags
  s = s.replace(/\u00a0/g, ' '); // nbsp to space
  s = s.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
  return s;
}

export interface GenerateCourseIcsOptions {
  timezone?: string; // default: Europe/Berlin
  calendarName?: string;
  calendarDescription?: string;
}

/**
 * Build an ICS string for a list of courses for a given location.
 * - SUMMARY: course.title
 * - DESCRIPTION: uses course.summary (html) and a plain text variant
 * - DTSTART: course.start (ISO8601); interpreted in Europe/Berlin by consumers
 * - LOCATION: course.location (optimized address)
 * - UID: prefixed with VHSVG-
 * - CATEGORIES: from summary taxonomy tags (#Bildung, #Volkshochschule)
 * - URL: course.link
 * - STATUS: CANCELLED if available === false
 */
export function generateCourseIcs(
  locationId: string,
  courses: Course[],
  opts: GenerateCourseIcsOptions = {}
): string {
  const timezone = opts.timezone ?? 'Europe/Berlin';

  const cal: ICalCalendar = ical({
    name: opts.calendarName ?? `VHS Vorpommern-Greifswald – ${locationId} – Kurse`,
    description: opts.calendarDescription ?? 'Kurse der Volkshochschule Vorpommern-Greifswald',
    timezone,
    prodId: {
      company: 'VHSVG',
      product: 'Course API',
      language: 'DE',
    },
    ttl: 60 * 15, // 15 minutes
  });

  const now = new Date();

  for (const c of courses) {
    const start = c.start ? new Date(c.start) : undefined;
    if (!start || isNaN(start.getTime())) {
      // Skip malformed dates
      continue;
    }

    // Calculate end time if available
    const end = c.end ? new Date(c.end) : undefined;
    const validEnd = end && !isNaN(end.getTime()) ? end : undefined;

    // Build description with both plain and HTML when available
    const html = c.summary || '';
    const plain = htmlToPlain(html);
    const categories = extractCategoriesFromSummary(html);
    const status: ICalEventStatus = c.available === false ? ICalEventStatus.CANCELLED : ICalEventStatus.CONFIRMED;
    
    // Convert string categories to ICalCategoryData format
    const categoryData: ICalCategoryData[] = categories.length 
      ? categories.map(cat => ({ name: cat }))
      : [{ name: 'Bildung' }, { name: 'Volkshochschule' }];

    cal.createEvent({
      id: `VHSVG-${c.id}`,
      start,
      end: validEnd, // Include end time if available for proper duration
      summary: addCoursePrefix(c.title),
      description: html ? { html, plain } : plain,
      location: c.location || undefined,
      url: c.link || undefined,
      created: now,
      lastModified: now,
      status,
      categories: categoryData,
      // Ensure dates are treated as local times in Europe/Berlin context
      // ical-generator will include TZID from calendar timezone.
      floating: false,
    });
  }

  return cal.toString();
}