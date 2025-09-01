// This file now re-exports functions from separate modules for backward compatibility
export {
  slugify,
  fetchWithTimeout,
  extractLocationsFromSearchForm,
  extractLocationDetails,
  getLocations,
  // Courses
  extractSearchFormUrl,
  buildCourseSearchRequest,
  courseSearchHeaders,
  extractPaginationLinks,
  parseCourseResults,
  getCourses,
} from "./index";