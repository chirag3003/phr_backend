import { createWorker } from "tesseract.js";
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
                        content: "You are an empathetic and professional medical assistant. Your task is to summarize a patient's health data into a concise, easy-to-read executive summary for a doctor. Focus on trends, abnormal values, and key observations.\n\nRESPONSE FORMAT (plain text only):\nSummary:\nKey Findings:\nTrends:\nRed Flags:\nSuggested Follow-ups:\nDisclaimer:\n\nIMPORTANT FORMATTING RULES:\n- Do NOT use markdown symbols like **bold** or ## headers.\n- Use plain text only.\n- Use simple dashes (-) for lists if needed.\n- Keep it under 200 words.\n- Always include a Disclaimer line stating this is informational and not a diagnosis."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
            });

            return response.choices[0]?.message?.content || "Unable to generate summary at this time.";
        } catch (error) {
            console.error("Error generating AI summary:", error);
            return "AI Summary unavailable due to an error.";
        }
    }

    private async extractTextFromDocuments(documents: IDocument[]): Promise<string> {
        if (documents.length === 0) return "";

        let ocrResults = "";
        const worker = await createWorker("eng"); // Create worker once

        for (const doc of documents) {
            // Only process images
            if (!doc.fileUrl.match(/\.(jpg|jpeg|png|bmp|webp)$/i)) {
                continue;
            }

            try {
                if (!doc.fileUrl) {
                    continue;
                }

                const response = await fetch(doc.fileUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch document image: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const ret = await worker.recognize(Buffer.from(arrayBuffer));
                const text = ret.data.text.replace(/\s+/g, " ").trim();

                if (text.length > 5) {
                    ocrResults += `\n[Document: ${doc.title || "Untitled"} (${doc.documentType})]: ${text.substring(0, 500)}...\n`;
                }
            } catch (err) {
                console.warn(`OCR Failed for ${doc.title}:`, err);
            }
        }

        await worker.terminate();
        return ocrResults.trim();
    }

    private createPrompt(data: SummaryData, documentText: string): string {
        const { profile, glucose, symptoms, meals, dateRange } = data;
        const safeText = (value?: string | number | null) => (value ? String(value) : "N/A");
        const formatDate = (value?: Date) =>
            value ? new Date(value).toLocaleDateString() : "N/A";

        const sortedGlucose = [...glucose].sort((a, b) => {
            const aDate = new Date(a.dateRecorded).getTime();
            const bDate = new Date(b.dateRecorded).getTime();
            if (aDate !== bDate) return bDate - aDate;
            const aMinutes = a.time ? a.time.hour * 60 + a.time.minute : 0;
            const bMinutes = b.time ? b.time.hour * 60 + b.time.minute : 0;
            return bMinutes - aMinutes;
        });

        const glucoseStats = this.buildGlucoseStats(sortedGlucose);
        const glucoseContext = this.buildGlucoseContextStats(sortedGlucose);
        const glucoseTimeOfDay = this.buildGlucoseTimeOfDayStats(sortedGlucose);
        const mealSummary = this.buildMealSummary(meals);
        const symptomSummary = this.buildSymptomSummary(symptoms);

        let prompt = `Summary Window: ${formatDate(dateRange?.startDate)} to ${formatDate(dateRange?.endDate)}\n\nPatient Profile:\n- Name: ${safeText(profile?.firstName)} ${safeText(profile?.lastName)}\n- Age: ${profile?.dob ? this.calculateAge(profile.dob) : "N/A"}\n- Sex: ${safeText(profile?.sex)}\n- Diabetes Type: ${safeText(profile?.diabetesType)}\n- Height: ${safeText(profile?.height)} cm\n- Weight: ${safeText(profile?.weight)} kg\n- Blood Type: ${safeText(profile?.bloodType)}\n\nGlucose Summary:\n${glucoseStats}\n\nGlucose Context (by meal timing):\n${glucoseContext}\n\nTime-of-Day Patterns:\n${glucoseTimeOfDay}\n\nMeal Summary:\n${mealSummary}\n\nSymptom Summary:\n${symptomSummary}\n`;

        if (documentText) {
            prompt += `\nDocument OCR Notes:\n${documentText}\n`;
        }

        prompt += "\nPlease provide a concise plain-text summary using the requested format. Focus on trends, abnormalities, and actionable follow-ups.";

        return prompt;
    }

    private buildGlucoseStats(glucose: SummaryData["glucose"]) {
        if (glucose.length === 0) {
            return "- No glucose readings in this range.";
        }

        const values = glucose.map((g) => g.value);
        const units = new Set(glucose.map((g) => g.unit));
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const latest = glucose[0];
        const unitLabel = units.size === 1 ? Array.from(units)[0] : "mixed units";

        const inRange = glucose.filter((g) => this.isInRange(g.value, g.unit)).length;
        const belowRange = glucose.filter((g) => this.isBelowRange(g.value, g.unit)).length;
        const aboveRange = glucose.filter((g) => this.isAboveRange(g.value, g.unit)).length;
        const inRangePct = Math.round((inRange / glucose.length) * 100);

        return `- Total readings: ${glucose.length}\n- Latest: ${latest.value} ${latest.unit} (${latest.mealContext || "Unknown"}) on ${new Date(latest.dateRecorded).toLocaleDateString()}\n- Average: ${avg.toFixed(1)} ${unitLabel}\n- Min/Max: ${min} / ${max} ${unitLabel}\n- Time in range: ${inRange} (${inRangePct}%)\n- Below range: ${belowRange}\n- Above range: ${aboveRange}`;
    }

    private buildGlucoseContextStats(glucose: SummaryData["glucose"]) {
        if (glucose.length === 0) {
            return "- No data.";
        }

        const contexts = ["Fasting", "Before Meal", "After Meal", "Bedtime", "Random"] as const;
        const lines = contexts.map((context) => {
            const subset = glucose.filter((g) => g.mealContext === context);
            if (subset.length === 0) {
                return `- ${context}: no readings`;
            }
            const avg = subset.reduce((sum, g) => sum + g.value, 0) / subset.length;
            const units = new Set(subset.map((g) => g.unit));
            const unitLabel = units.size === 1 ? Array.from(units)[0] : "mixed units";
            return `- ${context}: ${subset.length} readings, avg ${avg.toFixed(1)} ${unitLabel}`;
        });

        return lines.join("\n");
    }

    private buildGlucoseTimeOfDayStats(glucose: SummaryData["glucose"]) {
        if (glucose.length === 0) {
            return "- No data.";
        }

        const buckets = [
            { label: "Morning (05-10)", start: 5, end: 10 },
            { label: "Midday (11-15)", start: 11, end: 15 },
            { label: "Evening (16-21)", start: 16, end: 21 },
            { label: "Night (22-04)", start: 22, end: 4 },
        ];

        const lines = buckets.map((bucket) => {
            const subset = glucose.filter((g) => {
                const hour = g.time?.hour ?? 0;
                if (bucket.start <= bucket.end) {
                    return hour >= bucket.start && hour <= bucket.end;
                }
                return hour >= bucket.start || hour <= bucket.end;
            });

            if (subset.length === 0) {
                return `- ${bucket.label}: no readings`;
            }

            const avg = subset.reduce((sum, g) => sum + g.value, 0) / subset.length;
            const units = new Set(subset.map((g) => g.unit));
            const unitLabel = units.size === 1 ? Array.from(units)[0] : "mixed units";
            return `- ${bucket.label}: ${subset.length} readings, avg ${avg.toFixed(1)} ${unitLabel}`;
        });

        return lines.join("\n");
    }

    private buildMealSummary(meals: SummaryData["meals"]) {
        if (meals.length === 0) {
            return "- No meals logged in this range.";
        }

        const types = meals.reduce<Record<string, number>>((acc, meal) => {
            acc[meal.type] = (acc[meal.type] || 0) + 1;
            return acc;
        }, {});

        const avgCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0) / meals.length;
        const avgCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0) / meals.length;
        const avgProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0) / meals.length;
        const avgFiber = meals.reduce((sum, meal) => sum + (meal.fiber || 0), 0) / meals.length;

        const highCarbMeals = meals.filter((meal) => (meal.carbs || 0) >= 45).length;
        const veryHighCarbMeals = meals.filter((meal) => (meal.carbs || 0) >= 60).length;

        const recentMeals = [...meals]
            .sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime())
            .slice(0, 3)
            .map(
                (meal) =>
                    `- ${meal.name} (${meal.type}) ${meal.carbs}g carbs on ${new Date(meal.dateRecorded).toLocaleDateString()}`,
            )
            .join("\n");

        return `- Total meals: ${meals.length}\n- Types: ${Object.entries(types)
            .map(([key, value]) => `${key} (${value})`)
            .join(", ")}\n- Avg calories: ${avgCalories.toFixed(0)}\n- Avg carbs: ${avgCarbs.toFixed(1)}g, protein: ${avgProtein.toFixed(1)}g, fiber: ${avgFiber.toFixed(1)}g\n- High-carb meals (>=45g): ${highCarbMeals}\n- Very high-carb meals (>=60g): ${veryHighCarbMeals}\n- Recent meals:\n${recentMeals}`;
    }

    private buildSymptomSummary(symptoms: SummaryData["symptoms"]) {
        if (symptoms.length === 0) {
            return "- No symptoms recorded in this range.";
        }

        const symptomCounts = symptoms.reduce<Record<string, number>>((acc, symptom) => {
            acc[symptom.symptomName] = (acc[symptom.symptomName] || 0) + 1;
            return acc;
        }, {});

        const intensityCounts = symptoms.reduce<Record<string, number>>((acc, symptom) => {
            acc[symptom.intensity] = (acc[symptom.intensity] || 0) + 1;
            return acc;
        }, {});

        const topSymptoms = Object.entries(symptomCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => `${name} (${count})`)
            .join(", ");

        const recentSymptoms = [...symptoms]
            .sort((a, b) => new Date(b.dateRecorded).getTime() - new Date(a.dateRecorded).getTime())
            .slice(0, 3)
            .map(
                (symptom) =>
                    `- ${symptom.symptomName} (${symptom.intensity}) on ${new Date(symptom.dateRecorded).toLocaleDateString()}`,
            )
            .join("\n");

        return `- Total symptoms: ${symptoms.length}\n- Most frequent: ${topSymptoms || "N/A"}\n- Intensity distribution: ${Object.entries(intensityCounts)
            .map(([key, value]) => `${key} (${value})`)
            .join(", ")}\n- Recent symptoms:\n${recentSymptoms}`;
    }

    private isInRange(value: number, unit: SummaryData["glucose"][number]["unit"]) {
        if (unit === "mmol/L") return value >= 3.9 && value <= 10.0;
        return value >= 70 && value <= 180;
    }

    private isBelowRange(value: number, unit: SummaryData["glucose"][number]["unit"]) {
        if (unit === "mmol/L") return value < 3.9;
        return value < 70;
    }

    private isAboveRange(value: number, unit: SummaryData["glucose"][number]["unit"]) {
        if (unit === "mmol/L") return value > 10.0;
        return value > 180;
    }

    private calculateAge(dob: Date) {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}
