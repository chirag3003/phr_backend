# Family & Permissions API Documentation

## Overview

The Family API allows users to create family groups and share health data with family members. Each family has an admin (creator) and members. Permissions control what data each family member can access from other members.

---

## Data Models

### Family Model

```typescript
interface IFamily {
  _id: ObjectId;
  admin: ObjectId;        // User who created the family (admin)
  name: string;           // Family name
  members: ObjectId[];    // Array of member user IDs
}
```

### FamilyPermission Model

```typescript
interface IFamilyPermission {
  _id: ObjectId;
  userId: ObjectId;       // User granting permission
  permissionTo: ObjectId; // User receiving permission to view data
  write: boolean;         // Can modify data (default: false)
  permissions: {
    documents: boolean;   // Access to documents
    symptoms: boolean;    // Access to symptoms
    meals: boolean;       // Access to meals
    trends: boolean;      // Access to trends/analytics
  };
}
```

---

## Family API

### Base URL
```
/family
```

### Endpoints

#### Get My Families
Returns all families where the user is either the admin or a member.

```http
GET /family
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "admin": "507f1f77bcf86cd799439012",
    "name": "My Family",
    "members": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
  }
]
```

#### Get Family by ID
```http
GET /family/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "admin": "507f1f77bcf86cd799439012",
  "name": "My Family",
  "members": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
}
```

#### Get Family With Members
Returns the family with populated admin and member user objects.

```http
GET /family/:id/members
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "admin": {
    "_id": "507f1f77bcf86cd799439012",
    "phoneNumber": "9876543210"
  },
  "name": "My Family",
  "members": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "phoneNumber": "9876543211"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "phoneNumber": "9876543212"
    }
  ]
}
```

#### Create Family
Creates a new family with the authenticated user as admin.

```http
POST /family
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Family"
}
```

| Field | Type   | Required | Description       |
|-------|--------|----------|-------------------|
| name  | string | Yes      | Name of the family |

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "admin": "507f1f77bcf86cd799439012",
  "name": "My Family",
  "members": []
}
```

#### Update Family
```http
PUT /family/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Family Name"
}
```

**Response:** `200 OK`

#### Delete Family
```http
DELETE /family/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Family deleted"
}
```

---

## Member Management

#### Add Member to Family
Adds a new member to the family by their phone number. Automatically creates permission entries between the new member and all existing members (bidirectional).

```http
POST /family/:id/members
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "phoneNumber": "9876543210"
}
```

| Field       | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| phoneNumber | string | Yes      | Phone number of user to add    |

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "admin": "507f1f77bcf86cd799439012",
  "name": "My Family",
  "members": ["507f1f77bcf86cd799439013"]
}
```

**Side Effects:**
- Creates permission entries: `new_member -> all_existing_members`
- Creates permission entries: `all_existing_members -> new_member`
- All permissions default to `false` until explicitly updated

**Error Response:** `404 Not Found`
```json
{
  "error": "User not found"
}
```

#### Remove Member from Family
Removes a member from the family and deletes all associated permission entries.

```http
DELETE /family/:id/members
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439013"
}
```

| Field  | Type   | Required | Description              |
|--------|--------|----------|--------------------------|
| userId | string | Yes      | User ID of member to remove |

**Response:** `200 OK`

**Side Effects:**
- Deletes all permission entries where this user is the grantor (`userId`)
- Deletes all permission entries where this user is the grantee (`permissionTo`)

---

## Permission Management

Permissions control what data family members can see from each other. When a member is added to a family, permission entries are automatically created with all permissions set to `false`.

#### Get Permission Entry
Get the permission settings between the authenticated user and another user.

```http
GET /family/permissions?permissionTo=<user_id>
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter    | Type   | Required | Description                     |
|--------------|--------|----------|---------------------------------|
| permissionTo | string | Yes      | User ID to check permissions for |

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "userId": "507f1f77bcf86cd799439012",
  "permissionTo": "507f1f77bcf86cd799439013",
  "write": false,
  "permissions": {
    "documents": true,
    "symptoms": true,
    "meals": false,
    "trends": false
  }
}
```

#### Create Permission Entry
Manually create a permission entry (usually handled automatically when adding members).

```http
POST /family/permissions
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "permissionTo": "507f1f77bcf86cd799439013"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "userId": "507f1f77bcf86cd799439012",
  "permissionTo": "507f1f77bcf86cd799439013",
  "write": false,
  "permissions": {
    "documents": false,
    "symptoms": false,
    "meals": false,
    "trends": false
  }
}
```

#### Update Permission Entry
Update the permissions granted to another user.

```http
PUT /family/:id/permissions
Authorization: Bearer <token>
Content-Type: application/json
```

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

| Field       | Type    | Required | Description                         |
|-------------|---------|----------|-------------------------------------|
| permissionTo| string  | Yes      | User ID to update permissions for   |
| write       | boolean | No       | Allow write access                  |
| permissions | object  | No       | Individual permission settings      |

**Permissions Object:**

| Field     | Type    | Default | Description              |
|-----------|---------|---------|--------------------------|
| documents | boolean | false   | Access to documents      |
| symptoms  | boolean | false   | Access to symptoms       |
| meals     | boolean | false   | Access to meal logs      |
| trends    | boolean | false   | Access to trends/analytics |

**Response:** `200 OK`

#### Delete Permission Entry
Remove a permission entry.

```http
DELETE /family/:id/permissions?permissionTo=<user_id>
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter    | Type   | Required | Description                      |
|--------------|--------|----------|----------------------------------|
| permissionTo | string | Yes      | User ID to delete permissions for |

**Response:** `200 OK`
```json
{
  "message": "Permission deleted"
}
```

---

## Workflow Example

### 1. Create a Family
```bash
curl -X POST http://localhost:5000/family \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Smith Family"}'
```

### 2. Add a Family Member (by phone number)
```bash
curl -X POST http://localhost:5000/family/<family_id>/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210"}'
```

### 3. Grant Permissions to the New Member
```bash
curl -X PUT http://localhost:5000/family/<family_id>/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionTo": "<new_member_user_id>",
    "write": false,
    "permissions": {
      "documents": true,
      "symptoms": true,
      "meals": true,
      "trends": true
    }
  }'
```

### 4. Check What Permissions You Have for Another Member
```bash
curl "http://localhost:5000/family/permissions?permissionTo=<other_user_id>" \
  -H "Authorization: Bearer <token>"
```

### 5. Remove a Family Member
```bash
curl -X DELETE http://localhost:5000/family/<family_id>/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "<member_user_id>"}'
```

---

## Permission Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FAMILY GROUP                            │
│                                                             │
│  ┌─────────┐     permissions     ┌─────────┐               │
│  │  Admin  │ ◄─────────────────► │ Member1 │               │
│  │ (User A)│                     │ (User B)│               │
│  └────┬────┘                     └────┬────┘               │
│       │                               │                     │
│       │         permissions           │                     │
│       └───────────────┬───────────────┘                     │
│                       ▼                                     │
│                 ┌─────────┐                                 │
│                 │ Member2 │                                 │
│                 │ (User C)│                                 │
│                 └─────────┘                                 │
│                                                             │
│  Each arrow represents bidirectional FamilyPermission       │
│  entries that control data access between users             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Codes

| Status Code | Description                                    |
|-------------|------------------------------------------------|
| 200         | Success                                        |
| 201         | Resource created successfully                  |
| 400         | Bad request (validation error)                 |
| 401         | Unauthorized (missing or invalid token)        |
| 404         | User or Family not found                       |
| 500         | Internal server error                          |

---

## Notes

1. **Automatic Permission Creation**: When a member is added to a family, permission entries are automatically created between the new member and ALL existing members (including the admin). This is bidirectional.

2. **Default Permissions**: All permissions default to `false`. Users must explicitly grant permissions to each other.

3. **Phone Number Lookup**: Members are added by phone number, which is looked up against registered users.

4. **Permission Cleanup**: When a member is removed from a family, all their permission entries (both granted and received) are automatically deleted.

5. **Bidirectional Access**: User A granting permission to User B does NOT automatically grant User B permission to User A's data. Each direction must be set independently.
