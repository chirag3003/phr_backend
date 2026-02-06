# PHR Backend API Documentation

## Overview

This document provides complete API documentation for the Personal Health Record (PHR) Backend. The API is built with Hono framework and uses MongoDB for data storage.

**Base URL:** `http://localhost:5000`

---

## Authentication

All endpoints except `/auth/signup` and `/auth/login` require authentication via JWT token.

### Headers for Authenticated Requests

```
Authorization: Bearer <jwt_token>
```

---

## Data Types Reference

### Common Response Formats

**Success Response:**
```json
{
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

### MongoDB ObjectId
All `_id`, `userId`, and reference fields are MongoDB ObjectId strings (24 character hex strings).

### Date Format
Dates should be sent as ISO 8601 strings: `"2025-12-15"` or `"2025-12-15T10:30:00.000Z"`

---

## Endpoints

---

## 1. Authentication (`/auth`)

See [auth_doc.md](./auth_doc.md) for detailed authentication endpoints.

---

## 2. Profile (`/profile`)

### GET `/profile`
Get the current user's profile.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15T00:00:00.000Z",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "createdAt": "2025-12-01T10:00:00.000Z",
  "updatedAt": "2025-12-15T14:30:00.000Z"
}
```

---

### GET `/profile/:id`
Get a profile by its ID.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Profile ObjectId |

**Response (200 OK):** Same as GET `/profile`

---

### POST `/profile`
Create a new profile for the current user.

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 175,
  "weight": 70
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| firstName | string | Yes | 1-50 chars | First name |
| lastName | string | Yes | 1-50 chars | Last name |
| dob | date | Yes | ISO date | Date of birth |
| sex | enum | Yes | `Male`, `Female`, `Other` | Gender |
| diabetesType | enum | Yes | `Type 1`, `Type 2`, `Gestational`, `Pre-diabetes`, `None` | Diabetes type |
| bloodType | enum | Yes | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` | Blood type |
| height | number | Yes | 0-300 | Height in cm |
| weight | number | Yes | 0-500 | Weight in kg |

**Response (201 Created):** Returns created profile object

---

### PUT `/profile`
Update the current user's profile.

**Authentication:** Required

**Request Body:** Any subset of profile fields
```json
{
  "weight": 72,
  "height": 176
}
```

**Response (200 OK):** Returns updated profile object

---

### DELETE `/profile/:id`
Delete a profile.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Profile ObjectId |

**Response (200 OK):**
```json
{}
```

---

## 3. Allergies (`/allergies`)

### GET `/allergies`
Get all allergies for the current user.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Peanuts",
    "severity": "High",
    "notes": "Causes difficulty in breathing",
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-01T10:00:00.000Z"
  }
]
```

---

### GET `/allergies/:id`
Get a specific allergy by ID.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Allergy ObjectId |

**Response (200 OK):** Returns single allergy object

---

### POST `/allergies`
Create a new allergy.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Peanuts",
  "severity": "High",
  "notes": "Causes difficulty in breathing"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | 1-100 chars | Allergy name |
| severity | enum | Yes | `Low`, `Medium`, `High` | Severity level |
| notes | string | No | max 500 chars | Additional notes |

**Response (201 Created):** Returns created allergy object

---

### PUT `/allergies/:id`
Update an allergy.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Allergy ObjectId |

**Request Body:** Any subset of allergy fields
```json
{
  "severity": "Medium",
  "notes": "Updated notes"
}
```

**Response (200 OK):** Returns updated allergy object

---

## 4. Symptoms (`/symptoms`)

### GET `/symptoms`
Get all symptoms for the current user.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "symptomName": "Headache",
    "intensity": "Medium",
    "dateRecorded": "2025-12-15T00:00:00.000Z",
    "time": {
      "hour": 14,
      "minute": 30
    },
    "notes": "Started after lunch",
    "createdAt": "2025-12-15T14:30:00.000Z",
    "updatedAt": "2025-12-15T14:30:00.000Z"
  }
]
```

---

### GET `/symptoms/range`
Get symptoms within a date range.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (ISO format) |
| endDate | string | Yes | End date (ISO format) |

**Example:** `/symptoms/range?startDate=2025-01-01&endDate=2025-12-31`

**Response (200 OK):** Returns array of symptom objects

---

### GET `/symptoms/:id`
Get a specific symptom by ID.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Symptom ObjectId |

**Response (200 OK):** Returns single symptom object

---

### POST `/symptoms`
Create a new symptom.

**Authentication:** Required

**Request Body:**
```json
{
  "symptomName": "Headache",
  "intensity": "Medium",
  "dateRecorded": "2025-12-15",
  "time": {
    "hour": 14,
    "minute": 30
  },
  "notes": "Started after lunch"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| symptomName | string | Yes | 1-100 chars | Name of symptom |
| intensity | enum | Yes | `Low`, `Medium`, `High`, `Severe` | Intensity level |
| dateRecorded | date | Yes | ISO date | Date when recorded |
| time | object | Yes | See below | Time of symptom |
| time.hour | number | Yes | 0-23 | Hour |
| time.minute | number | Yes | 0-59 | Minute |
| notes | string | No | max 500 chars | Additional notes |

**Response (201 Created):** Returns created symptom object

---

### PUT `/symptoms/:id`
Update a symptom.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Symptom ObjectId |

**Request Body:** Any subset of symptom fields

**Response (200 OK):** Returns updated symptom object

---

### DELETE `/symptoms/:id`
Delete a symptom.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Symptom ObjectId |

**Response (200 OK):**
```json
{}
```

---

## 5. Meals (`/meals`)

### GET `/meals`
Get all meals for the current user.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Oatmeal with Berries",
    "detail": "Healthy breakfast option",
    "type": "Breakfast",
    "mealImage": "http://localhost:5000/uploads/1702650000000-oatmeal.jpg",
    "calories": 350,
    "protein": 12,
    "carbs": 55,
    "fiber": 8,
    "dateRecorded": "2025-12-15T00:00:00.000Z",
    "time": "08:30",
    "addedBy": "Self",
    "notes": "Added honey for sweetness",
    "createdAt": "2025-12-15T08:30:00.000Z",
    "updatedAt": "2025-12-15T08:30:00.000Z"
  }
]
```

---

### GET `/meals/type`
Get meals filtered by type.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | enum | Yes | `Breakfast`, `Lunch`, `Dinner`, `Snack` |

**Example:** `/meals/type?type=Breakfast`

**Response (200 OK):** Returns array of meal objects

---

### GET `/meals/range`
Get meals within a date range.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | Yes | Start date (ISO format) |
| endDate | string | Yes | End date (ISO format) |

**Example:** `/meals/range?startDate=2025-01-01&endDate=2025-12-31`

**Response (200 OK):** Returns array of meal objects

---

### GET `/meals/:id`
Get a specific meal by ID.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Meal ObjectId |

**Response (200 OK):** Returns single meal object

---

### POST `/meals`
Create a new meal manually.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Oatmeal with Berries",
  "detail": "Healthy breakfast option",
  "type": "Breakfast",
  "mealImage": "http://example.com/image.jpg",
  "calories": 350,
  "protein": 12,
  "carbs": 55,
  "fiber": 8,
  "dateRecorded": "2025-12-15",
  "time": "08:30",
  "addedBy": "Self",
  "notes": "Added honey for sweetness"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | 1-100 chars | Meal name |
| detail | string | No | max 500 chars | Description |
| type | enum | Yes | `Breakfast`, `Lunch`, `Dinner`, `Snack` | Meal type |
| mealImage | string | No | Valid URL | Image URL |
| calories | number | Yes | min 0 | Calories |
| protein | number | Yes | min 0 | Protein in grams |
| carbs | number | Yes | min 0 | Carbs in grams |
| fiber | number | Yes | min 0 | Fiber in grams |
| dateRecorded | date | Yes | ISO date | Date of meal |
| time | string | Yes | 1-10 chars | Time (e.g., "08:30") |
| addedBy | string | Yes | 1-100 chars | Who added it |
| notes | string | No | max 500 chars | Additional notes |

**Response (201 Created):** Returns created meal object

---

### POST `/meals/analyze`
Create a meal by uploading an image. Uses AI (GPT-4o-mini) to analyze the food and extract nutritional information.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image file (JPEG, PNG, GIF, WebP) |

**Response (201 Created):**
```json
{
  "meal": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Grilled Chicken Salad",
    "detail": "Fresh salad with grilled chicken breast",
    "type": "Lunch",
    "mealImage": "http://localhost:5000/uploads/1702650000000-image.jpg",
    "calories": 420,
    "protein": 35,
    "carbs": 15,
    "fiber": 6,
    "dateRecorded": "2025-12-15T00:00:00.000Z",
    "time": "12:30",
    "addedBy": "AI Analysis",
    "notes": "Contains mixed greens, cherry tomatoes, and light dressing"
  },
  "analysis": {
    "name": "Grilled Chicken Salad",
    "detail": "Fresh salad with grilled chicken breast",
    "type": "Lunch",
    "calories": 420,
    "protein": 35,
    "carbs": 15,
    "fiber": 6,
    "notes": "Contains mixed greens, cherry tomatoes, and light dressing"
  }
}
```

---

### PUT `/meals/:id`
Update a meal.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Meal ObjectId |

**Request Body:** Any subset of meal fields

**Response (200 OK):** Returns updated meal object

---

### DELETE `/meals/:id`
Delete a meal.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Meal ObjectId |

**Response (200 OK):**
```json
{}
```

---

## 6. Documents (`/documents`)

### GET `/documents`
Get all documents for the current user.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "title": "Dr. Smith Prescription",
    "documentType": "Prescription",
    "fileUrl": "http://localhost:5000/uploads/prescription.pdf",
    "fileSize": "2.5MB",
    "lastUpdatedAt": "2025-12-15T00:00:00.000Z",
    "createdAt": "2025-12-15T10:00:00.000Z",
    "updatedAt": "2025-12-15T10:00:00.000Z"
  }
]
```

---

### GET `/documents/type`
Get documents filtered by type.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| documentType | enum | Yes | `Prescription`, `Report`, `LabResult`, `Other` |

**Example:** `/documents/type?documentType=Prescription`

**Response (200 OK):** Returns array of document objects

---

### GET `/documents/:id`
Get a specific document by ID.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Document ObjectId |

**Response (200 OK):** Returns single document object

---

### POST `/documents`
Create a new document record.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Dr. Smith Prescription",
  "documentType": "Prescription",
  "fileUrl": "http://localhost:5000/uploads/prescription.pdf",
  "fileSize": "2.5MB",
  "lastUpdatedAt": "2025-12-15"
}
```

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| title | string | Yes | 1-200 chars | Document title |
| documentType | enum | Yes | `Prescription`, `Report`, `LabResult`, `Other` | Type |
| fileUrl | string | Yes | Valid URL | File URL |
| fileSize | string | No | max 20 chars | File size |
| lastUpdatedAt | date | Yes | ISO date | Last update date |

**Response (201 Created):** Returns created document object

---

### PUT `/documents/:id`
Update a document.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Document ObjectId |

**Request Body:** Any subset of document fields

**Response (200 OK):** Returns updated document object

---

### DELETE `/documents/:id`
Delete a document.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Document ObjectId |

**Response (200 OK):**
```json
{}
```

---

## 7. Uploads (`/uploads`)

### POST `/uploads`
Upload a single image file.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image file (JPEG, PNG, GIF, WebP) |

**Response (201 Created):**
```json
{
  "filename": "1702650000000-image.jpg",
  "originalName": "my-photo.jpg",
  "mimetype": "image/jpeg",
  "size": 245678,
  "url": "http://localhost:5000/uploads/1702650000000-image.jpg"
}
```

---

### POST `/uploads/bulk`
Upload multiple image files.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| files | File[] | Yes | Multiple image files |

**Response (201 Created):**
```json
[
  {
    "filename": "1702650000000-image1.jpg",
    "originalName": "photo1.jpg",
    "mimetype": "image/jpeg",
    "size": 245678,
    "url": "http://localhost:5000/uploads/1702650000000-image1.jpg"
  },
  {
    "filename": "1702650000001-image2.jpg",
    "originalName": "photo2.jpg",
    "mimetype": "image/png",
    "size": 123456,
    "url": "http://localhost:5000/uploads/1702650000001-image2.jpg"
  }
]
```

---

### GET `/uploads`
Get all uploads for the current user.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "filename": "1702650000000-image.jpg",
    "originalName": "my-photo.jpg",
    "mimetype": "image/jpeg",
    "size": 245678,
    "url": "http://localhost:5000/uploads/1702650000000-image.jpg",
    "createdAt": "2025-12-15T10:00:00.000Z",
    "updatedAt": "2025-12-15T10:00:00.000Z"
  }
]
```

---

### GET `/uploads/:id`
Get a specific upload by ID.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload ObjectId |

**Response (200 OK):** Returns single upload object

---

### DELETE `/uploads/:id`
Delete an upload (removes file and database entry).

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Upload ObjectId |

**Response (200 OK):**
```json
{
  "message": "Upload deleted"
}
```

---

## 8. Family (`/family`)

### GET `/family`
Get all families the current user belongs to (as admin or member).

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "My Family",
    "admin": "507f1f77bcf86cd799439012",
    "members": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-15T14:30:00.000Z"
  }
]
```

---

### GET `/family/:id`
Get a specific family by ID.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Response (200 OK):** Returns single family object

---

### POST `/family`
Create a new family. The current user becomes the admin.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Family"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Family name |

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "My Family",
  "admin": "507f1f77bcf86cd799439012",
  "members": []
}
```

---

### PUT `/family/:id`
Update a family.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Request Body:**
```json
{
  "name": "Updated Family Name"
}
```

**Response (200 OK):** Returns updated family object

---

### DELETE `/family/:id`
Delete a family and all associated permissions.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Response (200 OK):**
```json
{
  "message": "Family deleted"
}
```

---

### POST `/family/:id/members`
Add a member to a family. Creates permission entries between the new member and all existing members.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439013"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ObjectId to add |

**Response (200 OK):** Returns updated family object

---

### DELETE `/family/:id/members`
Remove a member from a family. Deletes all their permission entries.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439013"
}
```

**Response (200 OK):** Returns updated family object

---

### GET `/family/:id/permissions`
Get a permission entry.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| permissionTo | string | Yes | Target user ObjectId |

**Example:** `/family/507f1f77bcf86cd799439011/permissions?permissionTo=507f1f77bcf86cd799439013`

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "userId": "507f1f77bcf86cd799439012",
  "family": "507f1f77bcf86cd799439011",
  "permissionTo": "507f1f77bcf86cd799439013",
  "write": true,
  "permissions": {
    "documents": true,
    "symptoms": true,
    "meals": true,
    "trends": false
  }
}
```

---

### POST `/family/:id/permissions`
Create a permission entry.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Request Body:**
```json
{
  "permissionTo": "507f1f77bcf86cd799439013"
}
```

**Response (201 Created):** Returns created permission object

---

### PUT `/family/:id/permissions`
Update a permission entry.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Request Body:**
```json
{
  "permissionTo": "507f1f77bcf86cd799439013",
  "write": true,
  "permissions": {
    "documents": true,
    "symptoms": true,
    "meals": true,
    "trends": false
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| permissionTo | string | Yes | Target user ObjectId |
| write | boolean | No | Can write data |
| permissions | object | No | Permission settings |
| permissions.documents | boolean | No | Access to documents |
| permissions.symptoms | boolean | No | Access to symptoms |
| permissions.meals | boolean | No | Access to meals |
| permissions.trends | boolean | No | Access to trends |

**Response (200 OK):** Returns updated permission object

---

### DELETE `/family/:id/permissions`
Delete a permission entry.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Family ObjectId |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| permissionTo | string | Yes | Target user ObjectId |

**Response (200 OK):**
```json
{
  "message": "Permission deleted"
}
```

---

## Static Files

### GET `/uploads/:filename`
Access uploaded files directly.

**Authentication:** Not required (public access)

**Example:** `http://localhost:5000/uploads/1702650000000-image.jpg`

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request body or parameters |
| 401 | Unauthorized - Missing or invalid JWT token |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## iOS UIKit Integration Notes

### Network Layer Setup

1. **Base Configuration:**
```swift
let baseURL = "http://localhost:5000"
```

2. **Token Storage:**
Store JWT token in Keychain after login/signup.

3. **Request Headers:**
```swift
var headers: [String: String] = [
    "Content-Type": "application/json"
]
if let token = KeychainService.getToken() {
    headers["Authorization"] = "Bearer \(token)"
}
```

4. **Multipart Form Data (for uploads):**
```swift
let boundary = UUID().uuidString
request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
```

5. **Date Formatting:**
```swift
let formatter = ISO8601DateFormatter()
formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
```

### Model Mapping

All API responses use `_id` for MongoDB ObjectId. Map to your Swift models:
```swift
struct User: Codable {
    let id: String
    let phoneNumber: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case phoneNumber
    }
}
```

### Error Handling

Parse error responses:
```swift
struct APIError: Codable {
    let error: String
}
```
