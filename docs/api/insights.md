# Insights API

Base path: `/insights`

All endpoints require `Authorization: Bearer <jwt>`.

## GET `/insights/meals`
Returns AI-generated meal insights.

## GET `/insights/glucose`
Returns AI-generated glucose insights. Now includes activity context when step data is available.

## GET `/insights/activity`
Returns AI-generated activity/step insights with correlation analysis.

**Response Example:**
```json
{
  "insights": [
    {
      "title": "Strong Activity-Glucose Correlation",
      "description": "Your glucose readings are 25 mg/dL lower on high activity days (8500+ steps) compared to low activity days.",
      "type": "positive"
    }
  ],
  "patterns": [
    {
      "pattern": "Consistent Weekday Activity",
      "frequency": "Every weekday",
      "recommendation": "Maintain this routine - the regular activity is helping your glucose control"
    }
  ],
  "tips": [
    {
      "title": "Leverage High Activity Days",
      "description": "On days with 10,000+ steps, you can tolerate more carbohydrates with minimal glucose spike",
      "priority": "high"
    }
  ],
  "summary": "Your activity level strongly correlates with better glucose control. Average 8,500 steps/day with improving trend.",
  "averageStepsPerDay": 8500,
  "weeklyTrend": "improving"
}
```

## POST `/insights/summary`
Generates a PDF health summary and returns a public S3 URL. Summary now includes step data and activity insights.

## GET `/insights/water`
Returns AI-generated water intake insights.

## Caching
Insights are cached per user per UTC day.

## GET `/shared/:userId/insights/glucose`
Returns cached glucose insights for a shared user (requires glucose permission).

## GET `/shared/:userId/insights/meals`
Returns cached meal insights for a shared user (requires meals permission).

## GET `/shared/:userId/insights/activity`
Returns cached activity insights for a shared user (requires activity permission).

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

---

## Insights Generation Details

### Meal Insights
Analyzes meal patterns and macronutrient intake. Now considers:
- Carbohydrate patterns and glucose impact
- Protein and fiber for stability
- Meal timing patterns
- **Activity-adjusted carb recommendations** (new)
- Allergies and dietary considerations

### Glucose Insights
Analyzes blood glucose patterns and control. Now includes:
- Time-of-day patterns
- Meal-related glucose spikes
- Hypoglycemia/hyperglycemia episodes
- Symptom correlation
- **Activity impact on glucose stability** (new)
- Weekly trends and long-term control

### Activity Insights (New)
Analyzes step data and physical activity patterns:
- Daily activity consistency
- High vs low activity day comparison
- Glucose correlation with activity levels
- Weekly activity trends
- Step count patterns (weekdays vs weekends)
- Activity-adjusted health recommendations

### Water Insights
Analyzes hydration patterns:
- Consistency of daily intake
- Low-intake alert days
- Actionable hydration routines

---

## AI Model
All insights use OpenAI gpt-5-nano model with specialized prompts for diabetes management.

