import { z } from 'zod';

export const familySchema = z.object({
  _id: z.string(),
  name: z.string(),
  admin: z.string(),
  members: z.array(z.string())
});

export type Family = z.infer<typeof familySchema>;

export const updateFamilySchema = familySchema.partial();

export type FamilyUpdateInput = z.infer<typeof updateFamilySchema>;

export const createFamilySchema = familySchema.omit({
  _id: true,
});

export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
