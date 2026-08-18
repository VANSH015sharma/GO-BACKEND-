# ProductLab Backend (Learning Implementation)

A production-minded backend project skeleton to practice real product engineering:
- layered API architecture
- Prisma data modeling
- auth/authorization
- caching + idempotency safeguards
- background job queue with retries
- AI brief generation with fallback strategy
- tests, Docker, and deployment basics

## Product variant
**ProductLab** helps teams capture product ideas and generate backend implementation briefs using AI.

## Stack
- Node.js + Express
- Prisma + SQLite
- JWT auth
- Zod validation
- Pino logging

## Setup
```bash
cp .env.example .env
npm install
npm run db:push
npm run test
npm run start
```

Base URL: `http://localhost:3000/api/v1`

## Key endpoints
- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `POST /ideas`
- `GET /ideas`
- `GET /ideas/:id`
- `PATCH /ideas/:id/status`
- `POST /ideas/:id/brief` (requires `Idempotency-Key` header)
- `GET /jobs/:id`
- `GET /health`

## AI quality rules used
- Prompt version tracked (`AI_PROMPT_VERSION`)
- Provider timeout enforced (`AI_TIMEOUT_MS`)
- Fallback response if provider key is missing/fails/times out

## Production-minded concepts covered
- clean route/service split
- explicit validation and central error handling
- role-based auth checks
- read caching + invalidation on writes
- async job workflow with retry backoff
- idempotent command endpoint design
- dockerized runtime and health endpoint

## Deployment notes
- Container build: `docker build -t productlab-backend .`
- Run: `docker run -p 3000:3000 --env-file .env productlab-backend`
- For cloud deployment, keep secrets in platform secret manager and set a stronger database target than local SQLite.
