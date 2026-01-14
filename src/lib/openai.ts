import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const mealAnalysisSchema = z.object({
  name: z.string(),
  detail: z.string().optional(),
  type: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fiber: z.number(),
  notes: z.string().optional(),
});

export type MealAnalysis = z.infer<typeof mealAnalysisSchema>;

export async function analyzeMealImage(imageBase64: string, mimeType: string): Promise<MealAnalysis> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const prompt = `Analyze this food/meal image and provide nutritional information in JSON format.

Return ONLY a valid JSON object with these exact fields:
{
  "name": "Name of the dish/meal",
  "detail": "Brief description of the meal",
  "type": "Breakfast" | "Lunch" | "Dinner" | "Snack" (guess based on the meal type),
  "calories": estimated calories (number),
  "protein": estimated protein in grams (number),
  "carbs": estimated carbohydrates in grams (number),
  "fiber": estimated fiber in grams (number),
  "notes": "Any additional notes about the meal"
}

Be realistic with nutritional estimates based on typical portion sizes. If you cannot identify the food, make your best guess.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
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

  // Parse the JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from OpenAI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return mealAnalysisSchema.parse(parsed);
}
