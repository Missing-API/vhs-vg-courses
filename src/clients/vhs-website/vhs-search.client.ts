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