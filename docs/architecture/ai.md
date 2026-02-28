# AI and Summaries

## Meal Image Analysis
The `/meals/analyze` endpoint accepts an image upload, sends the image to OpenAI for analysis, and stores both the analysis results and image URL.

## Insights
The `/insights/meals` and `/insights/glucose` endpoints aggregate the user profile, meals, symptoms, allergies, and glucose readings, then call OpenAI to generate structured JSON insights.

## Summary PDF
`/insights/summary` gathers data for a date range, extracts OCR text from document images, generates an AI summary, creates a PDF, and uploads the PDF to S3. The endpoint returns a public S3 URL.
