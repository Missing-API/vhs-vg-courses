import { NextRequest, NextResponse } from "next/server";
import logger from "@/logging/logger";
import { withCategory, startTimer, errorToObject } from "@/logging/helpers";
import { getCourses, getLocations } from "@/clients/vhs-website/vhs-search.client";
import { generateCourseIcs } from "@/clients/vhs-website/generate-course-ics";

const FIFTEEN_MIN_SECONDS = 60 * 15;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ location?: string }> }
) {
  const reqId = crypto.randomUUID();
  const log = withCategory(logger, "api").child({
    requestId: reqId,
    route: "/api/[location]/courses/ics",
  });
  const end = startTimer();

  try {
    const params = await ctx.params;
    const locationId = params.location?.toLowerCase();
    if (!locationId) {
      const durationMs = end();
      log.warn({ status: 400, durationMs }, "Invalid location parameter");
      return NextResponse.json(
        { status: 400, error: "Invalid location parameter" },
        { status: 400 }
      );
    }

    const locations = await getLocations();
    const location = locations.locations.find((l) => l.id === locationId);
    if (!location) {
      const durationMs = end();
      log.warn({ status: 404, durationMs, locationId }, "Location not found");
      return NextResponse.json(
        { status: 404, error: `Location not found: ${locationId}` },
        { status: 404 }
      );
    }

    const { courses, count } = await getCourses(locationId, {
      includeDetails: true,
    });

    const ics = generateCourseIcs(locationId, courses, {
      calendarName: `VHS Vorpommern-Greifswald – ${location.name} – Kurse`,
      calendarDescription: `Kurse der Volkshochschule Vorpommern-Greifswald – Standort ${location.name}`,
      timezone: "Europe/Berlin",
    });

    const headers = new Headers();
    headers.set("Content-Type", "text/calendar; charset=utf-8");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${locationId}-courses.ics"`
    );
    headers.set("Cache-Control", `public, max-age=${FIFTEEN_MIN_SECONDS}`);

    const durationMs = end();
    log.info(
      { status: 200, durationMs, locationId, count },
      "ICS response generated"
    );

    return new NextResponse(ics, {
      status: 200,
      headers,
    });
  } catch (err) {
    const durationMs = end();
    log.error(
      { status: 500, durationMs, err: errorToObject(err) },
      "ICS handler error"
    );
    const message =
      err instanceof Error ? err.message : "Unknown error generating ICS";
    return NextResponse.json({ status: 500, error: message }, { status: 500 });
  }
}