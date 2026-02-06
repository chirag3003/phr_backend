# Insights API Documentation

## Overview

AI-powered insights and recommendations for diabetes management. These endpoints analyze user data (profile, meals, glucose readings, symptoms, allergies) and provide personalized insights and tips using GPT-4o-mini.

**Base URL:** `http://localhost:5000`

**Authentication Header:**
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### GET `/insights/meals`

Get AI-generated insights and tips based on the user's meal history, correlated with glucose readings, symptoms, and profile data.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "insights": [
    {
      "title": "High Carb Breakfast Pattern",
      "description": "Your breakfast meals average 65g of carbohydrates, which may contribute to morning glucose spikes.",
      "type": "warning"
    },
    {
      "title": "Good Fiber Intake",
      "description": "Your average fiber intake of 25g per day is excellent for blood sugar management.",
      "type": "positive"
    },
    {
      "title": "Protein Distribution",
      "description": "Consider adding more protein to your lunch meals to help stabilize afternoon glucose levels.",
      "type": "info"
    }
  ],
  "tips": [
    {
      "title": "Balance Your Breakfast Carbs",
      "description": "Try pairing your morning carbohydrates with protein sources like eggs or Greek yogurt to slow glucose absorption.",
      "priority": "high"
    },
    {
      "title": "Add Fiber to Dinner",
      "description": "Include vegetables or legumes with dinner to improve overnight blood sugar stability.",
      "priority": "medium"
    },
    {
      "title": "Consider Meal Timing",
      "description": "Try to maintain consistent meal times to help regulate your body's insulin response.",
      "priority": "low"
    }
  ],
  "summary": "Your meal patterns show good fiber intake but high carbohydrate consumption at breakfast. Focus on balancing macronutrients, especially in morning meals, to improve glucose control."
}
```

---

### POST `/insights/summary`

Generate a comprehensive PDF health summary including an AI-generated overview and aggregated user data (profile, glucose, symptoms, meals, documents).

**Authentication:** Required

**Request Body:**
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

**Response (201 Created):**
```json
{
  "url": "https://phr.chirag.codes/uploads/summary-1707205432123.pdf"
}
```

---

### GET `/insights/glucose`

Get AI-generated insights about glucose patterns, including trend analysis, pattern detection, and personalized recommendations.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "insights": [
    {
      "title": "Morning Glucose Elevated",
      "description": "Your fasting glucose readings average 135 mg/dL, which is above the target range of 70-130 mg/dL.",
      "type": "warning"
    },
    {
      "title": "Good Post-Dinner Control",
      "description": "Your after-dinner readings are consistently within the target range, averaging 145 mg/dL.",
      "type": "positive"
    },
    {
      "title": "Hypoglycemia Risk Detected",
      "description": "You've had 3 readings below 70 mg/dL in the past week. Consider discussing with your healthcare provider.",
      "type": "critical"
    }
  ],
  "patterns": [
    {
      "pattern": "Dawn Phenomenon",
      "frequency": "4 out of 7 mornings",
      "recommendation": "Discuss with your doctor about adjusting evening medication or bedtime snack timing."
    },
    {
      "pattern": "Post-Lunch Spikes",
      "frequency": "Daily after high-carb lunches",
      "recommendation": "Consider reducing carbohydrate portion sizes at lunch or adding a short walk after eating."
    }
  ],
  "tips": [
    {
      "title": "Monitor Fasting Glucose",
      "description": "Take your morning reading before eating or drinking anything to get accurate fasting values.",
      "priority": "high"
    },
    {
      "title": "Pre-Meal Readings",
      "description": "Try taking glucose readings before meals to better understand how different foods affect your levels.",
      "priority": "medium"
    },
    {
      "title": "Keep a Food Diary",
      "description": "Note what you eat alongside glucose readings to identify which foods cause spikes.",
      "priority": "medium"
    }
  ],
  "summary": "Your glucose control shows room for improvement in morning readings, but excellent post-dinner management. Focus on addressing the dawn phenomenon and be aware of occasional low readings."
}
```

---

## Response Schema Details

### Meal Insights Response

| Field | Type | Description |
|-------|------|-------------|
| insights | array | List of meal-related insights |
| insights[].title | string | Short insight title |
| insights[].description | string | Detailed explanation |
| insights[].type | enum | `positive`, `warning`, `info` |
| tips | array | Actionable recommendations |
| tips[].title | string | Tip title |
| tips[].description | string | Actionable advice |
| tips[].priority | enum | `high`, `medium`, `low` |
| summary | string | Overall summary of meal patterns |

### Glucose Insights Response

| Field | Type | Description |
|-------|------|-------------|
| insights | array | List of glucose-related insights |
| insights[].title | string | Short insight title |
| insights[].description | string | Detailed explanation |
| insights[].type | enum | `positive`, `warning`, `info`, `critical` |
| patterns | array | Identified glucose patterns |
| patterns[].pattern | string | Pattern name |
| patterns[].frequency | string | How often it occurs |
| patterns[].recommendation | string | What to do about it |
| tips | array | Actionable recommendations |
| tips[].title | string | Tip title |
| tips[].description | string | Actionable advice |
| tips[].priority | enum | `high`, `medium`, `low` |
| summary | string | Overall summary of glucose control |

---

## Data Used for Analysis

The AI analyzes the following user data to generate insights:

### Profile Data
- Diabetes type (Type 1, Type 2, Gestational, Pre-diabetes)
- Age (calculated from DOB)
- Sex
- Height and weight (BMI calculated)
- Blood type

### Meal Data (Last 20 meals)
- Meal name and type (Breakfast, Lunch, Dinner, Snack)
- Calories, protein, carbs, fiber
- Date and time recorded

### Glucose Data (Last 30 readings)
- Value and unit (mg/dL or mmol/L)
- Date, time, and meal context
- Statistical analysis (average, min, max, time-in-range)

### Symptom Data (Last 10 symptoms)
- Symptom name and intensity
- Date and time recorded
- Correlation with glucose and meals

### Allergy Data
- All user allergies and severity levels

---

## Insight Types

### Meal Insights Types

| Type | Description | UI Suggestion |
|------|-------------|---------------|
| `positive` | Good habits or patterns | Green/success color |
| `warning` | Areas needing attention | Yellow/amber color |
| `info` | Neutral observations | Blue/info color |

### Glucose Insights Types

| Type | Description | UI Suggestion |
|------|-------------|---------------|
| `positive` | Good control patterns | Green/success color |
| `warning` | Elevated or concerning patterns | Yellow/amber color |
| `info` | Neutral observations | Blue/info color |
| `critical` | Immediate attention needed | Red/danger color |

### Priority Levels

| Priority | Description | UI Suggestion |
|----------|-------------|---------------|
| `high` | Most important, act immediately | Prominent display |
| `medium` | Important but not urgent | Normal display |
| `low` | Nice to know | Subtle display |

---

## iOS UIKit Integration

### Swift Models

```swift
// MARK: - Meal Insights

struct MealInsightsResponse: Codable {
    let insights: [MealInsight]
    let tips: [MealTip]
    let summary: String
}

struct MealInsight: Codable {
    let title: String
    let description: String
    let type: InsightType
}

struct MealTip: Codable {
    let title: String
    let description: String
    let priority: TipPriority
}

enum InsightType: String, Codable {
    case positive
    case warning
    case info
}

// MARK: - Glucose Insights

struct GlucoseInsightsResponse: Codable {
    let insights: [GlucoseInsight]
    let patterns: [GlucosePattern]
    let tips: [GlucoseTip]
    let summary: String
}

struct GlucoseInsight: Codable {
    let title: String
    let description: String
    let type: GlucoseInsightType
}

struct GlucosePattern: Codable {
    let pattern: String
    let frequency: String
    let recommendation: String
}

struct GlucoseTip: Codable {
    let title: String
    let description: String
    let priority: TipPriority
}

enum GlucoseInsightType: String, Codable {
    case positive
    case warning
    case info
    case critical
}

enum TipPriority: String, Codable {
    case high
    case medium
    case low
}
```

### Example API Calls

```swift
// Fetch meal insights
func fetchMealInsights() async throws -> MealInsightsResponse {
    let url = URL(string: "\(baseURL)/insights/meals")!
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    
    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(MealInsightsResponse.self, from: data)
}

// Fetch glucose insights
func fetchGlucoseInsights() async throws -> GlucoseInsightsResponse {
    let url = URL(string: "\(baseURL)/insights/glucose")!
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    
    let (data, _) = try await URLSession.shared.data(for: request)
    return try JSONDecoder().decode(GlucoseInsightsResponse.self, from: data)
}
```

### UI Color Mapping

```swift
extension InsightType {
    var color: UIColor {
        switch self {
        case .positive: return .systemGreen
        case .warning: return .systemOrange
        case .info: return .systemBlue
        }
    }
}

extension GlucoseInsightType {
    var color: UIColor {
        switch self {
        case .positive: return .systemGreen
        case .warning: return .systemOrange
        case .info: return .systemBlue
        case .critical: return .systemRed
        }
    }
}

extension TipPriority {
    var color: UIColor {
        switch self {
        case .high: return .systemRed
        case .medium: return .systemOrange
        case .low: return .systemGray
        }
    }
}
```

---

## Error Handling

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to generate meal insights"
}
```

**Possible Error Causes:**
- OpenAI API key not configured
- OpenAI API rate limit exceeded
- Network timeout
- Invalid response from OpenAI

---

## Notes

1. **Response Time**: These endpoints may take 2-5 seconds to respond as they involve AI processing.

2. **Caching**: Consider caching responses on the client side to avoid repeated API calls. Insights don't change frequently.

3. **Minimum Data**: The AI will still provide insights even with limited data, but quality improves with more historical data.

4. **Privacy**: All data is processed securely. User data is sent to OpenAI for analysis but not stored by OpenAI.

5. **Medical Disclaimer**: These insights are for informational purposes only and should not replace professional medical advice.
