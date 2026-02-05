import { z } from "zod";
import type { IProfile } from "../models/profile";
import type { IGlucose } from "../models/glucose";
import type { IMeal } from "../models/meal";
import type { ISymptom } from "../models/symptom";
import type { IDocument } from "../models/document";

export const summaryRequestSchema = z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    include: z.object({
        glucose: z.boolean().default(true),
        symptoms: z.boolean().default(true),
        meals: z.boolean().default(true),
        documents: z.boolean().default(true),
    }),
});

export type SummaryRequest = z.infer<typeof summaryRequestSchema>;

export interface SummaryData {
    profile: IProfile | null;
    glucose: IGlucose[];
    symptoms: ISymptom[];
    meals: IMeal[];
    documents: IDocument[];
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}
