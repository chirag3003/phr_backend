import {
  mealInsightsResponseSchema,
  glucoseInsightsResponseSchema,
  waterInsightsResponseSchema,
  activityInsightsResponseSchema,
  type MealInsightsResponse,
  type GlucoseInsightsResponse,
  type WaterInsightsResponse,
  type ActivityInsightsResponse,
  type UserDataForInsights,
} from "../validators";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as any;
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return content;
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

export async function generateMealInsights(userData: UserDataForInsights): Promise<MealInsightsResponse> {
  const systemPrompt = `You are a nutrition expert AI assistant specialized in diabetes management. 
You analyze meal data and provide personalized insights and tips for people with diabetes.
Always return valid JSON matching the exact schema provided. Be encouraging but honest.
Focus on actionable advice that helps manage blood sugar levels through diet.`;

  const recentMeals = userData.meals.slice(0, 20);
  const recentGlucose = userData.glucoseReadings.slice(0, 10);
  const recentSteps = userData.stepRecords?.slice(0, 20) || [];

  // Calculate average daily steps
  const stepCounts = recentSteps.map((s) => s.stepCount);
  const avgDailySteps = stepCounts.length > 0 ? Math.round(stepCounts.reduce((a, b) => a + b, 0) / stepCounts.length) : 0;

  const prompt = `Analyze this diabetes patient's meal data and provide insights and tips.

PATIENT PROFILE:
${
  userData.profile
    ? `
- Diabetes Type: ${userData.profile.diabetesType || "Not specified"}
- Age: ${userData.profile.dob ? calculateAge(userData.profile.dob) : "Unknown"}
- Sex: ${userData.profile.sex || "Not specified"}
- Height: ${userData.profile.height || "Unknown"} cm
- Weight: ${userData.profile.weight || "Unknown"} kg
- BMI: ${userData.profile.height && userData.profile.weight ? calculateBMI(userData.profile.height, userData.profile.weight) : "Unknown"}
`
    : "No profile data available"
}

ALLERGIES:
${userData.allergies.length > 0 ? userData.allergies.map((a) => `- ${a.name} (${a.severity})`).join("\n") : "None reported"}

RECENT MEALS (Last ${recentMeals.length}):
${
  recentMeals.length > 0
    ? recentMeals
        .map(
          (m) =>
            `- ${m.name} (${m.type}): ${m.calories} cal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fiber}g fiber - ${new Date(m.dateRecorded).toLocaleDateString()}`
        )
        .join("\n")
    : "No meals recorded"
}

RECENT GLUCOSE READINGS:
${
  recentGlucose.length > 0
    ? recentGlucose
        .map((g) => `- ${g.value} ${g.unit} (${g.mealContext || "Random"}) - ${new Date(g.dateRecorded).toLocaleDateString()}`)
        .join("\n")
    : "No glucose readings"
}

${
  avgDailySteps > 0
    ? `ACTIVITY DATA (Average daily steps: ${avgDailySteps}):
Note: Higher daily activity (${avgDailySteps}+ steps) allows for more flexible carbohydrate intake and improved glucose tolerance.
Consider adjusting meal portions based on activity level for better glucose management.`
    : ""
}

RECENT SYMPTOMS:
${userData.symptoms.slice(0, 5).map((s) => `- ${s.symptomName} (${s.intensity}) - ${new Date(s.dateRecorded).toLocaleDateString()}`).join("\n") || "None reported"}

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

Provide max 3 insights and max 3 tips and return empty array if nothing is found. Focus on:
- Carbohydrate patterns and their impact on blood sugar
- Protein and fiber intake for blood sugar stability
- Meal timing patterns
- Foods that may be beneficial or harmful for their diabetes type
- Correlation between meals and any symptoms
- Activity-adjusted carbohydrate recommendations (if activity data available)`;

  const content = await callOpenAI(prompt, systemPrompt);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return mealInsightsResponseSchema.parse(parsed);
}

export async function generateGlucoseInsights(userData: UserDataForInsights): Promise<GlucoseInsightsResponse> {
  const systemPrompt = `You are an expert diabetes care AI assistant. 
You analyze blood glucose patterns and provide personalized insights for diabetes management.
Always return valid JSON matching the exact schema provided. 
Focus on identifying patterns, potential issues, and actionable recommendations.
Be encouraging but flag any concerning patterns that need attention.`;

  const recentGlucose = userData.glucoseReadings.slice(0, 30);
  const recentMeals = userData.meals.slice(0, 15);
  const recentSymptoms = userData.symptoms.slice(0, 10);
  const recentSteps = userData.stepRecords?.slice(0, 30) || [];

  const glucoseValues = recentGlucose.map((g) => g.value);
  const avgGlucose = glucoseValues.length > 0 ? Math.round(glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length) : 0;
  const minGlucose = glucoseValues.length > 0 ? Math.min(...glucoseValues) : 0;
  const maxGlucose = glucoseValues.length > 0 ? Math.max(...glucoseValues) : 0;
  const inRange = glucoseValues.filter((v) => v >= 70 && v <= 180).length;
  const belowRange = glucoseValues.filter((v) => v < 70).length;
  const aboveRange = glucoseValues.filter((v) => v > 180).length;

  const prompt = `Analyze this diabetes patient's glucose data and provide insights, patterns, and tips.

PATIENT PROFILE:
${
  userData.profile
    ? `
- Diabetes Type: ${userData.profile.diabetesType || "Not specified"}
- Age: ${userData.profile.dob ? calculateAge(userData.profile.dob) : "Unknown"}
- Sex: ${userData.profile.sex || "Not specified"}
- Height: ${userData.profile.height || "Unknown"} cm
- Weight: ${userData.profile.weight || "Unknown"} kg
- BMI: ${userData.profile.height && userData.profile.weight ? calculateBMI(userData.profile.height, userData.profile.weight) : "Unknown"}
`
    : "No profile data available"
}

GLUCOSE STATISTICS (Last ${recentGlucose.length} readings):
- Average: ${avgGlucose} mg/dL
- Min: ${minGlucose} mg/dL
- Max: ${maxGlucose} mg/dL
- Time in Range (70-180): ${inRange} readings (${recentGlucose.length > 0 ? Math.round((inRange / recentGlucose.length) * 100) : 0}%)
- Below Range (<70): ${belowRange} readings
- Above Range (>180): ${aboveRange} readings

DETAILED GLUCOSE READINGS:
${
  recentGlucose.length > 0
    ? recentGlucose
        .map(
          (g) =>
            `- ${g.value} ${g.unit} at ${String(g.time.hour).padStart(2, "0")}:${String(g.time.minute).padStart(2, "0")} (${g.mealContext || "Random"}) - ${new Date(g.dateRecorded).toLocaleDateString()}${g.notes ? ` [${g.notes}]` : ""}`
        )
        .join("\n")
    : "No glucose readings"
}

RECENT MEALS (for correlation):
${
  recentMeals.length > 0
    ? recentMeals
        .map((m) => `- ${m.name} (${m.type}): ${m.calories} cal, ${m.carbs}g carbs - ${new Date(m.dateRecorded).toLocaleDateString()} at ${m.time}`)
        .join("\n")
    : "No meals recorded"
}

${
  recentSteps.length > 0
    ? `ACTIVITY DATA (Last ${recentSteps.length} days):
${recentSteps.map((s) => `- ${new Date(s.dateRecorded).toLocaleDateString()}: ${s.stepCount} steps`).join("\n")}

Note: Higher activity levels can lower glucose spikes and improve overall glucose stability.`
    : ""
}

ALLERGIES:
${userData.allergies.length > 0 ? userData.allergies.map((a) => `- ${a.name} (${a.severity})`).join("\n") : "None reported"}

RECENT SYMPTOMS:
${
  recentSymptoms.length > 0
    ? recentSymptoms
        .map(
          (s) =>
            `- ${s.symptomName} (${s.intensity}) at ${String(s.time.hour).padStart(2, "0")}:${String(s.time.minute).padStart(2, "0")} - ${new Date(s.dateRecorded).toLocaleDateString()}`
        )
        .join("\n")
    : "None reported"
}

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

Provide max 2 insights, max 2 patterns, and max 2 tips. Focus on:
- Time of day patterns (morning highs, overnight lows, etc.)
- Meal-related glucose spikes and their timing
- Hypoglycemia or hyperglycemia episodes
- Correlation between symptoms and glucose levels
- Fasting vs post-meal glucose differences
- Trends over time (improving or worsening control)
- Specific meal types that may be causing spikes
- Impact of activity level on glucose stability (if activity data available)`;

  const content = await callOpenAI(prompt, systemPrompt);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return glucoseInsightsResponseSchema.parse(parsed);
}

export async function generateWaterInsights(
  data: { profile: UserDataForInsights["profile"]; waterRecords: UserDataForInsights["waterRecords"] }
): Promise<WaterInsightsResponse> {
  const systemPrompt = `You are a hydration coach focused on diabetes-friendly wellness. 
You analyze daily water intake and provide concise, actionable insights.
Always return valid JSON matching the exact schema provided. Be encouraging and practical.`;

  const recentWater = data.waterRecords.slice(0, 30);
  const avgGlasses =
    recentWater.length > 0
      ? Math.round(recentWater.reduce((sum, w) => sum + w.glasses, 0) / recentWater.length)
      : 0;
  const maxGlasses = recentWater.length > 0 ? Math.max(...recentWater.map((w) => w.glasses)) : 0;
  const minGlasses = recentWater.length > 0 ? Math.min(...recentWater.map((w) => w.glasses)) : 0;

  const prompt = `Analyze this patient's water intake data and provide insights and tips.

PATIENT PROFILE:
${
  data.profile
    ? `
- Age: ${data.profile.dob ? calculateAge(data.profile.dob) : "Unknown"}
- Sex: ${data.profile.sex || "Not specified"}
- Height: ${data.profile.height || "Unknown"} cm
- Weight: ${data.profile.weight || "Unknown"} kg
`
    : "No profile data available"
}

WATER INTAKE (Last ${recentWater.length} days):
${
  recentWater.length > 0
    ? recentWater
        .map((w) => `- ${new Date(w.dateRecorded).toLocaleDateString()}: ${w.glasses} glasses`)
        .join("\n")
    : "No water records"
}

SUMMARY STATS:
- Average glasses/day: ${avgGlasses}
- Min/Max glasses/day: ${minGlasses} / ${maxGlasses}

Return ONLY valid JSON with this exact structure:
{
  "insights": [
    { "title": "Short insight title", "description": "Detailed explanation", "type": "positive|warning|info" }
  ],
  "tips": [
    { "title": "Tip title", "description": "Actionable advice", "priority": "high|medium|low" }
  ],
  "summary": "Brief overall summary of hydration patterns"
}

Provide max 3 insights and max 3 tips and return empty arrays if nothing is found. Focus on:
- Consistency of daily intake
- Low-intake days and streaks
- Actionable routines to improve hydration`;

  const content = await callOpenAI(prompt, systemPrompt);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return waterInsightsResponseSchema.parse(parsed);
}

export async function generateActivityInsights(userData: UserDataForInsights): Promise<ActivityInsightsResponse> {
  const systemPrompt = `You are an activity and wellness coach specialized in diabetes management. 
You analyze physical activity patterns (step counts) and correlate them with glucose control and meal patterns.
Always return valid JSON matching the exact schema provided.
Focus on how physical activity impacts blood sugar management and provide actionable recommendations.`;

  const recentSteps = userData.stepRecords?.slice(0, 30) || [];
  const recentGlucose = userData.glucoseReadings.slice(0, 20);
  const recentMeals = userData.meals.slice(0, 15);

  // Calculate activity statistics
  const stepCounts = recentSteps.map((s) => s.stepCount);
  const avgSteps = stepCounts.length > 0 ? Math.round(stepCounts.reduce((a, b) => a + b, 0) / stepCounts.length) : 0;
  const maxSteps = stepCounts.length > 0 ? Math.max(...stepCounts) : 0;
  const minSteps = stepCounts.length > 0 ? Math.min(...stepCounts) : 0;

  // Calculate average glucose on high activity vs low activity days
  const highActivityThreshold = avgSteps * 1.2; // 20% above average
  const lowActivityThreshold = avgSteps * 0.8; // 20% below average

  const highActivityDays = recentSteps
    .filter((s) => s.stepCount >= highActivityThreshold)
    .map((s) => new Date(s.dateRecorded).toDateString());

  const lowActivityDays = recentSteps
    .filter((s) => s.stepCount <= lowActivityThreshold)
    .map((s) => new Date(s.dateRecorded).toDateString());

  const highActivityGlucose = recentGlucose
    .filter((g) => highActivityDays.includes(new Date(g.dateRecorded).toDateString()))
    .map((g) => g.value);

  const lowActivityGlucose = recentGlucose
    .filter((g) => lowActivityDays.includes(new Date(g.dateRecorded).toDateString()))
    .map((g) => g.value);

  const avgGlucoseHighActivity = highActivityGlucose.length > 0 ? Math.round(highActivityGlucose.reduce((a, b) => a + b, 0) / highActivityGlucose.length) : 0;
  const avgGlucoseLowActivity = lowActivityGlucose.length > 0 ? Math.round(lowActivityGlucose.reduce((a, b) => a + b, 0) / lowActivityGlucose.length) : 0;

  const prompt = `Analyze this diabetes patient's physical activity data and provide insights about how activity affects their health.

PATIENT PROFILE:
${
  userData.profile
    ? `
- Diabetes Type: ${userData.profile.diabetesType || "Not specified"}
- Age: ${userData.profile.dob ? calculateAge(userData.profile.dob) : "Unknown"}
- Sex: ${userData.profile.sex || "Not specified"}
- Height: ${userData.profile.height || "Unknown"} cm
- Weight: ${userData.profile.weight || "Unknown"} kg
- BMI: ${userData.profile.height && userData.profile.weight ? calculateBMI(userData.profile.height, userData.profile.weight) : "Unknown"}
`
    : "No profile data available"
}

ACTIVITY STATISTICS (Last ${recentSteps.length} days):
- Average steps/day: ${avgSteps}
- Max steps/day: ${maxSteps}
- Min steps/day: ${minSteps}
- High activity days (${highActivityThreshold}+ steps): ${highActivityDays.length} days
- Low activity days (${lowActivityThreshold} or fewer steps): ${lowActivityDays.length} days

GLUCOSE CORRELATION:
- Average glucose on high activity days: ${avgGlucoseHighActivity} mg/dL (${highActivityGlucose.length} readings)
- Average glucose on low activity days: ${avgGlucoseLowActivity} mg/dL (${lowActivityGlucose.length} readings)
- Difference: ${Math.abs(avgGlucoseHighActivity - avgGlucoseLowActivity)} mg/dL (${avgGlucoseHighActivity < avgGlucoseLowActivity ? "activity helpful" : "activity may need adjustment"})

RECENT ACTIVITY DATA (Last ${recentSteps.length} days):
${
  recentSteps.length > 0
    ? recentSteps
        .map((s) => `- ${new Date(s.dateRecorded).toLocaleDateString()}: ${s.stepCount} steps (${s.source})`)
        .join("\n")
    : "No step data recorded"
}

RECENT GLUCOSE READINGS:
${
  recentGlucose.length > 0
    ? recentGlucose
        .map((g) => `- ${g.value} ${g.unit} - ${new Date(g.dateRecorded).toLocaleDateString()}`)
        .join("\n")
    : "No glucose readings"
}

Return ONLY valid JSON with this exact structure:
{
  "insights": [
    { "title": "Short insight title", "description": "Detailed explanation", "type": "positive|warning|info" }
  ],
  "patterns": [
    { "pattern": "Identified activity pattern", "frequency": "How often it occurs", "recommendation": "What to do about it" }
  ],
  "tips": [
    { "title": "Tip title", "description": "Actionable advice", "priority": "high|medium|low" }
  ],
  "summary": "Brief overall summary of activity levels and their impact on health",
  "averageStepsPerDay": ${avgSteps},
  "weeklyTrend": "Trend description (improving, stable, declining, variable)"
}

Provide max 2 insights, max 2 patterns, and max 2 tips. Focus on:
- Consistency of daily activity
- Impact of activity on glucose control
- Weekly patterns and trends
- Recommendations to improve activity levels
- How increased activity might help glucose management
- Days with notable activity changes and their glucose impact`;

  const content = await callOpenAI(prompt, systemPrompt);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return activityInsightsResponseSchema.parse({
    ...parsed,
    averageStepsPerDay: avgSteps,
    weeklyTrend: parsed.weeklyTrend || "Unable to determine trend",
  });
}
