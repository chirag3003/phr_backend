# Shared Insights

Shared insights return the same cached insight payload as the owner.

## Endpoints
- `GET /shared/:userId/insights/glucose` (requires glucose permission)
- `GET /shared/:userId/insights/meals` (requires meals permission)
- `GET /shared/:userId/insights/water` (requires water permission)
- `POST /shared/:userId/insights/summary` (requires a valid share entry)

Shared summary output is permission-trimmed. A section is included only if:
- it is requested in `include`
- and the caller has that domain permission

## Shared Summary Body
```json
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "include": {
    "glucose": true,
    "symptoms": true,
    "meals": true,
    "documents": true
  }
}
```

Response:
```json
{
  "url": "https://<bucket>.s3.<region>.amazonaws.com/uploads/summaries/summary-1707205432123.pdf"
}
```
