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
**Logging:** pino (structured logs with categories)  

## Logging

- Structured logger using pino with categories for:
  - vhsClient (HTTP + HTML parsing)
  - courseProcessing
  - locationProcessing
  - api
  - health
- Configurable via environment:
  - LOG_LEVEL: debug | info | warn | error (default: info)
  - LOG_FORMAT: json | pretty (default: json)
  - LOG_DESTINATION: console | file (default: console)
  - LOG_REQUEST_DETAILS: true | false (default: true)
  - LOG_FILE_PATH: file path when LOG_DESTINATION=file
- See docs/logging/logging-strategy.md and docs/logging/development-guide.md

## Configuration

The application can be configured via environment variables. See `.env.example` for all available options:

### Logging Configuration

- `LOG_LEVEL`: Logging level (debug | info | warn | error, default: info)
- `LOG_FORMAT`: Log output format (json | pretty, default: json)
- `LOG_DESTINATION`: Log output destination (console | file, default: console)
- `LOG_REQUEST_DETAILS`: Include request details in logs (true | false, default: true)
- `LOG_FILE_PATH`: File path when LOG_DESTINATION=file

### VHS Website Client Configuration

- `VHS_REQUEST_TIMEOUT`: HTTP request timeout in milliseconds (default: 5000)
- `VHS_CACHE_WARMING_ENABLED`: Enable cache warming (true | false, default: true)
- `VHS_HEALTH_TIMEOUT_MS`: Health check timeout in milliseconds (default: 8000)
- `VHS_SESSION_TIMEOUT`: Session timeout in milliseconds (default: 900000)
- `VHS_COOKIE_DEBUG`: Enable cookie debugging (true | false, default: false)
- `VHS_SESSION_FALLBACK`: Enable session fallback (true | false, default: false)

### HTTP Caching Configuration

- `HTTP_CACHE_DURATION_SECONDS`: Cache duration for API responses in seconds (default: 86400 = 1 day)
  - Sets `max-age` and `s-maxage` to the configured duration
  - Automatically calculates `stale-while-revalidate` (max 300s, ~0.35% of cache duration)
  - Example header: `Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=300`

### Runtime Configuration

- `NODE_ENV`: Node.js environment (development | production, default: development)

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