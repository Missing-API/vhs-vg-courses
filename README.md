# VHS VG Course Calendar API

This API provides course data from Volkshochschule (VHS) in two formats: iCalendar (iCal) for calendar integration and JSON for web applications.

## Overview

The service crawls course information from https://www.vhs-vg.de/ and provides standardized ICS calendar feeds for easy integration.

## Features

- Web scraping of VHS VG course listings
- Calendar feed generation in ICS format
- RESTful API middleware
- Real-time course data synchronization

## Tech Stack

**Package Manager:** pnpm
**Framework:** Next.js with API Routes  
**API Design:** ts-rest with Zod validation  
**Hosting:** Vercel with Cron Jobs and caching  
**Language:** TypeScript  
**Data Fetching:** Native fetch API  
**HTML Parsing:** Cheerio  
**Calendar Generation:** ical-generator  
**Async Operations:** async/await and Promise.all  
**Caching:** Vercel Edge Cache and Cron Jobs  
**Testing:** Vitest for unit tests, Playwright for E2E/API tests  

## New: Course Retrieval by Location (VHS-VG)

The `vhs-website` client now supports retrieving full course lists per location, including pagination handling and default filters.

Exports (from `src/clients/vhs-website`):
- `getCourses(locationId)` – orchestrates the end-to-end flow for a location id (`anklam`, `greifswald`, `pasewalk`)
- Schemas: `CourseSchema`, `CoursesResponseSchema`
- Utilities:
  - `extractSearchFormUrl()` – resolves POST form action from `/kurse`
  - `buildCourseSearchRequest(locationName)` – builds POST body with default filters
  - `extractPaginationLinks(html, base)` – collects all page URLs incl. `cHash`
  - `parseCourseResults(html, base)` – parses the result table into structured objects

Usage example:
```ts
import { getCourses } from "@/clients/vhs-website";

const { courses, count, expectedCount, warnings } = await getCourses("anklam");
```

Notes:
- Default filters applied: exclude started courses and fully booked courses.
- Pagination pages are fetched in parallel via `Promise.all`.
- Results are de-duplicated by course number.
- If available, the parsed course count is compared against the location filter count displayed in the page.

## Architecture

Built using the Facade pattern with three core components:

### 1. Facade
Central control layer that orchestrates the crawling process. Provides a simple `crawl()` method and manages dependencies.

### 2. Interfaces
Define contracts for system components:
- **`IListFetcher`**: Retrieves course URL lists
- **`IDetailFetcher`**: Fetches individual course pages  
- **`IDataParser<T>`**: Parses raw data into structured format

### 3. Implementations
Concrete classes that fulfill interface contracts. Each website gets its own implementation set, ensuring modularity and easy swapping.

### Flow
1. Facade receives website-specific implementations
2. Consumer calls `crawl()` method
3. List fetcher gets course URLs
4. Detail fetcher retrieves individual pages
5. Parser extracts structured data