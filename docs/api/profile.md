# Profile API

Base path: `/profile`

All endpoints require `Authorization: Bearer <jwt>`.

## GET `/profile`
Return the current user's profile.

## GET `/profile/:id`
Return a profile by ID.

## POST `/profile`
Create a profile. Supports JSON or `multipart/form-data` with `profileImage`.

JSON body:
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

Multipart fields:
- `firstName`, `lastName`, `dob`, `sex`, `diabetesType`, `bloodType`, `height`, `weight`
- `profileImage` (optional file)

## PUT `/profile`
Update profile (JSON). Partial updates allowed.

## PUT `/profile/image`
Update profile image (multipart `profileImage`).

## DELETE `/profile/:id`
Delete a profile by ID.
