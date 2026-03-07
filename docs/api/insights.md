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

## GET `/shared/:userId/insights/meals`
Returns cached meal insights for a shared user (requires meals permission).

## GET `/shared/:userId/insights/water`
Returns cached water insights for a shared user (requires water permission).

## POST `/shared/:userId/insights/summary`
Generates a shared user's summary PDF (requires a valid share entry).

Shared summary sections are included only when both the request `include` flag is `true` and the caller has permission for that domain.

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
