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