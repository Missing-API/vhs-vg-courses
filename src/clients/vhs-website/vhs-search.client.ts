// This file now re-exports functions from separate modules for backward compatibility
export { default as slugify } from "slugify";
export { fetchWithTimeout } from "./fetch-with-timeout";
export { extractLocationsFromSearchForm } from "./extract-locations-from-search-form";
export { extractLocationDetails } from "./extract-location-details";
export { getLocations } from "./get-locations";
// Courses
export { extractSearchFormUrl } from "./extract-search-form-url";
export { buildCourseSearchRequest, courseSearchHeaders } from "./build-course-search-request";
export { extractPaginationLinks } from "./extract-pagination-links";
export { parseCourseResults } from "./parse-course-results";
export { getCourses } from "./get-courses";

// Batch processing
export { processBatches } from "./batch-processor";
export { fetchCourseDetailsBatch, warmCourseDetailsCache } from "./fetch-course-details-batch";
export { COURSE_DETAIL_CONFIG, MAX_CONCURRENT_DETAILS } from "./performance";

// Course details
export { fetchCourseDetails } from "./fetch-course-details";
export {
  CourseDetailsSchema,
  CourseSessionSchema,
  type CourseDetails,
  type CourseSession,
} from "./course-details.schema";
// Parsers
export { parseGermanDate, parseTimeRange, convertToISO8601, parseScheduleEntry } from "./parse-course-dates";
export { extractJsonLd, findCourseJsonLd } from "./parse-json-ld";
// Schemas
export {
  CourseSchema,
  CoursesResponseSchema,
  ErrorResponseSchema,
  type Course,
  type CoursesResponse,
} from "./courses.schema";
export {
  LocationSchema,
  LocationsResponseSchema,
  type Location,
  type LocationsResponse,
} from "./locations.schema";
