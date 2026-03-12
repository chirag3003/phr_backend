# Activity Insights Architecture

## Overview

The Activity Insights system integrates step tracking data with glucose and meal insights to provide comprehensive health recommendations. It correlates physical activity with blood glucose control and meal planning.

## System Components

### 1. Step Tracking Layer

**Location:** `src/models/steps.ts`, `src/services/steps.service.ts`

- Stores daily step counts with Apple HealthKit source
- Enforces unique constraint: one entry per user per day
- Validates dates: rejects today and future dates
- Performs bulk upsert to prevent duplicates

**Database Indexes:**
```
{ userId: 1, dateRecorded: 1 } UNIQUE
{ userId: 1, dateRecorded: -1 } for range queries
```

### 2. Mobile Sync Protocol

**Location:** `src/controllers/steps.controller.ts`, Routes: `POST /steps/sync`, `GET /steps/last-updated`

```
Mobile App Flow:
  1. GET /steps/last-updated
  2. Calculate dateRange = [nextSyncStartDate, today-1]
  3. Fetch from Apple HealthKit API
  4. POST /steps/sync with bulk data
  5. Store response (synced count, lastSyncDate)
  
Date Validation:
  - Reject: dateRecorded >= today
  - Accept: dateRecorded < today
  - Example: If today is Mar 12, sync until Mar 11
```

### 3. Insights Data Pipeline

**Location:** `src/services/insights.service.ts`, `src/lib/insights.ts`

```
gatherUserData() 
  ├─ Profile data
  ├─ Glucose readings
  ├─ Meals
  ├─ Symptoms
  ├─ Water records
  ├─ Step records (NEW)
  └─ Allergies

↓

generateGlucoseInsights()
  - Includes activity context
  - Analyzes high vs low activity days
  
generateMealInsights()
  - Includes activity level
  - Activity-adjusted carb recommendations

generateActivityInsights() (NEW)
  - Activity-glucose correlation
  - Step patterns and trends
  - Weekly activity analysis
```

### 4. Activity Correlation Engine

**Location:** `src/lib/insights.ts::generateActivityInsights()`

```
Analysis Metrics:

1. Activity Thresholds
   - High activity: average steps × 1.2
   - Low activity: average steps × 0.8
   - Example: If avg is 8000, high is 9600+, low is 6400 or less

2. Glucose Correlation
   - Collect glucose readings from high activity days
   - Collect glucose readings from low activity days
   - Calculate average for each
   - Compare and generate insights

3. Pattern Detection
   - Weekday vs weekend analysis
   - Consistency metrics
   - Trend identification
   - Weekly patterns

4. Recommendations
   - Activity-based meal planning
   - Glucose management strategy
   - Actionable behavior changes
```

### 5. AI Prompt Architecture

**Location:** `src/lib/insights.ts`

#### Glucose Insights Prompt (Enhanced)
```
Input Context:
- Patient profile (age, diabetes type, BMI)
- Recent glucose readings (30 readings)
- Recent meals (15 meals)
- Recent activity (30 days of steps) ← NEW
- Symptoms
- Allergies

Analysis Focus:
- Time patterns
- Meal-glucose correlation
- Activity impact ← NEW
- Symptom correlation
- Hypoglycemia/hyperglycemia episodes

Output:
- Insights (max 2)
- Patterns (max 2)
- Tips (max 2)
- Summary
```

#### Meal Insights Prompt (Enhanced)
```
Input Context:
- Patient profile
- Recent meals (20 meals)
- Recent glucose (10 readings)
- Average daily steps ← NEW
- Symptoms
- Allergies

Analysis Focus:
- Carb patterns
- Protein/fiber intake
- Meal timing
- Activity-adjusted macros ← NEW
- Meal-symptom correlation

Output:
- Insights (max 3)
- Tips (max 3)
- Summary
```

#### Activity Insights Prompt (New)
```
Input Context:
- Patient profile
- Step data (30 days)
- Glucose readings (20 readings)
- Activity statistics:
  * Average steps/day
  * Max/min steps
  * High/low activity days
  * Glucose on high activity days
  * Glucose on low activity days

Analysis Focus:
- Activity consistency
- Activity-glucose correlation
- Weekly patterns
- Impact on health
- Recommendations

Output:
- Insights (max 2)
- Patterns (max 2)
- Tips (max 2)
- Summary
- averageStepsPerDay
- weeklyTrend
```

## Data Flow Diagram

```
Apple HealthKit
      ↓
Mobile App
      ↓
GET /steps/last-updated ←→ Steps Service
                           (lastSyncDate lookup)
      ↓
Fetch steps from HealthKit
      ↓
POST /steps/sync ←→ Steps Controller
                    (validation)
                      ↓
                  Steps Service
                      ↓
                  MongoDB Steps Collection
                      ↓
                  Bulk Upsert (deduplicate)
      ↓
GET /insights/glucose
GET /insights/meals
GET /insights/activity ← All trigger data gathering
      ↓
InsightsService.gatherUserData()
      ↓
Fetch [Profile, Glucose, Meals, Symptoms, Water, Steps] ← NEW
      ↓
generateGlucoseInsights(userDataWithSteps)
generateMealInsights(userDataWithSteps)
generateActivityInsights(userDataWithSteps) ← NEW
      ↓
OpenAI API (gpt-5-nano)
      ↓
Cache in Insight model { userId, type, dateKey, payload }
      ↓
Return to client
```

## Caching Strategy

```
Insight Cache Key:
- userId: authenticated user
- type: "glucose" | "meal" | "activity" | "water"
- dateKey: YYYY-MM-DD (UTC date)

Uniqueness:
- Unique index: { userId: 1, type: 1, dateKey: 1 }
- One cached insight per type per day per user

Lifecycle:
- Generated on first request of the day
- Served from cache for subsequent requests same day
- Regenerates at UTC midnight
```

## Error Handling

```
Step Sync Errors:
- 400: Date validation failure
  * Today or future date detected
  * Invalid date format
  * Missing required fields

- 400: Validation error
  * Invalid stepCount (negative)
  * Invalid source
  * Schema validation failure

- 500: Internal error
  * Database write failure
  * Bulk write error

Insights Errors:
- 404: No data available
- 500: OpenAI API error
- 500: Database error
```

## Performance Considerations

### Database Queries

```
Steps Queries:
- getSteps() → O(log n) with index
- getStepsByDateRange() → O(log n + m) with range index
- getStepsStats() → O(m) where m = result set size
- Insert/Upsert → O(log n) per operation

Insights Queries:
- gatherUserData() → Parallel queries (7 collections)
- Cache hit → O(1) lookup
- Cache miss → ~5-10 AI API calls (batched)
```

### Network

```
Mobile Sync:
- GET /steps/last-updated → ~50ms
- Health HealthKit fetch → Device dependent
- POST /steps/sync → Depends on batch size
- Bulk sync 30 days: ~200ms

Insights Generation:
- Cache hit: ~200ms
- Cache miss: 3-5 seconds (OpenAI API calls)
```

## Security

```
Authentication:
- All endpoints require JWT in Authorization header
- userId extracted from JWT claims
- Database queries filtered by authenticated userId

Data Isolation:
- Users cannot access other users' steps
- Insights generated only for authenticated user
- Shared insights require explicit permissions

Validation:
- Input validation with Zod schemas
- Date validation prevents invalid ranges
- Step count range validation (0 to max practical)
```

## Testing Strategy

```
Unit Tests:
- StepsService sync logic
  * Date validation (today rejected)
  * Bulk upsert deduplication
  * Last sync date calculation

- Activity correlation engine
  * High/low activity threshold calculation
  * Glucose correlation math

Integration Tests:
- End-to-end sync flow
- Insights generation with step data
- Cache invalidation at UTC midnight

Performance Tests:
- Sync large batches (30+ days)
- Activity correlation with 100+ records
- Concurrent user syncs
```

## Future Enhancements

```
Phase 2 Potential:
- Step data in shared summaries
- Wearable device integration (Fitbit, Garmin)
- Intraday step patterns (hourly breakdown)
- Sleep data correlation
- Exercise type classification
- Push notifications for low activity days
- Step goals and achievement tracking
- Social comparison (anonymized)

Phase 3 Potential:
- Machine learning for personalized activity recommendations
- Predictive glucose modeling based on activity
- Automatic activity-meal-glucose optimization
- Integration with calendar for scheduled activities
```

## Implementation Checklist

- ✅ Steps Model with indexes
- ✅ Steps Service with smart sync
- ✅ Steps Controller with 6 endpoints
- ✅ Steps Routes with auth
- ✅ Mobile sync protocol documentation
- ✅ Enhanced glucose insights with activity context
- ✅ Enhanced meal insights with activity context
- ✅ Activity insights generation
- ✅ Activity insights endpoint
- ✅ Data correlation engine
- ⬜ Shared insights activity permission
- ⬜ Activity data in health summary PDF
- ⬜ Push notifications for low activity
- ⬜ Step goal tracking

## Endpoints Summary

```
POST   /steps/sync              - Bulk sync with validation
GET    /steps/last-updated      - Get sync schedule info
GET    /steps                   - Get all steps
GET    /steps/latest            - Get most recent
GET    /steps/range             - Query by date
GET    /steps/stats             - Get statistics
DELETE /steps/:id               - Delete record

GET    /insights/glucose        - Enhanced with activity
GET    /insights/meals          - Enhanced with activity
GET    /insights/activity       - NEW activity insights
```
