# Authentication API

Base path: `/auth`

## POST `/auth/signup`
Create a new user account.

Request body:
```json
{
  "phoneNumber": "9876543210"
}
```

Response: `201 Created`
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phoneNumber": "9876543210"
  },
  "token": "<jwt>"
}
```

Errors:
- `409 Conflict` if the phone number already exists.

## POST `/auth/login`
Login with an existing account.

Request body:
```json
{
  "phoneNumber": "9876543210"
}
```

Response: `200 OK`
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "phoneNumber": "9876543210"
  },
  "token": "<jwt>"
}
```

Errors:
- `404 Not Found` if the user does not exist.
