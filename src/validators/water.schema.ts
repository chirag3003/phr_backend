import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

export const waterSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  dateRecorded: z.coerce.date(),
  glasses: z.number().int().min(0).max(50),
});

export type Water = z.infer<typeof waterSchema>;

export const createWaterSchema = waterSchema.omit({ _id: true, userId: true });

export const updateWaterSchema = createWaterSchema.partial();

export type CreateWaterInput = z.infer<typeof createWaterSchema>;
export type UpdateWaterInput = z.infer<typeof updateWaterSchema>;
