# Logging Strategy – VHS-VG Courses

This document describes the logging approach for the VHS-VG Courses service, adapted from our translation-api example. The goal is consistent, structured, and actionable logs across development, testing, and production.

## Objectives

- Enable fast debugging of scraping and API issues
- Provide machine-readable, structured logs suitable for aggregation
- Capture performance metrics to monitor scraping and API latency
- Support correlation of logs per request
- Protect sensitive data

## Logger

- Library: pino
- Service name: vhs-vg-courses
- Default level: info (configurable via environment)
- Formats:
  - json (default, production)
  - pretty (development)
- Destinations:
  - console (default)
  - file (configurable path)

## Categories

- vhsClient – VHS website client operations (fetch, parse, retries)
- courseProcessing – Course data parsing, normalization, de-duplication
- locationProcessing – Location extraction and address enrichment
- api – API endpoint operations (request, response, validation)
- health – Health checks for external dependencies

These categories appear in each log record to simplify filtering.

## Required Fields

Every log record should be structured. Common fields:

- service: vhs-vg-courses
- level: log level (info, warn, error, debug, trace)
- category: see above
- requestId: correlation id when handling an API request
- operation: optional operation name (e.g., fetch, parse, route)
- durationMs: timing of the operation, when applicable
- method, url, status: for HTTP operations

## Levels

- error – Errors causing operation failure (include stack)
- warn – Degraded behavior (retries, partial failures, mismatched counts)
- info – High-level success events (completed fetch, parsed items)
- debug – Detailed troubleshooting information (selectors, counts)
- trace – Very verbose diagnostics (disabled by default)

## Redaction

Sensitive values are redacted:
- Authorization headers, cookies
- Passwords, tokens, secrets

Avoid logging raw HTML content. For HTML parsing issues, log selectors and short snippets only.

## Correlation IDs

- For API requests, generate or propagate x-request-id and include in all related logs
- For background tasks, generate a new id per task

## Performance

- Record duration of HTTP calls and parsing steps
- Include the number of items processed (e.g., courses parsed)

## Examples

- VHS Website Client Fetch
  - category: vhsClient
  - operation: fetch
  - method: GET
  - url: https://www.vhs-vg.de/kurse
  - status: 200
  - durationMs: 132

- API Request
  - category: api
  - operation: GET /api/locations
  - requestId: 1a2b3c...
  - status: 200
  - durationMs: 28

## Error Logging

Always include context and a serialized error object:
- message
- type
- stack (server-only)
- relevant fields (url, method, selector, locationId, etc.)

## Production

- Use json format
- Aggregate logs (e.g., Vercel, CloudWatch, ELK, Loki)
- Consider log rotation/retention
- Alert on error rates or latency thresholds

## Development

- Use pretty format
- Enable debug level selectively when troubleshooting