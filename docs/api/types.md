# API Types and Conventions

## Authentication
Use a Bearer token for all authenticated endpoints:
```
Authorization: Bearer <jwt>
```

## ObjectId
All IDs are MongoDB ObjectId strings.

## Date Handling
- Dates are accepted as ISO 8601 strings.
- Some endpoints accept date-only strings (YYYY-MM-DD).
