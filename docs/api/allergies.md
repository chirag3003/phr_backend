# Allergies API

Base path: `/allergies`

All endpoints require `Authorization: Bearer <jwt>`.

## Endpoints
- `GET /allergies`
- `GET /allergies/:id`
- `POST /allergies`
- `PUT /allergies/:id`
- `DELETE /allergies/:id`

## Create Example
```json
{
  "name": "Peanuts",
  "severity": "High",
  "notes": "Causes difficulty in breathing"
}
```
