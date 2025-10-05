# Eventlook Clone

A minimal full-stack ticketing experience built with NestJS, React, and PostgreSQL. The project includes API endpoints for browsing events and purchasing tickets, a Material UI powered frontend, seed data, and Docker support for local development.

## Getting Started (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000/api/events
- PostgreSQL: localhost:5432 (user/password/database: `eventlook`)

The backend container seeds initial events automatically on startup. Re-running the containers is idempotent.

## Getting Started (Manual)

### Backend

```bash
cd backend
cp .env.example .env # adjust if needed
npm install
npm run build
npm run seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` calls to the Nest backend.

## Tests

Backend unit tests cover core purchase logic. Run with:

```bash
cd backend
npm test
```

## Project Layout

- `backend/` – NestJS API, TypeORM entities, ticket purchase workflow, and seed script
- `frontend/` – React app with Material UI, event catalogue, and purchase modal
- `docker-compose.yml` – Orchestrates PostgreSQL, backend, and frontend services

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Backend HTTP port | `3000` |
| `DATABASE_HOST` | PostgreSQL host | `db` in Docker, `localhost` locally |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USER` | PostgreSQL username | `eventlook` |
| `DATABASE_PASSWORD` | PostgreSQL password | `eventlook` |
| `DATABASE_NAME` | PostgreSQL database | `eventlook` |
| `DATABASE_SYNCHRONIZE` | Auto-create schema (useful for local/dev) | `true` |
| `TYPEORM_LOGGING` | Enable SQL logging | `false` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` for dev |

## API Overview

- `GET /events` – List events sorted by start date with availability metadata
- `POST /events/:id/purchase` – Purchase tickets for an event and receive generated ticket numbers

Both endpoints live under `/api` when served through the frontend container (Nginx reverse proxy).
