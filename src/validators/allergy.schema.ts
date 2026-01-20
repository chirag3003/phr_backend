import { z } from "zod";

export const allergySchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  severity: z.enum(["Low", "Medium", "Moderate", "High"]),
  notes: z.string().max(500).optional(),
});

export type Allergy = z.infer<typeof allergySchema>;

export const updateAllergySchema = allergySchema.partial();

export type AllergyUpdateInput = z.infer<typeof updateAllergySchema>;

export const createAllergySchema = allergySchema.omit({
  userId: true,
  _id: true,
});

export type CreateAllergyInput = z.infer<typeof createAllergySchema>;

