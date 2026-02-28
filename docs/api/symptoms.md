# Symptoms API

Base path: `/symptoms`

All endpoints require `Authorization: Bearer <jwt>`.

## Endpoints
- `GET /symptoms` list symptoms
- `GET /symptoms/range?startDate=...&endDate=...`
- `GET /symptoms/:id`
- `POST /symptoms`
- `PUT /symptoms/:id`
- `DELETE /symptoms/:id`

## Create Example
```json
{
  "symptomName": "Headache",
  "intensity": "Medium",
  "dateRecorded": "2026-01-22",
  "time": { "hour": 14, "minute": 30 },
  "notes": "Started after lunch"
}
```
