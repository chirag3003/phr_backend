# DocDoctor & Documents API Documentation

## Overview

The Documents API manages medical documents for users. Documents are categorized as either **Prescriptions** (linked to a doctor) or **Reports** (with a title). The DocDoctor API manages the doctors associated with prescriptions.

---

## DocDoctor API

Manage doctors who issue prescriptions.

### Base URL
```
/docDoctors
```

### Endpoints

#### Get All Doctors
```http
GET /docDoctors
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Dr. John Smith",
    "createdAt": "2026-01-27T10:00:00.000Z",
    "updatedAt": "2026-01-27T10:00:00.000Z"
  }
]
```

#### Get Doctor by ID
```http
GET /docDoctors/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "name": "Dr. John Smith",
  "createdAt": "2026-01-27T10:00:00.000Z",
  "updatedAt": "2026-01-27T10:00:00.000Z"
}
```

#### Create Doctor
```http
POST /docDoctors
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Dr. John Smith"
}
```

| Field | Type   | Required | Description        |
|-------|--------|----------|--------------------|
| name  | string | Yes      | Doctor's full name |

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "name": "Dr. John Smith",
  "createdAt": "2026-01-27T10:00:00.000Z",
  "updatedAt": "2026-01-27T10:00:00.000Z"
}
```

#### Update Doctor
```http
PUT /docDoctors/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Dr. John A. Smith"
}
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "name": "Dr. John A. Smith",
  "createdAt": "2026-01-27T10:00:00.000Z",
  "updatedAt": "2026-01-27T12:00:00.000Z"
}
```

#### Delete Doctor
```http
DELETE /docDoctors/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Doctor deleted successfully"
}
```

---

## Documents API

Manage medical documents (prescriptions and reports).

### Base URL
```
/documents
```

### Document Types

| Type         | Required Fields           | Description                          |
|--------------|---------------------------|--------------------------------------|
| Prescription | `docDoctorId`, `date`     | Prescription linked to a doctor      |
| Report       | `title`, `date`           | Medical report with a descriptive title |

### Endpoints

#### Get All Documents
```http
GET /documents
Authorization: Bearer <token>
```

Returns all documents for the authenticated user, sorted by date (newest first). Prescriptions include populated doctor information.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "documentType": "Prescription",
    "docDoctorId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. John Smith"
    },
    "date": "2026-01-27T00:00:00.000Z",
    "fileUrl": "https://example.com/prescription.pdf",
    "fileSize": "2.5MB",
    "createdAt": "2026-01-27T10:00:00.000Z",
    "updatedAt": "2026-01-27T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439012",
    "documentType": "Report",
    "title": "Blood Test Results",
    "date": "2026-01-25T00:00:00.000Z",
    "fileUrl": "https://example.com/blood-test.pdf",
    "fileSize": "1.2MB",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z"
  }
]
```

#### Get Document by ID
```http
GET /documents/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439012",
  "documentType": "Prescription",
  "docDoctorId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. John Smith"
  },
  "date": "2026-01-27T00:00:00.000Z",
  "fileUrl": "https://example.com/prescription.pdf",
  "fileSize": "2.5MB",
  "createdAt": "2026-01-27T10:00:00.000Z",
  "updatedAt": "2026-01-27T10:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Document not found"
}
```

#### Get Documents by Type
```http
GET /documents/type?documentType=Prescription
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter    | Type   | Required | Values                    |
|--------------|--------|----------|---------------------------|
| documentType | string | Yes      | `Prescription` or `Report` |

**Response:** `200 OK` - Array of documents of the specified type

**Error Response:** `400 Bad Request`
```json
{
  "error": "Invalid document type. Must be 'Prescription' or 'Report'"
}
```

#### Get Documents by Doctor
```http
GET /documents/doctor/:docDoctorId
Authorization: Bearer <token>
```

Returns all prescriptions associated with a specific doctor.

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "documentType": "Prescription",
    "docDoctorId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. John Smith"
    },
    "date": "2026-01-27T00:00:00.000Z",
    "fileUrl": "https://example.com/prescription.pdf",
    "fileSize": "2.5MB",
    "createdAt": "2026-01-27T10:00:00.000Z",
    "updatedAt": "2026-01-27T10:00:00.000Z"
  }
]
```

#### Create Prescription
```http
POST /documents
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

| Field       | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| file        | file   | Yes      | The prescription document file     |
| documentType| string | Yes      | Must be `"Prescription"`           |
| docDoctorId | string | Yes      | ObjectId of the prescribing doctor |
| date        | string | Yes      | Date of the prescription (YYYY-MM-DD) |

**Example using curl:**
```bash
curl -X POST http://localhost:5000/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/prescription.pdf" \
  -F "documentType=Prescription" \
  -F "docDoctorId=507f1f77bcf86cd799439011" \
  -F "date=2026-01-27"
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439012",
  "documentType": "Prescription",
  "docDoctorId": "507f1f77bcf86cd799439011",
  "date": "2026-01-27T00:00:00.000Z",
  "fileUrl": "http://localhost:5000/uploads/1706356800000-prescription.pdf",
  "fileSize": "2.5MB",
  "createdAt": "2026-01-27T10:00:00.000Z",
  "updatedAt": "2026-01-27T10:00:00.000Z"
}
```

#### Create Report
```http
POST /documents
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

| Field       | Type   | Required | Description                      |
|-------------|--------|----------|----------------------------------|
| file        | file   | Yes      | The report document file         |
| documentType| string | Yes      | Must be `"Report"`               |
| title       | string | Yes      | Title of the report (1-200 chars)|
| date        | string | Yes      | Date of the report (YYYY-MM-DD)  |

**Example using curl:**
```bash
curl -X POST http://localhost:5000/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/blood-test.pdf" \
  -F "documentType=Report" \
  -F "title=Blood Test Results" \
  -F "date=2026-01-27"
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439012",
  "documentType": "Report",
  "title": "Blood Test Results",
  "date": "2026-01-27T00:00:00.000Z",
  "fileUrl": "http://localhost:5000/uploads/1706356800000-blood-test.pdf",
  "fileSize": "1.2MB",
  "createdAt": "2026-01-27T10:00:00.000Z",
  "updatedAt": "2026-01-27T10:00:00.000Z"
}
| title       | string | Yes      | Title of the report (1-200 chars)|
| date        | date   | Yes      | Date of the report               |
| fileUrl     | string | Yes      | URL to the document file         |
| fileSize    | string | No       | Size of the file (e.g., "1.2MB") |

**Response:** `201 Created`

#### Update Document
```http
PUT /documents/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (partial update):**
```json
{
  "date": "2026-01-28",
  "fileUrl": "https://example.com/updated-document.pdf"
}
```

| Field       | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| documentType| string | No       | `"Prescription"` or `"Report"`     |
| docDoctorId | string | No       | ObjectId of doctor (for prescriptions) |
| title       | string | No       | Title (for reports)                |
| date        | date   | No       | Document date                      |
| fileUrl     | string | No       | URL to the document file           |
| fileSize    | string | No       | Size of the file                   |

**Response:** `200 OK`

**Error Response:** `404 Not Found`
```json
{
  "error": "Document not found"
}
```

#### Delete Document
```http
DELETE /documents/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Document deleted successfully"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Document not found"
}
```

---

## Data Models

### DocDoctor Model

```typescript
interface IDocDoctor {
  _id: ObjectId;
  userId: ObjectId;       // Reference to User
  name: string;           // Doctor's name
  createdAt: Date;
  updatedAt: Date;
}
```

### Document Model

```typescript
interface IDocument {
  _id: ObjectId;
  userId: ObjectId;                    // Reference to User
  documentType: "Prescription" | "Report";
  docDoctorId?: ObjectId;              // Required for Prescription, ref: DocDoctor
  title?: string;                      // Required for Report
  date: Date;                          // Document date
  fileUrl: string;                     // URL to file
  fileSize?: string;                   // File size (e.g., "2.5MB")
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Validation Rules

### DocDoctor
- `name`: Required, 1-100 characters

### Document (Prescription)
- `file`: Required, file upload
- `documentType`: Must be `"Prescription"`
- `docDoctorId`: Required, valid ObjectId
- `date`: Required, valid date

### Document (Report)
- `file`: Required, file upload
- `documentType`: Must be `"Report"`
- `title`: Required, 1-200 characters
- `date`: Required, valid date

> **Note:** The `fileUrl` and `fileSize` are automatically set by the server when the file is uploaded.

---

## Workflow Example

### 1. Create a Doctor
```bash
curl -X POST http://localhost:5000/docDoctors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Dr. Sarah Johnson"}'
```

### 2. Create a Prescription for that Doctor (with file upload)
```bash
curl -X POST http://localhost:5000/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/prescription.pdf" \
  -F "documentType=Prescription" \
  -F "docDoctorId=<doctor_id_from_step_1>" \
  -F "date=2026-01-27"
```

### 3. Get All Prescriptions from that Doctor
```bash
curl http://localhost:5000/documents/doctor/<doctor_id> \
  -H "Authorization: Bearer <token>"
```

### 4. Create a Report
```bash
curl -X POST http://localhost:5000/documents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "Report",
    "title": "Annual Blood Work Results",
    "date": "2026-01-27",
    "fileUrl": "http://localhost:5000/uploads/blood-work.pdf"
  }'
```

---

## Error Codes

| Status Code | Description                                    |
|-------------|------------------------------------------------|
| 200         | Success                                        |
| 201         | Resource created successfully                  |
| 400         | Bad request (validation error, invalid type)   |
| 401         | Unauthorized (missing or invalid token)        |
| 404         | Resource not found                             |
| 500         | Internal server error                          |
