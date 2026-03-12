import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

export const stepsSchema = z.object({
  _id: objectIdSchema.optional(),
  userId: objectIdSchema,
  dateRecorded: z.coerce.date(),
  stepCount: z.number().int().min(0),
  source: z.enum(["AppleHealthKit", "GoogleFit", "Manual"]).default("AppleHealthKit"),
  syncedAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

// Schema for bulk sync request - app sends multiple days at once
export const syncStepsRequestSchema = z.object({
  steps: z.array(
    z.object({
      dateRecorded: z.coerce.date(),
      stepCount: z.number().int().min(0),
      source: z.enum(["AppleHealthKit", "GoogleFit", "Manual"]).default("AppleHealthKit"),
      notes: z.string().max(500).optional(),
    })
  ),
});

// Schema for sync response
export const syncStepsResponseSchema = z.object({
  synced: z.number().int().min(0),
  lastSyncDate: z.coerce.date(),
  message: z.string(),
});

// Schema for get last updated response
export const lastUpdatedResponseSchema = z.object({
  lastSyncDate: z.coerce.date().nullable(),
  nextSyncStartDate: z.coerce.date(),
});

// Schema for fetching steps within date range
export const stepsRangeQuerySchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const createStepsSchema = stepsSchema.omit({ _id: true, userId: true, syncedAt: true });

export type Steps = z.infer<typeof stepsSchema>;
export type SyncStepsRequest = z.infer<typeof syncStepsRequestSchema>;
export type SyncStepsResponse = z.infer<typeof syncStepsResponseSchema>;
export type LastUpdatedResponse = z.infer<typeof lastUpdatedResponseSchema>;
export type StepsRangeQuery = z.infer<typeof stepsRangeQuerySchema>;
export type CreateStepsInput = z.infer<typeof createStepsSchema>;
