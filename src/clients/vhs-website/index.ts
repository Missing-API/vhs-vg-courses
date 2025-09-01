// Re-export all functions for backward compatibility
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
