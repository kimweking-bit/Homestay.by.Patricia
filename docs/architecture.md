# Architecture

## Confirmed Decisions

- The repository is a monorepo with separate `frontend/` and `backend/` applications.
- The frontend uses Next.js, React, TypeScript, the App Router, Tailwind CSS, and TanStack Query.
- The backend uses NestJS, TypeScript, REST, Prisma, PostgreSQL conventions, validation pipes, and Swagger/OpenAPI.
- Public backend routes are versioned under `/api/v1`.
- Backend services are the authority for business rules, authorization, pricing, availability, and booking state.

## Application Boundaries

The frontend owns presentation, routing, client interaction, and API consumption. It must not directly depend on database implementation details.

The backend owns validation, persistence, domain rules, security decisions, and API behavior. Controllers should stay thin and delegate application behavior to services.

## Current Structure

```text
frontend/
├── src/app/
├── src/components/
├── src/lib/
├── src/services/
└── src/types/

backend/
├── src/health/
├── src/prisma/
├── src/common/
└── prisma/
```

## Future Decisions

- Authentication strategy and session/token handling.
- Confirmed property, booking, enquiry, review, and host-management requirements.
- Media storage provider and upload flow.
- Production deployment providers and operational monitoring.
- Database schema and migration policy.

## Unresolved Questions

- What booking model does the business need: instant booking, booking requests, enquiries, or a mix?
- What roles are required at launch?
- What payment or deposit flow is expected, if any?
- What data must be captured for legal, tax, or regional compliance?
