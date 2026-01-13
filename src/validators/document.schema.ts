import { z } from "zod";

export const documentSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(200),
  documentType: z.enum(["Prescription", "Report", "LabResult", "Other"]),
  fileUrl: z.string().url(),
  fileSize: z.string().max(20).optional(),
  lastUpdatedAt: z.coerce.date(),
});

export type Document = z.infer<typeof documentSchema>;

export const documentUpdateSchema = documentSchema.partial();

export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;

export const createDocumentSchema = documentSchema.omit({
  userId: true,
  _id: true,
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
