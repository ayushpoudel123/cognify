# Cognify Platform Architecture & System Design

Cognify is an educational social media platform built with NestJS (Backend) and Next.js App Router (Frontend).

## Tech Stack
- **Frontend**: Next.js 19 (App Router), TypeScript, Tailwind CSS, Shadcn UI, React Query (TanStack Query v5), React Hook Form, Zod, Axios, Socket.io Client, Framer Motion.
- **Backend**: NestJS, TypeScript, PostgreSQL, TypeORM, JWT Auth, Passport, Socket.io, Class Validator, Class Transformer, Swagger.
- **Infrastructure**: Docker Compose (Frontend, Backend, PostgreSQL, PgAdmin).

---

## Directory Structure
```
cognify/
├── ARCHITECTURE.md                 # System Architecture & API Specification
├── docker-compose.yml              # Local multi-container Docker config
├── skills/
│   └── cognify-architecture/
│       └── SKILL.md                # AI agent context skill file
├── backend/                        # NestJS Backend Application
│   ├── Dockerfile
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/                # Guards, Filters, Interceptors, Decorators, Base Entities
│   │   └── modules/               # Feature Modules (auth, users, posts, media, comments, reactions, bookmarks, follows, feed, search, notifications, chat, analytics, reports, admin)
└── frontend/                       # Next.js Frontend Application
    ├── Dockerfile
    ├── src/
    │   ├── app/                   # App Router Pages
    │   ├── shared/                # Primitives, UI components, Layouts, Providers
    │   └── features/              # Feature modules (api, components, hooks, queries, mutations, schemas, types)
```

---

## Database Schemas & Entities
- **User**: `id (UUID)`, `email`, `username`, `passwordHash`, `role (USER|ADMIN)`, `isVerified`, `isActive`, timestamps.
- **Profile**: `id`, `userId`, `avatar`, `coverImage`, `bio`, `education`, `skills (jsonb)`, `interests (jsonb)`, `website`, `socialLinks (jsonb)`.
- **RefreshToken**: `id`, `userId`, `tokenHash`, `expiresAt`.
- **Post**: `id`, `authorId`, `title`, `content`, `type (TEXT|IMAGE|VIDEO)`, `status (DRAFT|PUBLISHED)`, `categoryId`, `hashtags (jsonb)`, timestamps.
- **PostMedia**: `id`, `postId`, `url`, `type`, `order`.
- **Comment**: `id`, `postId`, `authorId`, `parentId (null for root, ID for reply)`, `content`, timestamps.
- **Reaction**: `id`, `userId`, `targetType (POST|COMMENT)`, `targetId`, `type (LIKE)`.
- **Bookmark**: `id`, `userId`, `postId`.
- **Follow**: `id`, `followerId`, `followingId`.
- **Category** & **Tag** & **PostTag**: Categorization and indexing entities.
- **Conversation** & **Message**: 1-on-1 real-time messaging schema.
- **Notification**: `id`, `recipientId`, `actorId`, `type`, `entityId`, `read`.
- **Report**: `id`, `reporterId`, `targetType`, `targetId`, `reason`, `status`.

---

## Key Design Patterns & Rules
1. **Frontend**:
   - Zero direct Axios calls inside UI components. All API logic resides in `features/<name>/api/` and `features/<name>/queries.ts` / `mutations.ts`.
   - Forms validated using React Hook Form + Zod (`schemas/`).
   - Server Components used for initial layout render; Client Components (`"use client"`) only where interactivity / Socket.io / local state is required.
2. **Backend**:
   - Controller -> Service -> Repository pattern strictly enforced.
   - All input validated with Class-Validator DTOs.
   - Global Exception Filter standardizes API errors into `{ statusCode, message, error, timestamp, path }`.
   - Cursor pagination used for Feeds, Comments, Notifications, and Search results.
