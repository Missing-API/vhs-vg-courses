import { NextRequest, NextResponse } from "next/server";
import { getCourses, getLocations } from "@/clients/vhs-website/vhs-search.client";
import { generateCourseIcs } from "@/clients/vhs-website/generate-course-ics";
import logger from "@/logging/logger";
import { withCategory, startTimer, errorToObject } from "@/logging/helpers";

const FIFTEEN_MIN_SECONDS = 60 * 15;

function extractLocationFromPath(pathname: string): string | null {
  // matches /api/{location}/courses/ics or /api/{location}/courses/ics/
  const m = pathname.match(/^\/api\/([^\/]+)\/courses\/ics(?:\/)?$/i);
  return m?.[1] ? m[1].toLowerCase() : null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const reqId = crypto.randomUUID();
  const log = withCategory(logger, "api").child({ requestId: reqId, route: "/api/[location]/courses/ics" });
  const end = startTimer();

  const url = new URL(request.url);
  const locationId = extractLocationFromPath(url.pathname);

  log.info({ method: "GET", locationParam: locationId }, "Courses ICS request received");

  if (!locationId) {
    const durationMs = end();
    log.warn({ status: 400, durationMs }, "Invalid location parameter in path");
    return NextResponse.json(
      { status: 400, error: "Invalid location parameter" },
      { status: 400 }
    );
  }

  try {
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

    const result = await getCourses(locationId);

    const ics = await generateCourseIcs({
      location,
      courses: result.courses,
    });

    const headers = new Headers();
    headers.set("Content-Type", "text/calendar; charset=utf-8");
    headers.set("Content-Disposition", `attachment; filename="${location.id}-courses.ics"`);
    headers.set("Cache-Control", `public, max-age=${FIFTEEN_MIN_SECONDS}`);

    const durationMs = end();
    log.info({ status: 200, durationMs, locationId, count: result.count }, "Courses ICS response sent");

    return new NextResponse(ics, {
      status: 200,
      headers,
    });
  } catch (err) {
    const durationMs = end();
    log.error({ status: 500, durationMs, err: errorToObject(err) }, "Courses ICS handler error");
    const message = err instanceof Error ? err.message : "Unknown error generating ICS";
    return NextResponse.json(
      { status: 500, error: message },
      { status: 500 }
    );
  }
}