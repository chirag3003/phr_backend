# Storage and Uploads

## S3 Configuration
Uploads are stored in S3 using public object URLs. Configure via environment variables:

- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID` (optional if using IAM role)
- `AWS_SECRET_ACCESS_KEY` (optional if using IAM role)
- `AWS_S3_KEY_PREFIX` (optional, default `uploads`)
- `AWS_S3_PUBLIC_BASE_URL` (optional, e.g. CDN or custom domain)
- `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_KEY_PREFIX` (for S3-compatible services)
- `S3_ENDPOINT` (optional, for S3-compatible services like Cloudflare R2)
- `S3_PUBLIC_BASE_URL` (optional, custom public domain)

If `S3_PUBLIC_BASE_URL` (or `AWS_S3_PUBLIC_BASE_URL`) is unset, the public URL is derived using the standard AWS URL format or the endpoint format.

## Cloudflare R2 Example
```
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
S3_PUBLIC_BASE_URL=https://<your-public-domain>
S3_REGION=auto
S3_BUCKET=<bucket-name>
AWS_ACCESS_KEY_ID=<r2-access-key>
AWS_SECRET_ACCESS_KEY=<r2-secret-key>
```

## Upload Flow
1. Controllers pass `File` objects to `UploadService`.
2. `UploadService` writes to S3 with `public-read` ACL.
3. The public URL is stored on the related record and returned in responses.

## S3 Key Structure
`<AWS_S3_KEY_PREFIX>/<folder>/<timestamp>-<sanitized-filename>`

Folders used:
- `uploads` (generic upload endpoint)
- `profiles`
- `meals`
- `documents`
- `summaries`

## OCR for Documents
The AI summary pipeline fetches document images via their public S3 URLs and feeds bytes into Tesseract for OCR.
