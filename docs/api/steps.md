# Steps API

Base path: `/steps`

All endpoints require `Authorization: Bearer <jwt>`.

## Overview

The Steps API provides Apple HealthKit integration for tracking daily physical activity. Step data is synced incrementally from mobile apps, with smart date-based logic to prevent duplicates and ensure data consistency.

**Key Features:**
- Smart date validation (rejects today and future dates)
- Bulk sync with upsert to prevent duplicates
- Incremental sync using last updated date
- Correlation with glucose and meal data for holistic insights

## Data Model

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "dateRecorded": "2026-03-10T00:00:00.000Z",
  "stepCount": 8500,
  "source": "AppleHealthKit",
  "syncedAt": "2026-03-12T09:30:00.000Z",
  "notes": "Active day",
  "createdAt": "2026-03-12T09:30:00.000Z",
  "updatedAt": "2026-03-12T09:30:00.000Z"
}
```

**Field Details:**
- `dateRecorded` - The day of activity (must be yesterday or earlier, never today)
- `stepCount` - Total steps for that day (non-negative integer)
- `source` - Data source: "AppleHealthKit", "GoogleFit", or "Manual"
- `syncedAt` - When this data was synced to the backend
- Unique constraint: One entry per user per day

## Endpoints

### POST `/steps/sync`

Bulk sync step data from mobile app. Validates dates and performs upsert to prevent duplicates.

**Request:**
```json
{
  "steps": [
    {
      "dateRecorded": "2026-03-10",
      "stepCount": 8500,
      "source": "AppleHealthKit",
      "notes": "Busy day at work"
    },
    {
      "dateRecorded": "2026-03-09",
      "stepCount": 12000,
      "source": "AppleHealthKit"
    }
  ]
}
```

**Response (200):**
```json
{
  "synced": 2,
  "lastSyncDate": "2026-03-10T00:00:00.000Z",
  "message": "Successfully synced 2 day(s) of step data"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid date: 2026-03-12. Cannot sync steps for today or future dates. Only sync data up to yesterday."
}
```

**Date Validation Logic:**
- Rejects any date >= today (prevents syncing current or future days)
- Mobile apps should calculate: `endDate = today - 1 day`
- Example: If today is March 12, sync up through March 11

---

### GET `/steps/last-updated`

Returns the last sync date and next sync start date. Used by mobile apps to know which date range to fetch.

**Response (200):**
```json
{
  "lastSyncDate": "2026-03-10T00:00:00.000Z",
  "nextSyncStartDate": "2026-03-11T00:00:00.000Z"
}
```

**Response when no data (200):**
```json
{
  "lastSyncDate": null,
  "nextSyncStartDate": "2026-02-10T00:00:00.000Z"
}
```

**Mobile App Usage:**
```
1. Call GET /steps/last-updated
2. If lastSyncDate exists, fetch from nextSyncStartDate to (today - 1 day)
3. If null, fetch from 30 days ago to (today - 1 day)
4. Call POST /steps/sync with the fetched data
```

---

### GET `/steps`

Get all step records for the user, sorted by date descending.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "dateRecorded": "2026-03-10T00:00:00.000Z",
    "stepCount": 8500,
    "source": "AppleHealthKit",
    "syncedAt": "2026-03-12T09:30:00.000Z",
    "notes": "Active day",
    "createdAt": "2026-03-12T09:30:00.000Z",
    "updatedAt": "2026-03-12T09:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "dateRecorded": "2026-03-09T00:00:00.000Z",
    "stepCount": 12000,
    "source": "AppleHealthKit",
    "syncedAt": "2026-03-12T09:28:00.000Z"
  }
]
```

---

### GET `/steps/latest`

Get the most recent step record.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "dateRecorded": "2026-03-10T00:00:00.000Z",
  "stepCount": 8500,
  "source": "AppleHealthKit",
  "syncedAt": "2026-03-12T09:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "No steps found"
}
```

---

### GET `/steps/range`

Get steps within a date range.

**Query Parameters:**
- `startDate` (required) - ISO date string or timestamp
- `endDate` (required) - ISO date string or timestamp

**Example:**
```
GET /steps/range?startDate=2026-03-01&endDate=2026-03-10
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "dateRecorded": "2026-03-10T00:00:00.000Z",
    "stepCount": 8500,
    "source": "AppleHealthKit",
    "syncedAt": "2026-03-12T09:30:00.000Z"
  }
]
```

---

### GET `/steps/stats`

Get aggregated statistics for a date range.

**Query Parameters:**
- `startDate` (required) - ISO date string or timestamp
- `endDate` (required) - ISO date string or timestamp

**Example:**
```
GET /steps/stats?startDate=2026-03-01&endDate=2026-03-10
```

**Response (200):**
```json
{
  "totalSteps": 85000,
  "averageStepsPerDay": 8500,
  "minSteps": 5000,
  "maxSteps": 12000,
  "daysWithData": 10
}
```

**Response when no data (200):**
```json
{
  "totalSteps": 0,
  "averageStepsPerDay": 0,
  "minSteps": 0,
  "maxSteps": 0,
  "daysWithData": 0
}
```

---

### DELETE `/steps/:id`

Delete a step record by ID.

**URL Parameters:**
- `id` - MongoDB ObjectId of the step record

**Response (200):**
```json
{}
```

**Error Response (404):**
```json
{
  "error": "Steps record not found"
}
```

---

## Integration with Insights

Step data automatically integrates with glucose and meal insights:

### Enhanced Glucose Insights
When generating glucose insights, the system analyzes:
- Average glucose on high activity days (average steps × 1.2)
- Average glucose on low activity days (average steps × 0.8)
- Impact of activity on glucose stability

### Enhanced Meal Insights
When generating meal insights, the system considers:
- Daily activity level for carb recommendations
- Activity-adjusted macro targets
- How physical activity affects meal planning

### New Activity Insights (GET `/insights/activity`)
Returns dedicated step analytics including:
- Weekly activity trends
- Step consistency patterns
- Correlation with glucose control
- Actionable activity recommendations

---

## Mobile App Integration Guide

### Step 1: Get Last Sync Date
```javascript
const response = await fetch('https://api.phr.com/steps/last-updated', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { lastSyncDate, nextSyncStartDate } = await response.json();
```

### Step 2: Fetch Steps from Health App
```javascript
// Calculate date range
const endDate = new Date();
endDate.setDate(endDate.getDate() - 1); // Yesterday

const startDate = lastSyncDate 
  ? new Date(nextSyncStartDate)
  : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

// Fetch from Apple HealthKit with [startDate, endDate]
const healthKitSteps = await HKHealthStore.querySteps(startDate, endDate);
```

### Step 3: Sync to Backend
```javascript
const response = await fetch('https://api.phr.com/steps/sync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    steps: healthKitSteps.map(item => ({
      dateRecorded: item.date,
      stepCount: item.steps,
      source: 'AppleHealthKit'
    }))
  })
});

const { synced, lastSyncDate } = await response.json();
console.log(`Synced ${synced} days of step data`);
```

### Step 4: Auto-Trigger on App Open
```javascript
// On app initialization
AppDelegate.didFinishLaunchingWithOptions = async () => {
  // ... other setup ...
  await syncSteps();
};

// On app foreground
AppDelegate.applicationWillEnterForeground = async () => {
  await syncSteps();
};
```

---

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 200 | - | Success |
| 400 | `ValidationError` | Invalid date (today or future) or validation failure |
| 404 | `NotFound` | Resource not found |
| 500 | `InternalError` | Server error |

---

## Date Validation Rules

- ✅ Yesterday: Accepted
- ✅ Past dates: Accepted
- ❌ Today: Rejected
- ❌ Future dates: Rejected

**Example:**
- Today: March 12, 2026, 9:30 AM UTC
- ✅ March 11: OK
- ✅ March 10: OK
- ✅ March 1: OK
- ❌ March 12: Rejected
- ❌ March 13: Rejected

---

## Indexing and Performance

The Steps model uses two indexes for efficiency:

1. **Unique Index** on `(userId, dateRecorded)` - Enforces one entry per user per day
2. **Range Index** on `(userId, dateRecorded DESC)` - Optimizes date range queries

This ensures O(log n) query performance even with millions of records.
