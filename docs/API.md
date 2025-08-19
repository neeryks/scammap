# API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
Currently, the API does not require authentication. Future versions will implement API keys and user authentication.

## Rate Limiting
- Development: No rate limiting
- Production: 100 requests per minute per IP

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message",
  "timestamp": "2025-08-19T10:30:00Z"
}
```

## Error Responses
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-19T10:30:00Z"
}
```

## Endpoints

### Reports

#### GET `/api/reports`
Retrieve all incident reports with optional filtering.

**Query Parameters:**
- `category` (string): Filter by scam category
- `limit` (number): Maximum number of results (default: 50, max: 100)
- `offset` (number): Number of results to skip (default: 0)
- `city` (string): Filter by city name
- `min_score` (number): Minimum risk score (0-100)
- `max_score` (number): Maximum risk score (0-100)

**Example Request:**
```bash
GET /api/reports?category=dating-romance&limit=10&city=Mumbai
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "created_at": "2025-08-19T10:30:00Z",
      "category": "dating-romance",
      "venue_name": "Dating App Profile",
      "city": "Mumbai",
      "address": "Online Platform",
      "description": "Fake profile requesting money...",
      "loss_type": "emotional",
      "loss_amount_inr": 75000,
      "emotional_impact": "severe-distress",
      "scam_meter_score": 89,
      "verification_status": "community_corroborated",
      "tactic_tags": ["fake-profile", "money-request", "emotional-manipulation"]
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### POST `/api/reports`
Submit a new incident report.

**Request Body (multipart/form-data):**
```json
{
  "venue": "Business or platform name",
  "address": "Full address including city and country",
  "scamType": "dating-romance",
  "lossType": "emotional",
  "monetaryAmount": "75000",
  "emotionalImpact": "severe-distress",
  "timeWasted": "few-months",
  "personalDataCompromised": "photos-videos",
  "description": "Detailed description of what happened...",
  "evidence": File // Optional file upload
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "message": "Report submitted successfully"
  }
}
```

#### GET `/api/reports/{id}`
Retrieve a specific incident report by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "created_at": "2025-08-19T10:30:00Z",
    "category": "dating-romance",
    "venue_name": "Dating App Profile",
    "city": "Mumbai",
    "description": "Detailed description...",
    "loss_type": "emotional",
    "scam_meter_score": 89,
    "verification_status": "community_corroborated",
    "evidence_ids": ["evidence-1", "evidence-2"],
    "tactic_tags": ["fake-profile", "money-request"]
  }
}
```

### Venues

#### GET `/api/venues`
Retrieve all venues with incident statistics.

**Query Parameters:**
- `city` (string): Filter by city
- `min_incidents` (number): Minimum number of incidents
- `limit` (number): Maximum results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Business Name",
      "address": "Full Address",
      "city": "Mumbai",
      "lat": 19.0760,
      "lon": 72.8777,
      "incident_count": 5,
      "avg_risk_score": 85,
      "scam_meter_score": 87,
      "aggregate_stats": {
        "incident_count": 5,
        "avg_loss": 45000,
        "top_tactics": ["overcharging", "hidden-fees"]
      }
    }
  ]
}
```

### Statistics

#### GET `/api/statistics`
Get platform-wide statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_reports": 1250,
    "total_financial_loss": 15750000,
    "avg_risk_score": 78,
    "top_categories": [
      {"category": "dating-romance", "count": 245},
      {"category": "investment-crypto", "count": 198},
      {"category": "tech-support", "count": 156}
    ],
    "top_cities": [
      {"city": "Mumbai", "count": 298},
      {"city": "Delhi", "count": 267},
      {"city": "Bangalore", "count": 198}
    ]
  }
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `INVALID_REQUEST` | Invalid request format | Request body or parameters are malformed |
| `MISSING_REQUIRED_FIELD` | Required field missing | Required form field not provided |
| `INVALID_CATEGORY` | Invalid scam category | Provided category not in allowed list |
| `FILE_TOO_LARGE` | File size exceeds limit | Uploaded file larger than 10MB |
| `INVALID_FILE_TYPE` | Unsupported file type | File type not in allowed formats |
| `RATE_LIMIT_EXCEEDED` | Too many requests | API rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error | Unexpected server error |

## File Upload

### Supported Formats
- **Images**: PNG, JPG, JPEG, GIF (max 10MB)
- **Documents**: PDF, DOC, DOCX (max 10MB)

### Automatic Processing
- **Face Detection**: Faces are automatically blurred
- **PII Redaction**: Personal information is detected and redacted
- **OCR**: Text is extracted from images for searchability
- **Hash Generation**: Unique hash created for duplicate detection

### Security
- Files are scanned for malware
- Metadata is stripped from images
- Files are stored securely with access controls

## Webhooks (Future Feature)

Coming in future versions:
- Report submission notifications
- Moderation status updates
- Community verification events

## SDKs and Libraries

Currently available:
- JavaScript/TypeScript examples in repository
- cURL examples in documentation

Planned:
- Official JavaScript SDK
- Python SDK
- React hooks library
