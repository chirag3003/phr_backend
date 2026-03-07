# Shared Access API

Base path: `/shared`

All endpoints require `Authorization: Bearer <jwt>` and a valid permission entry.

## Read Endpoints
- `GET /shared/:userId/profile`
- `GET /shared/:userId/meals`
- `GET /shared/:userId/glucose`
- `GET /shared/:userId/symptoms`
- `GET /shared/:userId/documents`
- `GET /shared/:userId/docDoctors`
- `GET /shared/:userId/allergies`
- `GET /shared/:userId/water`
- `GET /shared/:userId/insights/glucose`
- `GET /shared/:userId/insights/meals`
- `GET /shared/:userId/insights/water`
- `POST /shared/:userId/insights/summary`

## Write Endpoints
Write access requires both `write: true` and the domain permission set to `true`.

- `POST /shared/:userId/meals`
- `PUT /shared/:userId/meals/:id`
- `DELETE /shared/:userId/meals/:id`

- `POST /shared/:userId/glucose`
- `PUT /shared/:userId/glucose/:id`
- `DELETE /shared/:userId/glucose/:id`

- `POST /shared/:userId/symptoms`
- `PUT /shared/:userId/symptoms/:id`
- `DELETE /shared/:userId/symptoms/:id`

- `POST /shared/:userId/documents` (multipart with file)
- `POST /shared/:userId/docDoctors`
- `PUT /shared/:userId/docDoctors/:id`
- `DELETE /shared/:userId/docDoctors/:id`
- `PUT /shared/:userId/documents/:id`
- `DELETE /shared/:userId/documents/:id`

## Shared Summary Rules
- `POST /shared/:userId/insights/summary` requires a valid share entry.
- Summary sections are trimmed to allowed domains, even if the request includes them.

- `POST /shared/:userId/allergies`
- `PUT /shared/:userId/allergies/:id`
- `DELETE /shared/:userId/allergies/:id`

- `POST /shared/:userId/water`
- `PUT /shared/:userId/water/:id`
- `DELETE /shared/:userId/water/:id`
