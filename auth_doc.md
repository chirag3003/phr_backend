# Authentication Documentation

## 1. Authentication (`/auth`)

### POST `/auth/signup`
Create a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phoneNumber | string | Yes | User's phone number |

**Response (201 Created):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phoneNumber": "9876543210"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (409 Conflict):**
```json
{
  "error": "User with this phone number already exists"
}
```

---

### POST `/auth/login`
Login with existing account.

**Authentication:** Not required

**Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phoneNumber": "9876543210"
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
