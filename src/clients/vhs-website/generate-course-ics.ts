import ical, { ICalCalendar, ICalEventData } from "ical-generator";
import { type Course } from "./courses.schema";
import { type Location } from "./locations.schema";
import { fetchCourseDetails } from "./fetch-course-details";

/**
 * Convert simple HTML (as produced by buildSummary) to a plain text description.
 * - Replace <br> with newlines
 * - Strip remaining tags
 * - Collapse extra whitespace
 */
function htmlToText(html?: string): string {
  if (!html) return "";
  let s = html.replace(/<\s*br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/\r?\n\s*\n+/g, "\n\n"); // collapse consecutive blank lines
  s = s.replace(/[ \t]+/g, " ").trim();
  return s;
}

/**
 * Build a full location string with venue, room and address.
 */
function buildLocationString(location: { name?: string; room?: string; address?: string }): string {
  const parts = [location?.name, location?.room, location?.address].filter((x) => !!x && String(x).trim().length > 0);
  return parts.join(", ");
}

export type GenerateCourseIcsInput = {
  location: Location;
  courses: Course[];
};

const CAL_TIMEZONE = "Europe/Berlin";

/**
 * Generate an ICS calendar string for a list of courses for a specific location.
 * For each course, its detail page is fetched to obtain the full schedule; if no sessions
 * are available, a single event is created using the course start date.
 */
export async function generateCourseIcs(input: GenerateCourseIcsInput): Promise<string> {
  const { location, courses } = input;

  const cal: ICalCalendar = ical({
    name: `VHS VG Kurse — ${location.name}`,
    prodId: { company: "vhs-vg.de", product: "course-calendar", language: "DE" },
    timezone: CAL_TIMEZONE,
  });

  // Process courses in parallel; the upstream fetchCourseDetails has its own caching directive
  const detailPromises = courses.map(async (c) => {
    try {
      const details = await fetchCourseDetails(c.id);
      return { course: c, details };
    } catch {
      // On error, still include a minimal placeholder event with the basic course info
      return { course: c, details: undefined as any };
    }
  });

  const withDetails = await Promise.all(detailPromises);

  for (const { course, details } of withDetails) {
    const baseUid = `${location.id}-${course.id}`.toLowerCase();

    if (details?.schedule && details.schedule.length > 0) {
      const total = details.numberOfDates || details.schedule.length;
      details.schedule.forEach((s, idx) => {
        const start = s.startTime ? new Date(s.startTime) : (details.start ? new Date(details.start) : undefined);
        const end = s.endTime ? new Date(s.endTime) : undefined;

        if (!start || isNaN(start.getTime())) return; // skip invalid rows

        const title =
          total > 1
            ? `${details.title} (Termin ${idx + 1}/${total})`
            : details.title;

        const ev: ICalEventData = {
          start,
          end,
          summary: title,
          timezone: CAL_TIMEZONE,
          uid: `${baseUid}-${idx + 1}@vhs-vg.de`,
          description: htmlToText(details.summary || details.description || ""),
          htmlDescription: details.summary || details.description || undefined,
          location: buildLocationString({
            name: details.location?.name || s.location,
            room: details.location?.room || s.room,
            address: details.location?.address,
          }),
          url: course.detailUrl,
          categories: ["VHS Kurse", location.name],
        };

        cal.createEvent(ev);
      });
    } else {
      // Fallback: single event from the listed start date without explicit end
      const start = details?.start ? new Date(details.start) : new Date(course.start);
      if (isNaN(start.getTime())) continue;

      cal.createEvent({
        start,
        summary: details?.title || course.title,
        timezone: CAL_TIMEZONE,
        uid: `${baseUid}@vhs-vg.de`,
        description: htmlToText(details?.summary || details?.description || ""),
        htmlDescription: details?.summary || details?.description || undefined,
        location: details ? buildLocationString(details.location) : course.locationText,
        url: course.detailUrl,
        categories: ["VHS Kurse", location.name],
      });
    }
  }

  return cal.toString();
}