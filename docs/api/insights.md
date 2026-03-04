# Insights API

Base path: `/insights`

All endpoints require `Authorization: Bearer <jwt>`.

## GET `/insights/meals`
Returns AI-generated meal insights.

## GET `/insights/glucose`
Returns AI-generated glucose insights.

## POST `/insights/summary`
Generates a PDF health summary and returns a public S3 URL.

## GET `/insights/water`
Returns AI-generated water intake insights.

## Caching
Insights are cached per user per UTC day.

## GET `/shared/:userId/insights/glucose`
Returns cached glucose insights for a shared user (requires glucose permission).

## GET `/shared/:userId/insights/water`
Returns cached water insights for a shared user (requires water permission).

Request body:
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
