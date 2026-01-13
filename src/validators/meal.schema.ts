import { z } from 'zod';

export const mealSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  detail: z.string().max(500).optional(),
  type: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  mealImage: z.string().url().optional(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fiber: z.number().min(0),
  dateRecorded: z.coerce.date(),
  time: z.string().min(1).max(10),
  addedBy: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
});

export type MealInput = z.infer<typeof mealSchema>;

export const mealUpdateSchema = mealSchema.partial();

export type MealUpdateInput = z.infer<typeof mealUpdateSchema>;

export const createMealSchema = mealSchema.omit({
  userId: true,
  _id: true,
});

export type CreateMealInput = z.infer<typeof createMealSchema>;
