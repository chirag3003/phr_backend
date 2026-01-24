import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Schema for meal insights response
const mealInsightsSchema = z.object({
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(["positive", "warning", "info"]),
  })),
  tips: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  summary: z.string(),
});

// Schema for glucose insights response
const glucoseInsightsSchema = z.object({
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(["positive", "warning", "info", "critical"]),
  })),
  patterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.string(),
    recommendation: z.string(),
  })),
  tips: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })),
  summary: z.string(),
});

export type MealInsights = z.infer<typeof mealInsightsSchema>;
export type GlucoseInsights = z.infer<typeof glucoseInsightsSchema>;

interface UserProfile {
  firstName?: string;
  lastName?: string;
  dob?: Date;
  sex?: string;
  diabetesType?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
}

interface UserAllergy {
  name: string;
  severity: string;
  notes?: string;
}

interface UserMeal {
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  dateRecorded: Date;
  time: string;
}

interface UserSymptom {
  symptomName: string;
  intensity: string;
  dateRecorded: Date;
  time: { hour: number; minute: number };
  notes?: string;
}

interface UserGlucose {
  value: number;
  unit: string;
  dateRecorded: Date;
  time: { hour: number; minute: number };
  mealContext?: string;
  notes?: string;
}

interface UserData {
  profile: UserProfile | null;
  allergies: UserAllergy[];
  meals: UserMeal[];
  symptoms: UserSymptom[];
  glucoseReadings: UserGlucose[];
}

async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json() as any;
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return content;
}

export async function generateMealInsights(userData: UserData): Promise<MealInsights> {
  const systemPrompt = `You are a nutrition expert AI assistant specialized in diabetes management. 
You analyze meal data and provide personalized insights and tips for people with diabetes.
Always return valid JSON matching the exact schema provided. Be encouraging but honest.
Focus on actionable advice that helps manage blood sugar levels through diet.`;

  const recentMeals = userData.meals.slice(0, 20); // Last 20 meals
  const recentGlucose = userData.glucoseReadings.slice(0, 10); // Recent glucose for context

  const prompt = `Analyze this diabetes patient's meal data and provide insights and tips.

PATIENT PROFILE:
${userData.profile ? `
- Diabetes Type: ${userData.profile.diabetesType || "Not specified"}
- Age: ${userData.profile.dob ? calculateAge(userData.profile.dob) : "Unknown"}
- Sex: ${userData.profile.sex || "Not specified"}
- Height: ${userData.profile.height || "Unknown"} cm
- Weight: ${userData.profile.weight || "Unknown"} kg
- BMI: ${userData.profile.height && userData.profile.weight ? calculateBMI(userData.profile.height, userData.profile.weight) : "Unknown"}
` : "No profile data available"}

ALLERGIES:
${userData.allergies.length > 0 ? userData.allergies.map(a => `- ${a.name} (${a.severity})`).join("\n") : "None reported"}

RECENT MEALS (Last ${recentMeals.length}):
${recentMeals.length > 0 ? recentMeals.map(m => 
  `- ${m.name} (${m.type}): ${m.calories} cal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fiber}g fiber - ${new Date(m.dateRecorded).toLocaleDateString()}`
).join("\n") : "No meals recorded"}

RECENT GLUCOSE READINGS:
${recentGlucose.length > 0 ? recentGlucose.map(g => 
  `- ${g.value} ${g.unit} (${g.mealContext || "Random"}) - ${new Date(g.dateRecorded).toLocaleDateString()}`
).join("\n") : "No glucose readings"}

RECENT SYMPTOMS:
${userData.symptoms.slice(0, 5).map(s => `- ${s.symptomName} (${s.intensity}) - ${new Date(s.dateRecorded).toLocaleDateString()}`).join("\n") || "None reported"}

Return ONLY valid JSON with this exact structure:
{
  "insights": [
    { "title": "Short insight title", "description": "Detailed explanation", "type": "positive|warning|info" }
  ],
  "tips": [
    { "title": "Tip title", "description": "Actionable advice", "priority": "high|medium|low" }
  ],
  "summary": "Brief overall summary of meal patterns and health status"
}

Provide 3-5 insights and 3-5 tips. Focus on:
- Carbohydrate patterns and their impact on blood sugar
- Protein and fiber intake for blood sugar stability
- Meal timing patterns
- Foods that may be beneficial or harmful for their diabetes type
- Correlation between meals and any symptoms`;

  const content = await callOpenAI(prompt, systemPrompt);
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return mealInsightsSchema.parse(parsed);
}

export async function generateGlucoseInsights(userData: UserData): Promise<GlucoseInsights> {
  const systemPrompt = `You are an expert diabetes care AI assistant. 
You analyze blood glucose patterns and provide personalized insights for diabetes management.
Always return valid JSON matching the exact schema provided. 
Focus on identifying patterns, potential issues, and actionable recommendations.
Be encouraging but flag any concerning patterns that need attention.`;

  const recentGlucose = userData.glucoseReadings.slice(0, 30); // Last 30 readings
  const recentMeals = userData.meals.slice(0, 15); // Recent meals for correlation
  const recentSymptoms = userData.symptoms.slice(0, 10);

  // Calculate some basic stats
  const glucoseValues = recentGlucose.map(g => g.value);
  const avgGlucose = glucoseValues.length > 0 ? Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length) : 0;
  const minGlucose = glucoseValues.length > 0 ? Math.min(...glucoseValues) : 0;
  const maxGlucose = glucoseValues.length > 0 ? Math.max(...glucoseValues) : 0;
  const inRange = glucoseValues.filter(v => v >= 70 && v <= 180).length;
  const belowRange = glucoseValues.filter(v => v < 70).length;
  const aboveRange = glucoseValues.filter(v => v > 180).length;

  const prompt = `Analyze this diabetes patient's glucose data and provide insights, patterns, and tips.

PATIENT PROFILE:
${userData.profile ? `
- Diabetes Type: ${userData.profile.diabetesType || "Not specified"}
- Age: ${userData.profile.dob ? calculateAge(userData.profile.dob) : "Unknown"}
- Sex: ${userData.profile.sex || "Not specified"}
- Height: ${userData.profile.height || "Unknown"} cm
- Weight: ${userData.profile.weight || "Unknown"} kg
- BMI: ${userData.profile.height && userData.profile.weight ? calculateBMI(userData.profile.height, userData.profile.weight) : "Unknown"}
` : "No profile data available"}

GLUCOSE STATISTICS (Last ${recentGlucose.length} readings):
- Average: ${avgGlucose} mg/dL
- Min: ${minGlucose} mg/dL
- Max: ${maxGlucose} mg/dL
- Time in Range (70-180): ${inRange} readings (${recentGlucose.length > 0 ? Math.round(inRange/recentGlucose.length*100) : 0}%)
- Below Range (<70): ${belowRange} readings
- Above Range (>180): ${aboveRange} readings

DETAILED GLUCOSE READINGS:
${recentGlucose.length > 0 ? recentGlucose.map(g => 
  `- ${g.value} ${g.unit} at ${String(g.time.hour).padStart(2, '0')}:${String(g.time.minute).padStart(2, '0')} (${g.mealContext || "Random"}) - ${new Date(g.dateRecorded).toLocaleDateString()}${g.notes ? ` [${g.notes}]` : ""}`
).join("\n") : "No glucose readings"}

RECENT MEALS (for correlation):
${recentMeals.length > 0 ? recentMeals.map(m => 
  `- ${m.name} (${m.type}): ${m.calories} cal, ${m.carbs}g carbs - ${new Date(m.dateRecorded).toLocaleDateString()} at ${m.time}`
).join("\n") : "No meals recorded"}

ALLERGIES:
${userData.allergies.length > 0 ? userData.allergies.map(a => `- ${a.name} (${a.severity})`).join("\n") : "None reported"}

RECENT SYMPTOMS:
${recentSymptoms.length > 0 ? recentSymptoms.map(s => 
  `- ${s.symptomName} (${s.intensity}) at ${String(s.time.hour).padStart(2, '0')}:${String(s.time.minute).padStart(2, '0')} - ${new Date(s.dateRecorded).toLocaleDateString()}`
).join("\n") : "None reported"}

Return ONLY valid JSON with this exact structure:
{
  "insights": [
    { "title": "Short insight title", "description": "Detailed explanation", "type": "positive|warning|info|critical" }
  ],
  "patterns": [
    { "pattern": "Identified pattern name", "frequency": "How often it occurs", "recommendation": "What to do about it" }
  ],
  "tips": [
    { "title": "Tip title", "description": "Actionable advice", "priority": "high|medium|low" }
  ],
  "summary": "Brief overall summary of glucose control status"
}

Provide 3-5 insights, 2-4 patterns, and 3-5 tips. Focus on:
- Time of day patterns (morning highs, overnight lows, etc.)
- Meal-related glucose spikes and their timing
- Hypoglycemia or hyperglycemia episodes
- Correlation between symptoms and glucose levels
- Fasting vs post-meal glucose differences
- Trends over time (improving or worsening control)
- Specific meal types that may be causing spikes`;

  const content = await callOpenAI(prompt, systemPrompt);
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return glucoseInsightsSchema.parse(parsed);
}

function calculateAge(dob: Date): number {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function calculateBMI(heightCm: number, weightKg: number): string {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return bmi.toFixed(1);
}
