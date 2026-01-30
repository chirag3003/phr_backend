# Profile & User Authentication API Documentation

This document provides documentation for all user authentication and profile-related endpoints in the PHR Backend API.

---

## Table of Contents

1. [Authentication](#authentication)
   - [Signup](#signup)
   - [Login](#login)
2. [Profile](#profile)
   - [Get Profile](#get-profile)
   - [Get Profile By ID](#get-profile-by-id)
   - [Create Profile (JSON)](#create-profile-json)
   - [Create Profile (With Image)](#create-profile-with-image)
   - [Update Profile](#update-profile)
   - [Update Profile Image](#update-profile-image)
   - [Delete Profile](#delete-profile)

---

## Authentication

### Signup

Create a new user account with a phone number.

**Endpoint:** `POST /auth/signup`

**Headers:**
| Header       | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

**Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "phoneNumber": "9876543210",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "User already exists"
}
```

---

### Login

Authenticate an existing user with their phone number.

**Endpoint:** `POST /auth/login`

**Headers:**
| Header       | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

**Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "phoneNumber": "9876543210",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

---

## Profile

All profile endpoints require authentication via Bearer token.

### Get Profile

Get the authenticated user's profile.

**Endpoint:** `GET /profile`

**Headers:**
| Header        | Value              |
| ------------- | ------------------ |
| Authorization | Bearer {{token}}   |

**Response (200 OK):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "profileImage": "http://localhost:5000/uploads/64a1b2c3d4e5f6g7h8i9j0k1/profile_1705312200000.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Get Profile By ID

Get a specific profile by its ID.

**Endpoint:** `GET /profile/:id`

**Headers:**
| Header        | Value              |
| ------------- | ------------------ |
| Authorization | Bearer {{token}}   |

**Path Parameters:**
| Parameter | Type   | Description           |
| --------- | ------ | --------------------- |
| id        | string | The profile's MongoDB ObjectId |

**Response (200 OK):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "profileImage": "http://localhost:5000/uploads/64a1b2c3d4e5f6g7h8i9j0k1/profile_1705312200000.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Create Profile (JSON)

Create a new profile for the authenticated user without a profile image.

**Endpoint:** `POST /profile`

**Headers:**
| Header        | Value              |
| ------------- | ------------------ |
| Content-Type  | application/json   |
| Authorization | Bearer {{token}}   |

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

**Field Descriptions:**
| Field        | Type   | Required | Description                                    |
| ------------ | ------ | -------- | ---------------------------------------------- |
| firstName    | string | Yes      | User's first name                              |
| lastName     | string | Yes      | User's last name                               |
| dob          | string | Yes      | Date of birth (YYYY-MM-DD format)              |
| sex          | string | Yes      | Gender (e.g., "Male", "Female", "Other")       |
| diabetesType | string | Yes      | Type of diabetes (e.g., "Type 1", "Type 2")    |
| bloodType    | string | Yes      | Blood type (e.g., "A+", "B-", "O+", "AB-")     |
| height       | number | Yes      | Height in centimeters                          |
| weight       | number | Yes      | Weight in kilograms                            |

**Response (201 Created):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Create Profile (With Image)

Create a new profile for the authenticated user with an optional profile image.

**Endpoint:** `POST /profile`

**Headers:**
| Header        | Value              |
| ------------- | ------------------ |
| Authorization | Bearer {{token}}   |

**Request Body (multipart/form-data):**
| Field        | Type   | Required | Description                                    |
| ------------ | ------ | -------- | ---------------------------------------------- |
| firstName    | text   | Yes      | User's first name                              |
| lastName     | text   | Yes      | User's last name                               |
| dob          | text   | Yes      | Date of birth (YYYY-MM-DD format)              |
| sex          | text   | Yes      | Gender (e.g., "Male", "Female", "Other")       |
| diabetesType | text   | Yes      | Type of diabetes (e.g., "Type 1", "Type 2")    |
| bloodType    | text   | Yes      | Blood type (e.g., "A+", "B-", "O+", "AB-")     |
| height       | text   | Yes      | Height in centimeters                          |
| weight       | text   | Yes      | Weight in kilograms                            |
| profileImage | file   | No       | Profile image file (JPEG, PNG, etc.)           |

**Response (201 Created):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "profileImage": "http://localhost:5000/uploads/64a1b2c3d4e5f6g7h8i9j0k1/profile_1705312200000.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Update Profile

Update the authenticated user's profile (excluding profile image).

**Endpoint:** `PUT /profile`

**Headers:**
| Header        | Value              |
| ------------- | ------------------ |
| Content-Type  | application/json   |
| Authorization | Bearer {{token}}   |

**Request Body (partial update allowed):**
```json
{
  "weight": 72,
  "height": 176
}
```

**All Updateable Fields:**
| Field        | Type   | Description                                    |
| ------------ | ------ | ---------------------------------------------- |
| firstName    | string | User's first name                              |
| lastName     | string | User's last name                               |
| dob          | string | Date of birth (YYYY-MM-DD format)              |
| sex          | string | Gender                                         |
| diabetesType | string | Type of diabetes                               |
| bloodType    | string | Blood type                                     |
| height       | number | Height in centimeters                          |
| weight       | number | Weight in kilograms                            |

**Response (200 OK):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 176,
  "weight": 72,
  "profileImage": "http://localhost:5000/uploads/64a1b2c3d4e5f6g7h8i9j0k1/profile_1705312200000.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### Update Profile Image

Update only the profile image for the authenticated user.

**Endpoint:** `PUT /profile/image`

**Headers:**
| Header        | Value              |
| ------------- | ------------------ |
| Authorization | Bearer {{token}}   |

**Request Body (multipart/form-data):**
| Field        | Type | Required | Description                          |
| ------------ | ---- | -------- | ------------------------------------ |
| profileImage | file | Yes      | Profile image file (JPEG, PNG, etc.) |

**Response (200 OK):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15",
  "sex": "Male",
  "diabetesType": "Type 2",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "profileImage": "http://localhost:5000/uploads/64a1b2c3d4e5f6g7h8i9j0k1/newimage_1705315800000.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Profile image file is required"
}
```

---

### Delete Profile

Delete a profile by its ID.

**Endpoint:** `DELETE /profile/:id`

**Headers:**
| Header        | Value              |
| ------------- | ------------------ |
| Authorization | Bearer {{token}}   |

**Path Parameters:**
| Parameter | Type   | Description           |
| --------- | ------ | --------------------- |
| id        | string | The profile's MongoDB ObjectId |

**Response (200 OK):**
```json
{}
```

---

## Data Models

### User Model

```typescript
interface IUser {
  _id: ObjectId;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Profile Model

```typescript
interface IProfile {
  _id: ObjectId;
  userId: ObjectId;      // Reference to User
  firstName: string;
  lastName: string;
  dob: string;           // Date of birth (YYYY-MM-DD)
  sex: string;
  diabetesType: string;
  bloodType: string;
  height: number;        // In centimeters
  weight: number;        // In kilograms
  profileImage?: string; // URL to uploaded image
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Notes

1. **Authentication Token:** The JWT token received from signup/login should be included in the `Authorization` header as `Bearer <token>` for all profile endpoints.

2. **Profile Image Upload:** When uploading a profile image:
   - Supported formats: JPEG, PNG, GIF, WebP
   - Images are stored in the `/uploads/{userId}/` directory
   - The URL returned is a publicly accessible static file URL

3. **Profile Creation:** Each user can have only one profile. Attempting to create a second profile will result in an error.

4. **Update Profile vs Update Profile Image:** 
   - Use `PUT /profile` for updating text-based profile information
   - Use `PUT /profile/image` specifically for updating the profile picture
