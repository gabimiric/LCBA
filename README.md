# LIMBUS COMPANY BUS ADVERSITY DEPARTMENT

Achievement tracker for Mirror Dungeon in Limbus Company.

## Lab 7 Back-end Additions

This project now includes a JWT-protected CRUD API and front-end integration.

### Implemented Requirements

- CRUD API for achievements (REST)
- `/api/token` endpoint for issuing JWTs
- JWT with role/permissions payload and 1 minute expiration
- Authorization middleware for protected routes
- Role and permission model:
  - `ADMIN`: `READ`, `WRITE`, `DELETE`
  - `WRITER`: `READ`, `WRITE`
  - `VISITOR`: `READ`
- Pagination on list endpoint using `limit` and `offset`
- Swagger documentation available in browser
- Front-end connected to back-end API

## API Overview

Base URL (development): `http://localhost:3001/api`

### Auth

- `POST /api/token`
  - Body example:
    ```json
    {
      "role": "ADMIN"
    }
    ```
- `GET /api/token?role=VISITOR`
- `GET /api/token?permissions=READ,WRITE`

### Achievements (JWT required)

- `GET /api/achievements?limit=50&offset=0`
- `GET /api/achievements/:id`
- `POST /api/achievements`
- `PUT /api/achievements/:id`
- `DELETE /api/achievements/:id`

## Swagger

- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs.json`

## Run Locally

Install dependencies:

```bash
npm install
```

Run API server only:

```bash
npm run dev:api
```

Run front-end only:

```bash
npm run dev
```

Run API + front-end together:

```bash
npm run dev:all
```

## Tech Stack

- React + Vite
- Express
- JSON Web Token (`jsonwebtoken`)
- Swagger UI (`swagger-ui-express`)
