# Development Logging Guide

This guide explains how to use the logging infrastructure when working on the VHS-VG Courses project.

## Setup

Environment variables (set in .env.local for development):

- LOG_LEVEL: debug | info | warn | error (default: info)
- LOG_FORMAT: pretty | json (default: json)
- LOG_DESTINATION: console | file (default: console)
- LOG_REQUEST_DETAILS: true | false (default: true)
- LOG_FILE_PATH: path to a log file when LOG_DESTINATION=file

Example .env.local:

```
LOG_LEVEL=debug
LOG_FORMAT=pretty
LOG_DESTINATION=console
LOG_REQUEST_DETAILS=true
```

## Categories

Use categories to group logs:

- vhsClient – network calls and HTML parsing for the VHS website
- courseProcessing – parsing/normalizing course data
- locationProcessing – extracting/enriching locations
- api – API routes
- health – health checks

## How to Log

Import the shared logger and helpers:

```
import logger from '@/logging/logger'
import { withCategory, startTimer, errorToObject } from '@/logging/helpers'
```

Create a child logger with category and optional requestId:

```
const log = withCategory(logger, 'vhsClient')
const end = startTimer()

try {
  // do work
  log.info({ operation: 'fetch', url, method: 'GET' }, 'Fetching VHS page')
  // ...
  log.info({ operation: 'fetch', url, status: 200, durationMs: end() }, 'Fetch complete')
} catch (err) {
  log.error({ operation: 'fetch', url, err: errorToObject(err) }, 'Fetch failed')
  throw err
}
```

For API handlers, generate a request-scoped logger:

```
const reqId = crypto.randomUUID()
const log = withCategory(logger, 'api').child({ requestId: reqId, route: '/api/locations' })
log.info({ method: 'GET' }, 'Request received')
// ...
log.info({ status: 200, durationMs: end() }, 'Response sent')
```

## Best Practices

- Log at info for successful high-level operations
- Log at debug for details useful when troubleshooting (selectors, counts)
- Log at warn for inconsistent states (e.g., expected vs parsed counts mismatch)
- Log errors with context and a serialized error (errorToObject)
- Redact sensitive data (headers, tokens) – helpers already do this
- Avoid logging raw HTML or large payloads

## Performance Monitoring

Use startTimer() to track durationMs for HTTP calls and parsing steps. Include counts (e.g., courses parsed) in the log event.

## Troubleshooting

- Increase LOG_LEVEL to debug when reproducing issues
- Use LOG_FORMAT=pretty locally for readability
- When needed, set LOG_DESTINATION=file and review the output file