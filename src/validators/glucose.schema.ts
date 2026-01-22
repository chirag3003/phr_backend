import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

const timeSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

export const glucoseSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  value: z.number().min(0).max(1000),
  unit: z.enum(["mg/dL", "mmol/L"]).default("mg/dL"),
  dateRecorded: z.coerce.date(),
  time: timeSchema,
  mealContext: z.enum(["Fasting", "Before Meal", "After Meal", "Bedtime", "Random"]).optional(),
  notes: z.string().max(500).optional(),
});

export const createGlucoseSchema = glucoseSchema.omit({ _id: true, userId: true });

export const updateGlucoseSchema = createGlucoseSchema.partial();

export type Glucose = z.infer<typeof glucoseSchema>;
export type CreateGlucoseInput = z.infer<typeof createGlucoseSchema>;
export type UpdateGlucoseInput = z.infer<typeof updateGlucoseSchema>;
