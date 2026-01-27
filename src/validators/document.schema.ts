import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

// Base document schema
export const documentSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  documentType: z.enum(["Prescription", "Report"]),
  // For Prescriptions - doctor reference
  docDoctorId: objectIdSchema.optional(),
  // For Reports - title
  title: z.string().min(1).max(200).optional(),
  // Common fields
  date: z.coerce.date(),
  fileUrl: z.string().url(),
  fileSize: z.string().max(20).optional(),
});

export type Document = z.infer<typeof documentSchema>;

// Create schema for Prescription
export const createPrescriptionSchema = z.object({
  documentType: z.literal("Prescription"),
  docDoctorId: objectIdSchema,
  date: z.coerce.date(),
  fileUrl: z.string().url(),
  fileSize: z.string().max(20).optional(),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;

// Create schema for Report
export const createReportSchema = z.object({
  documentType: z.literal("Report"),
  title: z.string().min(1).max(200),
  date: z.coerce.date(),
  fileUrl: z.string().url(),
  fileSize: z.string().max(20).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// Union type for creating any document
export const createDocumentSchema = z.discriminatedUnion("documentType", [
  createPrescriptionSchema,
  createReportSchema,
]);

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

// Update schema
export const updateDocumentSchema = z.object({
  documentType: z.enum(["Prescription", "Report"]).optional(),
  docDoctorId: objectIdSchema.optional(),
  title: z.string().min(1).max(200).optional(),
  date: z.coerce.date().optional(),
  fileUrl: z.string().url().optional(),
  fileSize: z.string().max(20).optional(),
});

export type DocumentUpdateInput = z.infer<typeof updateDocumentSchema>;
