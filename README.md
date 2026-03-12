# PHR Backend

Backend API for a diabetes-focused personal health record (PHR) app. It supports glucose, meals, symptoms, allergies, prescriptions/reports, AI insights, PDF summaries, and family sharing with permissions.

## Features
- Glucose logging and stats
- Water intake tracking
- Meal logging and AI meal image analysis
- Symptoms and allergies tracking
- **Step tracking with Apple HealthKit integration (NEW)**
- **Activity-based health insights (NEW)**
- Document storage (prescriptions/reports)
- AI insights for meals, glucose, and activity
- PDF health summaries
- Family sharing with granular permissions

## Tech Stack
- Bun + Hono
- MongoDB + Mongoose
- Zod validation
- OpenAI (insights + meal analysis)
- S3 (public object URLs for files)

## Quick Start
```bash
bun install
cp .env.example .env
bun run src/index.ts
```

Server defaults to `http://localhost:5000`.

## Environment Variables
See `.env.example` for the full list. Required values:
- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (or use IAM role)

Optional:
- `AWS_S3_KEY_PREFIX` (default `uploads`)
- `AWS_S3_PUBLIC_BASE_URL` (CDN or custom domain)
- `S3_ENDPOINT` (for S3-compatible providers like Cloudflare R2)
- `S3_PUBLIC_BASE_URL` (custom public domain)
- `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_KEY_PREFIX`
- `PORT`

## Documentation
- API overview: `docs/architecture/api-overview.md`
- API docs index: `docs/api/overview.md`
- Architecture: `docs/architecture/overview.md`
- Activity Insights: `docs/architecture/activity-insights.md` (NEW)
- Steps API: `docs/api/steps.md` (NEW)
- Quick Reference: `docs/STEPS_QUICK_REFERENCE.md` (NEW)
- Storage: `docs/architecture/storage.md`
- AI pipeline: `docs/architecture/ai.md`
- Diagrams: `docs/diagrams/er_diagram.mermaid`

## Scripts
- `bun run src/index.ts` start server
- `bun run --watch src/index.ts` dev mode

## Storage Notes
Uploads and generated PDFs are stored in S3 with public object URLs. The upload service writes to S3 using `public-read` ACL and stores the resulting URL in MongoDB.
