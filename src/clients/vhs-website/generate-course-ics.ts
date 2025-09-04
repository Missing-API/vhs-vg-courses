import ical, { ICalCalendar, ICalEventStatus, ICalCategoryData } from 'ical-generator';
import type { Course } from './courses.schema';
import { addCoursePrefix } from './add-course-prefix';
import { dataToText, dataToHtml, type TextWithData } from '../../utils/data-text-mapper';

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
 * Create structured data for data-text-mapper from course details.
 */
function createTextWithData(course: Course): TextWithData {
  return {
    description: course.description || course.title, // Use description if available, otherwise title
    url: course.url || course.link,
    tags: course.tags || ['Bildung', 'Volkshochschule'],
    scopes: course.scopes || ['Region'],
    image: course.image,
  };
}

export interface GenerateCourseIcsOptions {
  timezone?: string; // default: Europe/Berlin
  calendarName?: string;
  calendarDescription?: string;
}

/**
 * Build an ICS string for a list of courses for a given location.
 * - SUMMARY: course.title
 * - DESCRIPTION: uses dataToText for plain text and dataToHtml for HTML 
 * - DTSTART: course.start (ISO8601); interpreted in Europe/Berlin by consumers
 * - LOCATION: course.location (optimized address)
 * - UID: prefixed with VHSVG-
 * - CATEGORIES: from course details tags or default values
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

    // Create structured data for both plain text and HTML descriptions
    const textWithData = createTextWithData(c);
    const plainDescription = dataToText(textWithData);
    const htmlDescription = dataToHtml(textWithData);
    
    // Extract categories from details or use defaults
    const categories = c.tags || extractCategoriesFromSummary(c.summary) || ['Bildung', 'Volkshochschule'];
    const status: ICalEventStatus = c.available === false ? ICalEventStatus.CANCELLED : ICalEventStatus.CONFIRMED;
    
    // Convert string categories to ICalCategoryData format
    const categoryData: ICalCategoryData[] = categories.map((cat: string) => ({ name: cat }));

    cal.createEvent({
      id: `VHSVG-${c.id}`,
      start,
      end: validEnd, // Include end time if available for proper duration
      summary: addCoursePrefix(c.title),
      description: { plain: plainDescription, html: htmlDescription },
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