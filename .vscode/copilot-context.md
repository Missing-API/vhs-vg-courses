# VHS VG Course Calendar API - GitHub Copilot Context

## Project Overview
This API provides course data from Volkshochschule (VHS) in two formats: iCalendar (iCal) for calendar integration and JSON for web applications.

The service crawls course information from https://www.vhs-vg.de/ and provides standardized ICS calendar feeds for easy integration.

## Package Manager
**IMPORTANT: This project uses pnpm as the package manager. Always use pnpm commands, not npm or yarn.**

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
**Web Scraping:** cheerio for HTML parsing  
**Testing:** Vitest for unit testing, Playwright for E2E  
**Async Operations:** async/await and Promise.all  
**Caching:** Next.js "use cache" directive and fetch cache settings  

## Architecture Pattern - Facade Design

### 1. Facade
Central control layer that orchestrates the crawling process. Provides a simple `crawl()` method and manages dependencies.

### 2. Interfaces
- **List Fetcher**: Gets course listing URLs
- **Detail Fetcher**: Retrieves individual course pages  
- **Parser**: Extracts structured data from HTML

### 3. Implementations
Concrete classes that fulfill interface contracts. Each website gets its own implementation set, ensuring modularity and easy swapping.

## Key Workflow
1. Facade receives website-specific implementations
2. Consumer calls `crawl()` method
3. List fetcher gets course URLs
4. Detail fetcher retrieves individual pages
5. Parser extracts structured data

## File Structure Context
- `/src/app/` - Next.js App Router pages and API routes
- `/src/clients/vhs-website/` - VHS website scraping client (modular functions)
- `/src/rest/` - REST API schemas and utilities
- `/tests/` - Test setup and test files
- `/docs/` - Documentation and examples

## VHS Website Scraping
The main functionality revolves around scraping https://www.vhs-vg.de/ for:
- Course locations from search forms
- Detailed location information with addresses
- Course data extraction

## Caching Strategy
- Uses Next.js "use cache" directive for function-level caching
- Fetch requests use `next: { revalidate: 86400 }` (24 hours)
- No manual cache management - handled by Next.js

## Commands to Remember
- `pnpm install` - Install dependencies
- `pnpm test` - Run tests (non-watch mode)
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run test:e2e` - Run Playwright E2E tests

## Important Notes
- Always use kebab-case for new file names
- Prefer modular functions in separate files
- Use TypeScript strictly with proper typing
- Follow Next.js 15+ patterns and conventions
- Use Next.js caching instead of manual cache management