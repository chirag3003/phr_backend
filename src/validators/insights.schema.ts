import { z } from "zod";

// Meal Insights Schema
export const mealInsightSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(["positive", "warning", "info"]),
});

export const mealTipSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

export const mealInsightsResponseSchema = z.object({
  insights: z.array(mealInsightSchema),
  tips: z.array(mealTipSchema),
  summary: z.string(),
});

export type MealInsight = z.infer<typeof mealInsightSchema>;
export type MealTip = z.infer<typeof mealTipSchema>;
export type MealInsightsResponse = z.infer<typeof mealInsightsResponseSchema>;

// Glucose Insights Schema
export const glucoseInsightSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(["positive", "warning", "info", "critical"]),
});

export const glucosePatternSchema = z.object({
  pattern: z.string(),
  frequency: z.string(),
  recommendation: z.string(),
});

export const glucoseTipSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});

export const glucoseInsightsResponseSchema = z.object({
  insights: z.array(glucoseInsightSchema),
  patterns: z.array(glucosePatternSchema),
  tips: z.array(glucoseTipSchema),
  summary: z.string(),
});

export type GlucoseInsight = z.infer<typeof glucoseInsightSchema>;
export type GlucosePattern = z.infer<typeof glucosePatternSchema>;
export type GlucoseTip = z.infer<typeof glucoseTipSchema>;
export type GlucoseInsightsResponse = z.infer<typeof glucoseInsightsResponseSchema>;

// User Data for Insights Generation
export const userDataForInsightsSchema = z.object({
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    dob: z.coerce.date().optional(),
    sex: z.string().optional(),
    diabetesType: z.string().optional(),
    bloodType: z.string().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
  }).nullable(),
  allergies: z.array(z.object({
    name: z.string(),
    severity: z.string(),
    notes: z.string().optional(),
  })),
  meals: z.array(z.object({
    name: z.string(),
    type: z.string(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fiber: z.number(),
    dateRecorded: z.coerce.date(),
    time: z.string(),
  })),
  symptoms: z.array(z.object({
    symptomName: z.string(),
    intensity: z.string(),
    dateRecorded: z.coerce.date(),
    time: z.object({
      hour: z.number(),
      minute: z.number(),
    }),
    notes: z.string().optional(),
  })),
  glucoseReadings: z.array(z.object({
    value: z.number(),
    unit: z.string(),
    dateRecorded: z.coerce.date(),
    time: z.object({
      hour: z.number(),
      minute: z.number(),
    }),
    mealContext: z.string().optional(),
    notes: z.string().optional(),
  })),
});

export type UserDataForInsights = z.infer<typeof userDataForInsightsSchema>;
