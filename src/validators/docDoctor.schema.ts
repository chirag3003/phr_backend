import { z } from "zod";

export const docDoctorSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
});

export type DocDoctor = z.infer<typeof docDoctorSchema>;

export const updateDocDoctorSchema = docDoctorSchema
  .omit({ userId: true })
  .partial();

export type updateDocDoctorInput = z.infer<typeof updateDocDoctorSchema>;

export const createDocDoctorSchema = docDoctorSchema.omit({
  userId: true,
  _id: true,
});

export type CreateDocDoctorInput = z.infer<typeof createDocDoctorSchema>;
