# Homestay.by.Patricia

Full-stack accommodation platform foundation using a Next.js frontend and a NestJS backend.

This repository is intentionally scaffolded as a monorepo with independent frontend and backend applications. It does not contain speculative product features, sample bookings, fake listings, or invented domain rules.

## Repository Structure

```text
Homestay.by.Patricia/
├── frontend/   # Next.js, React, TypeScript, Tailwind CSS
├── backend/    # NestJS, TypeScript, Prisma, REST API foundation
├── docs/       # Architecture, API contract, development notes
├── package.json
├── README.md
└── .gitignore
```

## Getting Started

Install dependencies from the repository root:

```bash
npm install
```

Create local environment files from the examples:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Start PGlite, the API, and the frontend together:

```bash
npm run dev
```

The app is then at http://localhost:3000. Browser API calls go to `/api/v1` on that same origin; Next proxies them to the Nest API so session cookies work.

To start the pieces separately:

```bash
npm run dev:db
npm run dev:backend
npm run dev:frontend
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

## Engineering Notes

- Frontend code must consume backend behavior through explicit services/contracts.
- Backend code remains the authority for validation, authorization, pricing, availability, and booking state.
- Prisma is configured for PostgreSQL, but no product schema has been invented yet.
- API routes are versioned under `/api/v1`.
- Real secrets must never be committed.
