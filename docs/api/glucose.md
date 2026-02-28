# Glucose API

Base path: `/glucose`

All endpoints require `Authorization: Bearer <jwt>`.

## Data Model
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "value": 110,
  "unit": "mg/dL",
  "dateRecorded": "2026-01-22T00:00:00.000Z",
  "time": { "hour": 8, "minute": 30 },
  "mealContext": "Fasting",
  "notes": "Morning reading",
  "createdAt": "2026-01-22T08:30:00.000Z",
  "updatedAt": "2026-01-22T08:30:00.000Z"
}
```

## Endpoints
- `GET /glucose` list all readings
- `GET /glucose/latest` latest reading
- `GET /glucose/range?startDate=...&endDate=...`
- `GET /glucose/context?mealContext=Fasting|Before Meal|After Meal|Bedtime|Random`
- `GET /glucose/stats?startDate=...&endDate=...`
- `GET /glucose/:id`
- `POST /glucose`
- `PUT /glucose/:id`
- `DELETE /glucose/:id`

## Create Example
```json
{
  "value": 110,
  "unit": "mg/dL",
  "dateRecorded": "2026-01-22",
  "time": { "hour": 8, "minute": 30 },
  "mealContext": "Fasting",
  "notes": "Morning reading before breakfast"
}
```
