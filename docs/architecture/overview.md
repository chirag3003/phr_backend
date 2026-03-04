# PHR Backend Overview

This service powers the backend API for a diabetes-focused personal health record (PHR) app. It provides endpoints for logging glucose, water intake, meals, symptoms, and allergies; storing prescriptions/reports; generating AI insights; and sharing data with family members.

## Stack
- Runtime: Bun
- Framework: Hono
- Database: MongoDB (Mongoose)
- Validation: Zod
- AI: OpenAI (meal analysis + insights)
- File storage: Amazon S3 (public object URLs)

## High-level Flow
- Clients authenticate via `/auth/signup` and `/auth/login`.
- Data is stored in MongoDB and accessed through route → controller → service layers.
- Uploads go to S3 via `UploadService` and return public URLs stored in MongoDB.
- Insights endpoints call OpenAI for meal, glucose, and water insights.
- Summary generation combines data, runs OCR on document images, creates a PDF, and uploads it to S3.

## Core Feature Areas
- Glucose logging and stats
- Water intake tracking
- Meal logging (with optional image analysis)
- Symptom logging
- Prescriptions and reports storage
- AI insights and PDF summaries
- Family sharing and permissions

## Storage Layout (S3)
Objects are stored under a common prefix (default `uploads/`) with per-feature folders:
- `uploads/` for generic image uploads
- `uploads/profiles/` for profile images
- `uploads/meals/` for meal images
- `uploads/documents/` for prescriptions and reports
- `uploads/summaries/` for generated PDFs
