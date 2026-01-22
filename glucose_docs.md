# Glucose API Documentation

## Data Model

### Glucose Reading Object

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "value": 110,
  "unit": "mg/dL",
  "dateRecorded": "2026-01-22T00:00:00.000Z",
  "time": {
    "hour": 8,
    "minute": 30
  },
  "mealContext": "Fasting",
  "notes": "Morning reading before breakfast",
  "createdAt": "2026-01-22T08:30:00.000Z",
  "updatedAt": "2026-01-22T08:30:00.000Z"
}
```

### Field Definitions

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| _id | string | Auto | ObjectId | Unique identifier |
| userId | string | Auto | ObjectId | User reference (set from token) |
| value | number | Yes | 0-1000 | Glucose reading value |
| unit | enum | No | `mg/dL`, `mmol/L` | Measurement unit (default: `mg/dL`) |
| dateRecorded | date | Yes | ISO date | Date of reading |
| time | object | Yes | See below | Time of reading |
| time.hour | number | Yes | 0-23 | Hour |
| time.minute | number | Yes | 0-59 | Minute |
| mealContext | enum | No | See below | Context relative to meals |
| notes | string | No | max 500 chars | Additional notes |

### Meal Context Options

| Value | Description |
|-------|-------------|
| `Fasting` | First reading after 8+ hours without food |
| `Before Meal` | Reading taken before eating |
| `After Meal` | Reading taken 1-2 hours after eating |
| `Bedtime` | Reading taken before sleep |
| `Random` | Reading at any other time |

---

## Endpoints

### GET `/glucose`

Get all glucose readings for the authenticated user.

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "value": 110,
    "unit": "mg/dL",
    "dateRecorded": "2026-01-22T00:00:00.000Z",
    "time": { "hour": 8, "minute": 30 },
    "mealContext": "Fasting",
    "notes": "Morning reading"
  }
]
```

---

### GET `/glucose/latest`

Get the most recent glucose reading.

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "value": 110,
  "unit": "mg/dL",
  "dateRecorded": "2026-01-22T00:00:00.000Z",
  "time": { "hour": 8, "minute": 30 },
  "mealContext": "Fasting"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "No glucose readings found"
}
```

---

### GET `/glucose/range`

Get glucose readings within a date range.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (ISO format) |
| endDate | string | Yes | End date (ISO format) |

**Example:**
```
GET /glucose/range?startDate=2026-01-01&endDate=2026-01-31
```

**Response (200 OK):** Array of glucose reading objects

---

### GET `/glucose/context`

Get glucose readings filtered by meal context.

**Query Parameters:**
| Parameter | Type | Required | Values |
|-----------|------|----------|--------|
| mealContext | enum | Yes | `Fasting`, `Before Meal`, `After Meal`, `Bedtime`, `Random` |

**Example:**
```
GET /glucose/context?mealContext=Fasting
```

**Response (200 OK):** Array of glucose reading objects

---

### GET `/glucose/stats`

Get statistical summary of glucose readings within a date range.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (ISO format) |
| endDate | string | Yes | End date (ISO format) |

**Example:**
```
GET /glucose/stats?startDate=2026-01-01&endDate=2026-01-31
```

**Response (200 OK):**
```json
{
  "average": 105,
  "min": 72,
  "max": 180,
  "count": 45,
  "inRange": 38,
  "belowRange": 2,
  "aboveRange": 5
}
```

| Field | Description |
|-------|-------------|
| average | Average glucose value (rounded) |
| min | Minimum reading |
| max | Maximum reading |
| count | Total number of readings |
| inRange | Readings between 70-180 mg/dL |
| belowRange | Readings below 70 mg/dL (hypoglycemia) |
| aboveRange | Readings above 180 mg/dL (hyperglycemia) |

---

### GET `/glucose/:id`

Get a specific glucose reading by ID.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Glucose reading ObjectId |

**Response (200 OK):** Single glucose reading object

**Error Response (404 Not Found):**
```json
{
  "error": "Glucose reading not found"
}
```

---

### POST `/glucose`

Create a new glucose reading.

**Request Body:**
```json
{
  "value": 110,
  "unit": "mg/dL",
  "dateRecorded": "2026-01-22",
  "time": {
    "hour": 8,
    "minute": 30
  },
  "mealContext": "Fasting",
  "notes": "Morning reading before breakfast"
}
```

**Response (201 Created):** Returns created glucose reading object

**Error Response (400 Bad Request):**
```json
{
  "error": [
    {
      "path": ["value"],
      "message": "Required"
    }
  ]
}
```

---

### PUT `/glucose/:id`

Update an existing glucose reading.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Glucose reading ObjectId |

**Request Body:** Any subset of glucose fields
```json
{
  "value": 115,
  "notes": "Updated reading after rechecking"
}
```

**Response (200 OK):** Returns updated glucose reading object

---

### DELETE `/glucose/:id`

Delete a glucose reading.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Glucose reading ObjectId |

**Response (200 OK):**
```json
{}
```

---

## iOS UIKit Integration

### Swift Model

```swift
struct GlucoseReading: Codable {
    let id: String
    let userId: String
    let value: Int
    let unit: String
    let dateRecorded: Date
    let time: TimeOfDay
    let mealContext: String?
    let notes: String?
    let createdAt: Date?
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case userId, value, unit, dateRecorded, time, mealContext, notes, createdAt, updatedAt
    }
}

struct TimeOfDay: Codable {
    let hour: Int
    let minute: Int
}

struct GlucoseStats: Codable {
    let average: Int
    let min: Int
    let max: Int
    let count: Int
    let inRange: Int
    let belowRange: Int
    let aboveRange: Int
}
```

### Meal Context Enum

```swift
enum MealContext: String, CaseIterable, Codable {
    case fasting = "Fasting"
    case beforeMeal = "Before Meal"
    case afterMeal = "After Meal"
    case bedtime = "Bedtime"
    case random = "Random"
}
```

### Unit Enum

```swift
enum GlucoseUnit: String, Codable {
    case mgdL = "mg/dL"
    case mmolL = "mmol/L"
}
```

### Example API Call

```swift
// Create a new glucose reading
func createGlucoseReading(value: Int, hour: Int, minute: Int, context: MealContext) async throws -> GlucoseReading {
    let url = URL(string: "\(baseURL)/glucose")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    
    let body: [String: Any] = [
        "value": value,
        "unit": "mg/dL",
        "dateRecorded": ISO8601DateFormatter().string(from: Date()),
        "time": ["hour": hour, "minute": minute],
        "mealContext": context.rawValue
    ]
    
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    
    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(GlucoseReading.self, from: data)
}
```

---

## Target Ranges Reference

| Category | Range (mg/dL) | Description |
|----------|---------------|-------------|
| Low (Hypoglycemia) | < 70 | Requires immediate attention |
| In Range | 70-180 | Target range for diabetes management |
| High (Hyperglycemia) | > 180 | Above target, monitor closely |

### Fasting Glucose Targets

| Status | Range (mg/dL) |
|--------|---------------|
| Normal | 70-99 |
| Pre-diabetes | 100-125 |
| Diabetes | ≥ 126 |
