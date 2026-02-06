import { createWorker } from "tesseract.js";
import path from "path";
import fs from "fs";
import type { IDocument } from "../models/document";
import OpenAI from "openai";
import type { SummaryData } from "../validators/summary.validator";

export class AiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateHealthSummary(data: SummaryData): Promise<string> {
        try {
            const documentText = await this.extractTextFromDocuments(data.documents);
            const prompt = this.createPrompt(data, documentText);

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an empathetic and professional medical assistant. Your task is to summarize a patient's health data into a concise, easy-to-read executive summary for a doctor. Focus on trends, abnormal values, and key observations. \n\nIMPORTANT FORMATTING RULES:\n- Do NOT use markdown symbols like **bold** (asterisks) or ## headers.\n- Use plain text only.\n- Use simple dashes (-) for lists if needed.\n- Keep it under 200 words."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
            });

            return response.choices[0]?.message?.content || "Unable to generate summary at this time.";
        } catch (error) {
            console.error("Error generating AI summary:", error);
            return "AI Summary unavailable due to an error.";
        }
    }

    private async extractTextFromDocuments(documents: IDocument[]): Promise<string> {
        if (documents.length === 0) return "";

        let ocrResults = "\nSuccessfully Extracted Text from Documents:\n";
        const worker = await createWorker("eng"); // Create worker once

        for (const doc of documents) {
            // Only process images
            if (!doc.fileUrl.match(/\.(jpg|jpeg|png|bmp|webp)$/i)) {
                continue;
            }

            try {
                // Resolve path: assumes fileUrl is relative e.g. /uploads/file.png or http...
                let imagePath = doc.fileUrl;
                if (doc.fileUrl.startsWith("/")) {
                    // It's likely a local path relative to project root or public dir
                    // Our setup puts uploads in standard root 'uploads' usually
                    const possiblePath = path.join(process.cwd(), doc.fileUrl);
                    if (fs.existsSync(possiblePath)) {
                        imagePath = possiblePath;
                    } else if (doc.fileUrl.startsWith("/uploads/")) {
                        // Try without leading slash if strictly in root
                        imagePath = path.join(process.cwd(), doc.fileUrl.substring(1));
                    }
                }

                const ret = await worker.recognize(imagePath);
                const text = ret.data.text.replace(/\s+/g, " ").trim();

                if (text.length > 5) {
                    ocrResults += `\n[Document: ${doc.title} (${doc.documentType})]: ${text.substring(0, 500)}...\n`;
                }
            } catch (err) {
                console.warn(`OCR Failed for ${doc.title}:`, err);
            }
        }

        await worker.terminate();
        return ocrResults;
    }

    private createPrompt(data: SummaryData, documentText: string): string {
        const { profile, glucose, symptoms, meals } = data;

        let prompt = `Patient Profile:
    Name: ${profile?.firstName} ${profile?.lastName}
    Age: ${profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : "N/A"}
    Sex: ${profile?.sex}
    Diabetes Type: ${profile?.diabetesType}
    `;

        if (glucose.length > 0) {
            const latest = glucose[0];
            const avg = glucose.reduce((sum, g) => sum + g.value, 0) / glucose.length;
            if (latest) {
                prompt += `\nGlucose Data (${glucose.length} readings):
      Latest: ${latest.value} ${latest.unit} (${latest.mealContext})
      Average: ${avg.toFixed(1)}
      Range: ${glucose[glucose.length - 1]?.dateRecorded} to ${latest.dateRecorded}
      `;
            }
        }

        if (symptoms.length > 0) {
            prompt += `\nRecent Symptoms (${symptoms.length} entries):
      ${symptoms.slice(0, 5).map(s => `- ${s.symptomName} (${s.intensity}) on ${s.dateRecorded}`).join("\n")}
      `;
        }

        // Add OCR Text
        if (documentText) {
            prompt += `\n${documentText}`;
        }

        return prompt;
    }
}
