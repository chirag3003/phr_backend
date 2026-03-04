# Family and Permissions API

Base path: `/family`

All endpoints require `Authorization: Bearer <jwt>`.

## Family Endpoints
- `GET /family` list families
- `GET /family/:id`
- `GET /family/:id/members` (populated admin + members)
- `POST /family`
- `PUT /family/:id`
- `DELETE /family/:id`

## Member Management
- `POST /family/:id/members` (body: `{ "phoneNumber": "..." }`)
- `DELETE /family/:id/members` (body: `{ "userId": "..." }`)

## Permissions
- `GET /family/permissions?permissionTo=<userId>`
- `POST /family/permissions` (body: `{ "permissionTo": "..." }`)
- `PUT /family/:id/permissions` (body: `{ permissionTo, write, permissions: { documents, symptoms, meals, glucose, allergies, water } }`)
- `DELETE /family/:id/permissions?permissionTo=<userId>`

Permissions are user-to-user and not scoped to a family. The `:id` parameter is ignored for permission updates/deletes.
