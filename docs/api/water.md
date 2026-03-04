# Water Intake API

Base path: `/water`

All endpoints require `Authorization: Bearer <jwt>`.

## Endpoints
- `GET /water` list all records
- `GET /water/latest` latest record
- `GET /water/range?startDate=...&endDate=...`
- `GET /water/date?date=YYYY-MM-DD`
- `GET /water/:id`
- `POST /water` (create or update by date)
- `PUT /water/:id`
- `DELETE /water/:id`

## Create/Upsert Example
```json
{
  "dateRecorded": "2026-01-22",
  "glasses": 6
}
```

## Record Shape
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "dateRecorded": "2026-01-22T00:00:00.000Z",
  "glasses": 6,
  "createdAt": "2026-01-22T08:30:00.000Z",
  "updatedAt": "2026-01-22T08:30:00.000Z"
}
```
