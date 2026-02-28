# Uploads API

Base path: `/uploads`

All endpoints require `Authorization: Bearer <jwt>`.

## POST `/uploads`
Upload a single image file.

Multipart field:
- `file` (JPEG, PNG, GIF, WebP)

Response:
```json
{
  "filename": "uploads/1702650000000-image.jpg",
  "originalName": "image.jpg",
  "mimetype": "image/jpeg",
  "size": 245678,
  "url": "https://<bucket>.s3.<region>.amazonaws.com/uploads/1702650000000-image.jpg"
}
```

## POST `/uploads/bulk`
Upload multiple image files with `files[]`.

## GET `/uploads`
List uploads for current user.

## GET `/uploads/:id`
Get one upload record.

## DELETE `/uploads/:id`
Deletes the S3 object and the upload record.
