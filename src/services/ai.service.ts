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
            const prompt = this.createPrompt(data);

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an empathetic and professional medical assistant. Your task is to summarize a patient's health data into a concise, easy-to-read executive summary for a doctor. Focus on trends, abnormal values, and key observations. Do not give medical advice, but highlight areas that might need attention. Keep it under 200 words."
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

    private createPrompt(data: SummaryData): string {
        const { profile, glucose, symptoms, meals, documents } = data;

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

        if (documents.length > 0) {
            prompt += `\nAttached Documents:
        ${documents.map(d => `- ${d.title} (${d.documentType})`).join("\n")}
        `;
        }

        return prompt;
    }
}
