import { z } from "zod";

export const uploadSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().min(0),
  url: z.string().url(),
});

export type Upload = z.infer<typeof uploadSchema>;

export const uploadResponseSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimetype: z.string(),
  size: z.number(),
  url: z.string(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
