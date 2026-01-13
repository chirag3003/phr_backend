import { z } from 'zod';

export const symptomSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  symptomName: z.string().min(1).max(100),
  intensity: z.enum(['Low', 'Medium', 'High', 'Severe']),
  dateRecorded: z.coerce.date(),
  time: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
  }),
  notes: z.string().max(500).optional(),
});

export type Symptom = z.infer<typeof symptomSchema>;

export const symptomUpdateSchema = symptomSchema.partial();

export type SymptomUpdateInput = z.infer<typeof symptomUpdateSchema>;

export const createSymptomSchema = symptomSchema.omit({
  userId: true,
  _id: true,
});

export type CreateSymptomInput = z.infer<typeof createSymptomSchema>;
