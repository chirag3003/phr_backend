# Step Tracking Quick Reference

## For Mobile Developers

### Initialize Sync on App Launch

```swift
// iOS
override func viewDidLoad() {
  super.viewDidLoad()
  syncStepsInBackground()
}

func syncStepsInBackground() {
  Task {
    do {
      // 1. Get last sync info
      let response = try await URLSession.shared.data(
        from: URL(string: "https://api.phr.com/steps/last-updated")!,
        headers: ["Authorization": "Bearer \(token)"]
      )
      
      let lastSync = try JSONDecoder().decode(LastSync.self, from: response.0)
      
      // 2. Determine date range
      let endDate = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
      let startDate = lastSync.nextSyncStartDate ?? Calendar.current.date(
        byAdding: .day, value: -30, to: endDate
      )!
      
      // 3. Fetch from HealthKit
      let steps = try await fetchStepsFromHealthKit(from: startDate, to: endDate)
      
      // 4. Sync to backend
      let syncData = StepsSyncRequest(
        steps: steps.map { step in
          StepData(
            dateRecorded: step.date,
            stepCount: Int(step.count),
            source: "AppleHealthKit"
          )
        }
      )
      
      let request = URLRequest(
        url: URL(string: "https://api.phr.com/steps/sync")!,
        method: .post,
        headers: ["Authorization": "Bearer \(token)"],
        body: syncData
      )
      
      let result = try await URLSession.shared.data(for: request)
      print("Synced \(result.synced) days of step data")
    } catch {
      print("Error syncing steps: \(error)")
    }
  }
}
```

### Key Points

1. **Get Sync Schedule**
   - Call `GET /steps/last-updated`
   - If `lastSyncDate` is null, start from 30 days ago
   - Otherwise, start from `nextSyncStartDate`

2. **Date Range**
   - Always end at yesterday (never include today)
   - Example: If today is March 12, sync through March 11

3. **Sync Operation**
   - `POST /steps/sync` with array of days
   - Each day needs: `dateRecorded`, `stepCount`, `source`
   - Multiple days in one request is optimal

4. **Error Handling**
   - 400: Date validation error → adjust date range
   - 500: Server error → retry with exponential backoff

---

## For Backend Developers

### Key Files

```
Models:
  src/models/steps.ts                 - Data schema and indexes
  src/models/index.ts                 - Export registration

Services:
  src/services/steps.service.ts       - Business logic
  src/services/insights.service.ts    - Insights integration

Controllers:
  src/controllers/steps.controller.ts - HTTP handlers

Routes:
  src/routes/steps.routes.ts          - Endpoint definitions
  src/routes/index.ts                 - Route registration

Validators:
  src/validators/steps.schema.ts      - Zod schemas

Insights:
  src/lib/insights.ts                 - AI prompt generation
```

### Smart Sync Logic

```typescript
// How date validation works:
const today = new Date();
today.setHours(0, 0, 0, 0);

for (const step of data.steps) {
  const stepDate = new Date(step.dateRecorded);
  stepDate.setHours(0, 0, 0, 0);
  
  if (stepDate >= today) {
    throw new Error("Cannot sync today or future dates");
  }
}

// Bulk upsert to prevent duplicates:
const upsertOps = data.steps.map(step => ({
  updateOne: {
    filter: {
      userId: new ObjectId(userId),
      dateRecorded: new Date(step.dateRecorded)
    },
    update: {
      $set: {
        userId: new ObjectId(userId),
        stepCount: step.stepCount,
        source: step.source,
        syncedAt: new Date(),
        notes: step.notes
      }
    },
    upsert: true
  }
}));

await Steps.collection.bulkWrite(upsertOps);
```

### Activity Insights Correlation

```typescript
// How glucose-activity correlation works:
const highActivityThreshold = avgSteps * 1.2;  // 20% above average
const lowActivityThreshold = avgSteps * 0.8;   // 20% below average

const highActivityDays = steps
  .filter(s => s.stepCount >= highActivityThreshold)
  .map(s => new Date(s.dateRecorded).toDateString());

const highActivityGlucose = glucoseReadings
  .filter(g => highActivityDays.includes(
    new Date(g.dateRecorded).toDateString()
  ))
  .map(g => g.value);

const avgGlucoseHighActivity = highActivityGlucose.length > 0
  ? Math.round(
      highActivityGlucose.reduce((a, b) => a + b, 0) / 
      highActivityGlucose.length
    )
  : 0;

// Similar for low activity...
```

### Database Indexes

```javascript
// In src/models/steps.ts
stepsSchema.index({ userId: 1, dateRecorded: 1 }, { unique: true });
stepsSchema.index({ userId: 1, dateRecorded: -1 });

// This ensures:
// - One entry per user per day
// - Fast range queries for date ranges
// - Fast sorting by date descending
```

---

## For Product Managers

### Feature Capabilities

✅ **Apple HealthKit Integration**
- Seamless sync from iOS devices
- Automatic sync on app open
- Intelligent duplicate prevention

✅ **Smart Date Handling**
- Only syncs completed days
- Prevents data consistency issues
- Mobile app knows exactly what to fetch

✅ **Activity-Glucose Correlation**
- Analyzes how activity affects glucose control
- Provides personalized recommendations
- Shows weekly patterns and trends

✅ **Seamless Insights Integration**
- Step data automatically considered in glucose insights
- Activity-adjusted meal recommendations
- New dedicated activity insights endpoint

### User Benefits

1. **Better Glucose Management**
   - Understand how physical activity impacts blood sugar
   - Get activity-adjusted dietary recommendations
   - Identify patterns in your diabetes control

2. **Personalized Health Tracking**
   - Complete picture combining glucose, meals, and activity
   - AI-powered insights specific to your activity level
   - Correlation analysis showing what's actually working

3. **Effortless Sync**
   - Automatic background sync
   - No manual data entry
   - Continues working while traveling

### Metrics to Monitor

```
Engagement:
- Daily active syncs
- Average steps per active user
- Activity data coverage rate

Quality:
- Average time in range (on high activity days vs low)
- User retention after activity feature launch
- Insight usefulness ratings

Technical:
- Sync success rate
- Average sync latency
- Error rates by error type
```

---

## For QA Testers

### Test Cases

#### Date Validation
```
✅ Test 1: Sync yesterday's data
   Expected: Success, synced count = 1

✅ Test 2: Sync today's data
   Expected: 400 error "Cannot sync for today"

✅ Test 3: Sync future date
   Expected: 400 error "Cannot sync for future dates"

✅ Test 4: Sync mixed valid/invalid dates
   Expected: 400 error, entire batch rejected
```

#### Deduplication
```
✅ Test 5: Sync same day twice
   First sync: stepCount = 8000
   Second sync: stepCount = 8500
   Expected: Only latest value stored (8500)

✅ Test 6: Sync 30 days at once
   Expected: All 30 days stored, no duplicates
```

#### API Endpoints
```
✅ Test 7: GET /steps/last-updated on new user
   Expected: { lastSyncDate: null, nextSyncStartDate: <30 days ago> }

✅ Test 8: GET /steps/stats with date range
   Expected: { totalSteps, averageStepsPerDay, minSteps, maxSteps, daysWithData }

✅ Test 9: GET /insights/activity
   Expected: Activity insights JSON with correlations and trends

✅ Test 10: POST /steps/sync in bulk
   Expected: Efficient processing, minimal latency
```

#### Integration
```
✅ Test 11: Sync steps, then get meal insights
   Expected: Meal insights consider activity level

✅ Test 12: High activity day vs low activity day
   Expected: Glucose insights show correlation

✅ Test 13: Activity insights endpoint
   Expected: Shows high vs low activity glucose comparison
```

---

## Troubleshooting

### Mobile App Issues

**"Cannot sync for today"**
- Check device date/time settings
- Mobile app should sync through yesterday only
- Verify API returns correct date validation

**"Duplicates appearing"**
- Should not happen with POST endpoint
- Verify bulk write upsert is working
- Check database indexes are created

**"Sync not triggering"**
- Verify app has HealthKit permission
- Check network connectivity
- Verify JWT token is valid and includes userId

### Backend Issues

**"Steps not appearing in insights"**
- Verify steps were actually synced
- Check that stepRecords is populated in gatherUserData()
- Verify insights cache wasn't stale

**"Glucose insights not showing activity context"**
- Verify gatherUserData() includes stepRecords
- Check OpenAI prompt includes activity data
- Clear insights cache to force regeneration

**"Activity correlation numbers seem wrong"**
- Verify high/low thresholds: avg * 1.2 and avg * 0.8
- Check glucose readings are being correctly filtered
- Verify date comparisons are timezone-aware
