# REST API Structure and Endpoints

## Overview

This document defines the REST API structure for the VHS-VG Course Calendar API. The API provides endpoints for retrieving location information and course data in a structured, cacheable format.

## Base Configuration

- **Base URL**: `http://localhost:9200/api` (development)
- **Content-Type**: `application/json`
- **API Version**: v1 (implicit in current implementation)
- **Authentication**: Not required (public API)

## Core Endpoints

### Health Check

#### `GET /api/health`

**Purpose**: System health monitoring and status verification

**Response Format**:
```json
{
  "status": 200,
  "message": "healthy",
  "name": "vhs-vg-courses",
  "version": "1.0.0",
  "description": "VHS VG Course Calendar API - Web scraping and calendar feed generation for Volkshochschule courses",
  "services": []
}
```

**Caching**: 1 minute cache (near real-time health status)
**Response Time**: < 100ms

### Locations

#### `GET /api/locations`

**Purpose**: Retrieve all available VHS-VG locations with address information

**Implementation**: Extract locations from the vhs-vg website search form.

**Response Format**:
```json
{
  "status": 200,
  "timestamp": "2025-08-29T10:30:00Z",
  "data": {
    "locations": [
      {
        "id": "pasewalk",
        "name": "Pasewalk",
        "address": "Am Markt 5, 17309 Pasewalk"
      }
    ],
    "lastUpdated": "2025-08-29T10:30:00Z"
  }
}
```

**Query Parameters**: None
**Caching**: 1 day (location data changes infrequently)
**Response Time**: < 200ms (cached), < 1s (fresh data)

### Courses by Location

#### `GET /api/courses/[location]`

**Purpose**: Retrieve all available courses for a specific location

**Path Parameters**:
- `location` (required): Location identifier (`anklam`, `greifswald`, `pasewalk`)

**Query Parameters**:
- `enriched` (optional): `true` | `false` (default: `false`)
  - `false`: Returns teaser data only (fast response)
  - `true`: Returns full course details (slower response)
- `limit` (optional): Number of courses to return (default: all)
- `offset` (optional): Number of courses to skip (default: 0)
- `category` (optional): Filter by course category
- `startDate` (optional): Filter courses starting after date (ISO 8601)
- `endDate` (optional): Filter courses ending before date (ISO 8601)

**Response Format (Teaser Data)**:
```json
{
  "location": {
    "id": "greifswald",
    "name": "Greifswald"
  },
  "courses": [
    {
      "id": "252A41701",
      "title": "Deutsch als Fremdsprache A1.1",
      "category": "Sprachen",
      "instructor": "Maria Schmidt",
      "startDate": "2025-09-15T18:00:00Z",
      "endDate": "2025-12-10T19:30:00Z",
      "duration": "12 Termine",
      "status": "verfügbar",
      "availableSpots": 8,
      "totalSpots": 15,
      "price": {
        "amount": 120.00,
        "currency": "EUR"
      },
      "schedule": {
        "weekday": "Montag",
        "time": "18:00 - 19:30",
        "frequency": "wöchentlich"
      },
      "location": {
        "building": "VHS Greifswald",
        "room": "Raum 204",
        "address": "Martin-Andersen-Nexö-Platz 1, 17489 Greifswald"
      },
      "detailUrl": "https://www.vhs-vg.de/kurse/detail/252A41701",
      "lastUpdated": "2025-08-29T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "limit": 25,
    "offset": 0,
    "pages": 5,
    "currentPage": 1
  },
  "filters": {
    "appliedFilters": {
      "excludeStarted": true,
      "excludeFullyBooked": true,
      "location": "greifswald"
    },
    "availableCategories": [
      "Sprachen",
      "Gesundheit",
      "Kultur",
      "Beruf",
      "EDV"
    ]
  },
  "lastUpdated": "2025-08-29T10:30:00Z"
}
```

**Response Format (Enriched Data)**:
```json
{
  "location": {
    "id": "greifswald",
    "name": "Greifswald"
  },
  "courses": [
    {
      "id": "252A41701",
      "title": "Deutsch als Fremdsprache A1.1",
      "category": "Sprachen",
      "instructor": {
        "name": "Maria Schmidt",
        "qualifications": "Diplom-Germanistin, DaF-Zertifikat",
        "bio": "Erfahrene Deutschlehrerin mit 10 Jahren Unterrichtserfahrung."
      },
      "description": {
        "short": "Grundkurs für Anfänger ohne Vorkenntnisse",
        "full": "In diesem Kurs lernen Sie die Grundlagen der deutschen Sprache. Wir behandeln alltägliche Situationen wie Einkaufen, Vorstellen und einfache Gespräche. Der Kurs orientiert sich am Gemeinsamen Europäischen Referenzrahmen (GER) Niveau A1.1.",
        "objectives": [
          "Grundwortschatz aufbauen",
          "Einfache Sätze verstehen und bilden",
          "Sich vorstellen können",
          "Alltägliche Ausdrücke verwenden"
        ],
        "requirements": "Keine Vorkenntnisse erforderlich",
        "materials": "Lehrbuch 'Netzwerk A1' (wird im Kurs bekannt gegeben)"
      },
      "startDate": "2025-09-15T18:00:00Z",
      "endDate": "2025-12-10T19:30:00Z",
      "sessions": [
        {
          "date": "2025-09-15T18:00:00Z",
          "duration": 90,
          "topic": "Begrüßung und Vorstellung"
        },
        {
          "date": "2025-09-22T18:00:00Z",
          "duration": 90,
          "topic": "Familie und Beruf"
        }
      ],
      "totalSessions": 12,
      "status": "verfügbar",
      "enrollment": {
        "availableSpots": 8,
        "totalSpots": 15,
        "waitingList": 0,
        "registrationDeadline": "2025-09-10T23:59:59Z"
      },
      "pricing": {
        "regular": 120.00,
        "reduced": 95.00,
        "unemployed": 75.00,
        "currency": "EUR",
        "includes": ["Kursmaterialien", "Teilnahmezertifikat"]
      },
      "schedule": {
        "weekday": "Montag",
        "startTime": "18:00",
        "endTime": "19:30",
        "frequency": "wöchentlich",
        "exceptions": [
          {
            "date": "2025-10-03",
            "reason": "Tag der Deutschen Einheit"
          }
        ]
      },
      "location": {
        "building": "VHS Greifswald",
        "room": "Raum 204",
        "address": {
          "street": "Martin-Andersen-Nexö-Platz 1",
          "city": "Greifswald",
          "postalCode": "17489",
          "country": "Deutschland"
        },
        "accessibility": {
          "wheelchairAccessible": true,
          "parkingAvailable": true,
          "publicTransport": "Bushaltestelle Nexö-Platz (50m)"
        }
      },
      "media": {
        "images": [
          "https://www.vhs-vg.de/images/courses/deutsch-a1.jpg"
        ],
        "flyer": "https://www.vhs-vg.de/flyer/252A41701.pdf"
      },
      "contact": {
        "coordinator": "Anna Müller",
        "phone": "+49 3834 8836815",
        "email": "sprachen@vhs-vg.de"
      },
      "detailUrl": "https://www.vhs-vg.de/kurse/detail/252A41701",
      "registrationUrl": "https://www.vhs-vg.de/anmeldung/252A41701",
      "calendarUrl": "/api/calendar/course/252A41701.ics",
      "lastUpdated": "2025-08-29T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "limit": 25,
    "offset": 0,
    "pages": 5,
    "currentPage": 1
  },
  "filters": {
    "appliedFilters": {
      "excludeStarted": true,
      "excludeFullyBooked": true,
      "location": "greifswald",
      "enriched": true
    },
    "availableCategories": [
      "Sprachen",
      "Gesundheit", 
      "Kultur",
      "Beruf",
      "EDV"
    ]
  },
  "lastUpdated": "2025-08-29T10:30:00Z"
}
```

**Caching Strategy**:
- **Teaser Data**: 15 minutes (fast updates, frequent changes)
- **Enriched Data**: 1 hour (detailed data, less frequent updates)
- **Priority-based**: Recent courses cached more aggressively

**Response Times**:
- **Teaser Data**: < 500ms (cached), < 3s (fresh data)
- **Enriched Data**: < 1s (cached), < 25s (fresh data)

**Error Responses**:
```json
{
  "error": {
    "code": 404,
    "message": "Location not found",
    "details": "The location 'invalid-location' does not exist. Available locations: anklam, greifswald, pasewalk"
  }
}
```

## Future Endpoints

### Calendar Integration

#### `GET /api/calendar/location/[location].ics`
- ICS calendar feed for all courses in a location
- Compatible with Google Calendar, Outlook, Apple Calendar

#### `GET /api/calendar/course/[courseId].ics`
- ICS calendar feed for a specific course
- Includes all session dates and details

### Search and Filtering

#### `GET /api/courses/search`
- Cross-location course search
- Advanced filtering capabilities
- Full-text search in course titles and descriptions

#### `GET /api/categories`
- List all available course categories
- Category-specific statistics and metadata

### Administrative Endpoints

#### `GET /api/stats`
- System statistics and metrics
- Course enrollment trends
- Popular categories and locations

#### `POST /api/refresh`
- Trigger manual cache refresh
- Admin-only endpoint for data updates

## Data Flow and Processing Strategy

### Teaser Data Flow (Fast Response)
1. **Request**: Client requests course list for location
2. **Cache Check**: Check 15-minute cache for teaser data
3. **Cache Hit**: Return cached data (~100-200ms)
4. **Cache Miss**: Fetch fresh teaser data (~2-5s)
5. **Response**: Return teaser data with pagination

### Enriched Data Flow (Complete Information)
1. **Request**: Client requests enriched course data
2. **Teaser Base**: Start with cached teaser data
3. **Priority Processing**: Enrich courses based on relevance
4. **Parallel Fetching**: Process detail pages in optimized batches
5. **Progressive Response**: Stream enriched data as available
6. **Fallback Strategy**: Use teaser data if detail fetching fails

### Smart Caching Strategy
- **Multi-level cache**: Memory → Redis → Database
- **Automatic invalidation**: Time-based and event-based
- **Priority-based refresh**: Recent courses updated more frequently
- **Graceful degradation**: Serve stale data during refresh failures

## Performance Targets

### Response Time Targets
- **Health Check**: < 100ms
- **Locations**: < 200ms (cached), < 1s (fresh)
- **Course Teasers**: < 500ms (cached), < 3s (fresh)
- **Course Details**: < 1s (cached), < 25s (fresh)

### Throughput Targets
- **Concurrent Users**: 50-100 simultaneous requests
- **Cache Hit Rate**: > 85% for teaser data, > 70% for enriched data
- **Availability**: 99.5% uptime target

### Data Freshness
- **Locations**: Updated daily (low volatility)
- **Course Teasers**: Updated every 15 minutes (medium volatility)
- **Course Details**: Updated hourly (high detail, medium volatility)
- **Real-time Updates**: Manual refresh capability for urgent updates

## Error Handling

### Standard HTTP Status Codes
- **200**: Success
- **400**: Bad Request (invalid parameters)
- **404**: Not Found (invalid location/course)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error
- **503**: Service Unavailable (maintenance mode)

### Error Response Format
```json
{
  "error": {
    "code": 400,
    "message": "Invalid location parameter",
    "details": "Location must be one of: anklam, greifswald, pasewalk",
    "timestamp": "2025-08-29T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## Security Considerations

### Rate Limiting
- **Anonymous Users**: 100 requests per minute
- **Identified Users**: 500 requests per minute
- **Admin Users**: 1000 requests per minute

### Data Protection
- **No Personal Data**: API returns only public course information
- **GDPR Compliance**: No user tracking or personal data storage
- **Content Security**: Sanitized HTML in descriptions

### CORS Configuration
- **Allowed Origins**: Configurable whitelist
- **Methods**: GET, OPTIONS
- **Headers**: Standard content headers only

This REST API structure provides a scalable, performant, and user-friendly interface for accessing VHS-VG course data while maintaining excellent response times through intelligent caching and progressive data enhancement strategies.
