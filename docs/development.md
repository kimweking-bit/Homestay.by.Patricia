# Development

## Prerequisites

- Node.js 24.15 or newer
- npm 10 or newer
- Local PGlite (started by `npm run dev` / `npm run dev:db`) for the API database

## Install

```bash
npm install
```

## Environment Files

Use the example files as local templates:

```bash
frontend/.env.example
backend/.env.example
```

Do not commit real `.env`, `.env.local`, credentials, API keys, or secrets.

## Common Commands

```bash
npm run dev
npm run dev:db
npm run dev:frontend
npm run dev:backend
npm run lint
npm run typecheck
npm run build
npm run test
```

## Branching

Keep `main` stable. Use focused feature branches, for example:

```text
feature/frontend-foundation
feature/backend-auth
feature/property-api
feature/property-search
```

## Testing Direction

Frontend tests should focus on component behavior, critical interactions, loading states, error states, and important user journeys.

Backend tests should cover API behavior, validation, authorization, database operations, business rules, and race-prone booking or availability behavior once those domains exist.
