# Documents and Doctors API

Base paths:
- `/documents`
- `/docDoctors`

All endpoints require `Authorization: Bearer <jwt>`.

## Document Types
- `Prescription` (requires `docDoctorId`)
- `Report` (requires `title`)

## Documents Endpoints
- `GET /documents`
- `GET /documents/type?documentType=Prescription|Report`
- `GET /documents/doctor/:docDoctorId`
- `GET /documents/:id`
- `POST /documents` (multipart form with file + metadata)
- `PUT /documents/:id`
- `DELETE /documents/:id`

## Create Prescription (multipart)
Fields:
- `file` (required)
- `documentType=Prescription`
- `docDoctorId`
- `date` (YYYY-MM-DD)

## Create Report (multipart)
Fields:
- `file` (required)
- `documentType=Report`
- `title`
- `date` (YYYY-MM-DD)

## DocDoctor Endpoints
- `GET /docDoctors`
- `GET /docDoctors/:id`
- `POST /docDoctors`
- `PUT /docDoctors/:id`
- `DELETE /docDoctors/:id`
