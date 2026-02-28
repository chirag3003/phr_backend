# Meals API

Base path: `/meals`

All endpoints require `Authorization: Bearer <jwt>`.

## Endpoints
- `GET /meals`
- `GET /meals/type?type=Breakfast|Lunch|Dinner|Snack`
- `GET /meals/range?startDate=...&endDate=...`
- `GET /meals/:id`
- `POST /meals` (manual entry)
- `POST /meals/analyze` (image + AI analysis)
- `PUT /meals/:id`
- `DELETE /meals/:id`

## Create Example
```json
{
  "name": "Oatmeal with Berries",
  "detail": "Healthy breakfast option",
  "type": "Breakfast",
  "mealImage": "https://example.com/image.jpg",
  "calories": 350,
  "protein": 12,
  "carbs": 55,
  "fiber": 8,
  "dateRecorded": "2026-01-22",
  "time": "08:30",
  "addedBy": "Self",
  "notes": "Added honey"
}
```

## Image Analyze
`POST /meals/analyze` accepts `multipart/form-data` with `file` (JPEG/PNG/GIF/WebP). The image is uploaded to S3 and used for AI analysis.
