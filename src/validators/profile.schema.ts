import { z } from 'zod';

export const profileSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dob: z.coerce.date(),
  sex: z.enum(['Male', 'Female', 'Other']),
  diabetesType: z.enum(['Type 1', 'Type 2', 'Gestational', 'Pre-diabetes', 'None']),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  height: z.number().min(0).max(300),
  weight: z.number().min(0).max(500),
});

export type Profile = z.infer<typeof profileSchema>;

export const updateProfileSchema = profileSchema.partial();

export type ProfileUpdateInput = z.infer<typeof updateProfileSchema>;

export const createProfileSchema = profileSchema.omit({
  userId: true,
  _id: true,
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
