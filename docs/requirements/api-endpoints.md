# API Endpoints Summary

## Core REST API Endpoints

### Health Check
- **GET** `/api/health` - System health status and version information

### Locations
- **GET** `/api/locations` - List all VHS-VG locations with addresses and contact info

### Courses
- **GET** `/api/courses/[location]` - Get courses for specific location (anklam, greifswald, pasewalk)

## Response Formats

Use common rest response formats like defined in the examples in /docs/examples.

### Locations Response
```json
{
  "locations": [
    {
      "id": "anklam",
      "name": "Anklam", 
      "address": { "street": "...", "city": "...", "postalCode": "..." },
    }
  ],
}
```

### Courses Response (Teaser)
```json
{
  "location": { "id": "greifswald", "name": "Greifswald" },
  "courses": [
    {
      "id": "252A41701",
      "title": "Deutsch als Fremdsprache A1.1",
      "category": "Sprachen",
      "startDate": "2025-09-15T18:00:00Z",
      "price": { "amount": 120.00, "currency": "EUR" },
      "status": "verfügbar",
      "availableSpots": 8
    }
  ],
  "pagination": { "total": 125, "pages": 5 }
}
```

### Courses Response (Enriched)
```json
{
  "location": { "id": "greifswald", "name": "Greifswald" },
  "courses": [
    {
      "id": "252A41701",
      "title": "Deutsch als Fremdsprache A1.1",
      "description": {
        "short": "Grundkurs für Anfänger",
        "full": "Detailed course description...",
        "objectives": ["Goal 1", "Goal 2"]
      },
      "instructor": {
        "name": "Maria Schmidt",
        "qualifications": "Diplom-Germanistin"
      },
      "sessions": [
        { "date": "2025-09-15T18:00:00Z", "topic": "Introduction" }
      ],
      "location": {
        "building": "VHS Greifswald",
        "room": "Raum 204",
        "accessibility": { "wheelchairAccessible": true }
      }
    }
  ]
}
```

## Performance Characteristics

| Endpoint | Cache Duration | Response Time (Cached) | Response Time (Fresh) |
|----------|----------------|----------------------|---------------------|
| `/api/health` | No cache | < 100ms | < 100ms |
| `/api/locations` | 1 hour | < 200ms | < 1s |
| `/api/courses/[location]` (teaser) | 15 minutes | < 500ms | < 3s |
| `/api/courses/[location]` (enriched) | 1 hour | < 1s | < 25s |

## Implementation Notes

- All responses include `lastUpdated` timestamp
- Pagination is supported with `limit` and `offset` parameters
- Error responses follow standard HTTP status codes (400, 404, 500, etc.)
- CORS enabled for browser access
- Rate limiting: 100 requests/minute for anonymous users
- Data follows VHS-VG website structure and filtering rules (exclude started/full courses)
- Progressive enhancement: teaser data loads fast, enriched data provides complete details
