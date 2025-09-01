// This file now re-exports functions from separate modules for backward compatibility
<<<<<<< HEAD
export { default as slugify } from "slugify";
=======
>>>>>>> 6524168 (Fix vhs website service health check.)
export { fetchWithTimeout } from "./fetch-with-timeout";
export { extractLocationsFromSearchForm } from "./extract-locations-from-search-form";
export { extractLocationDetails } from "./extract-location-details";
export { getLocations } from "./get-locations";
<<<<<<< HEAD
// Courses
export { extractSearchFormUrl } from "./extract-search-form-url";
export { buildCourseSearchRequest, courseSearchHeaders } from "./build-course-search-request";
export { extractPaginationLinks } from "./extract-pagination-links";
export { parseCourseResults } from "./parse-course-results";
export { getCourses } from "./get-courses";
=======

// Note: slugify is imported from the 'slugify' package, not from our modules
import slugify from "slugify";
export { slugify };
>>>>>>> 6524168 (Fix vhs website service health check.)
