---
name: cognify-architecture
description: Provides comprehensive architectural context, entity models, feature breakdown, API conventions, and frontend/backend rules for the Cognify educational social media platform.
---

# Cognify Project Context & Architecture Skill

When working on the **Cognify** project, follow these established rules, directory conventions, and patterns.

## Tech Stack Overview
- **Backend**: NestJS (TypeScript), TypeORM, PostgreSQL, Passport JWT, Socket.io, Class Validator, Swagger.
- **Frontend**: Next.js 19 App Router, TypeScript, Tailwind CSS, Shadcn UI, React Query (TanStack v5), React Hook Form + Zod, Socket.io Client.
- **Database & Containerization**: PostgreSQL (UUID v4 keys), Docker Compose (`docker-compose.yml` with backend, frontend, postgres, pgadmin).

---

## Credentials Reference
Development credentials for System Admin, PgAdmin, and Postgres DB are saved locally in [CREDENTIALS.md](file:///c:/Users/Lenovo/Desktop/Practice-projects/Social-media/cognify/CREDENTIALS.md) (excluded from git via `.gitignore`).

- **System Admin Login**: `admin@cognify.com` / `AdminPassword123!`
- **PgAdmin Login**: `admin@cognify.com` / `admin`
- **Postgres Credentials**: `cognify_user` / `cognify_password`

---

## Architectural Rules

### 1. Frontend Rules (`cognify/frontend/src/`)
- **Feature-Driven Structure**: Each feature lives inside `src/features/<feature_name>/` containing:
  - `api/` - Axios service calls.
  - `queries/` & `mutations/` - Custom React Query hooks.
  - `queryKeys.ts` - Query key factory functions.
  - `schemas/` - Zod validation schemas.
  - `types/` - TypeScript interface definitions.
  - `components/` - React components for this feature.
- **NO Direct Axios Calls in Components**: UI components MUST ONLY consume custom React Query hooks from `queries/` or `mutations/`.
- **Form Handling**: Use `react-hook-form` with `@hookform/resolvers/zod`.
- **Server vs Client Components**: Default to Server Components. Use `"use client"` only for components requiring hooks, DOM events, or Socket.io connection.

### 2. Backend Rules (`cognify/backend/src/`)
- **Module Breakdown**: Feature modules live in `src/modules/<feature_name>/` containing:
  - `<feature>.controller.ts`
  - `<feature>.service.ts`
  - `<feature>.module.ts`
  - `entities/` - TypeORM entity classes with UUID primary keys.
  - `dto/` - Input/output DTOs with `class-validator` annotations.
- **Service Layer Guard**: Never place database logic in controllers. Controllers handle HTTP routing/validation; services execute business logic via repositories.
- **Error Handling**: Use standard NestJS HTTP exceptions (`NotFoundException`, `UnauthorizedException`, `BadRequestException`).
- **Pagination**: Use cursor-based pagination for high-volume collections (Feed, Comments, Notifications).

---

## Quick Reference Commands
- Run containers in background: `cd cognify && docker compose up -d`
- Access Swagger API Docs: `http://localhost:4000/api/docs`
- Access Frontend UI: `http://localhost:3000`
- Access PgAdmin Dashboard: `http://localhost:5050`
