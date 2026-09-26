# Cognify — Developer Guide

This document explains **what to do after making code changes** in the frontend or backend when running Cognify via Docker.

---

## 📁 Project Structure

```
cognify/
├── backend/          # NestJS API (port 4000)
├── frontend/         # Next.js app (port 3000)
├── docker-compose.yml
├── DEVELOPMENT.md    # ← This file
└── CREDENTIALS.md
```

---

## 🚦 Starting the Platform (First Time or Clean Start)

```bash
# 1. Build Docker images from scratch (always use --no-cache first time)
docker compose build --no-cache

# 2. Start all containers
docker compose up -d

# 3. Seed the database (run once after first start)
docker compose exec -T backend npm run seed
```

After seeding, the following accounts are available:

| Role  | Username | Email                  | Password          | Specialty |
|-------|----------|------------------------|-------------------|-----------|
| Admin | admin | admin@cognify.com      | AdminPassword123! | Lead Administrator |
| User  | dr_elena_ai | elena.ai@cognify.edu   | Password123!      | AI Research & LLMs |
| User  | marcus_code | marcus.dev@cognify.edu | Password123!      | Distributed Systems & Go |
| User  | sophia_design | sophia.ux@cognify.edu  | Password123!      | UI/UX & Design Systems |
| User  | prof_david_math | david.math@cognify.edu | Password123!      | Mathematics & Linear Algebra |
| User  | priya_data | priya.data@cognify.edu | Password123!      | Data Science & Analytics |
| User  | alex_security | alex.sec@cognify.edu   | Password123!      | Cybersecurity & Zero Trust |
| User  | dr_hannah_bio | hannah.bio@cognify.edu | Password123!      | Computational Biology |
| User  | leo_frontend | leo.web@cognify.edu    | Password123!      | Next.js & Frontend |
| User  | zara_neuro | zara.neuro@cognify.edu | Password123!      | Cognitive Neuroscience |
| User  | kenji_cloud | kenji.cloud@cognify.edu| Password123!      | DevOps & Cloud/Docker |

---

## 🔄 After Making Code Changes

> ⚠️ **Critical Rule**: Running `docker compose up -d` alone does NOT rebuild images. It reuses the old cached image. You MUST rebuild after any code change.

### Option A — Rebuild Everything (Safest)

```bash
docker compose up -d --build
```

This rebuilds only the services whose source files changed. Use this for most day-to-day changes.

### Option B — Rebuild a Specific Service Only

```bash
# Rebuild only the frontend
docker compose up -d --build frontend

# Rebuild only the backend
docker compose up -d --build backend
```

### Option C — Full Clean Rebuild (If Stale Cache Issues)

Use this when you suspect Docker is still serving old code despite rebuilding:

```bash
docker compose build --no-cache
docker compose up -d
```

---

## 🖥️ Frontend Changes

| Change Type | What to Run |
|---|---|
| Added a new page/route | `docker compose up -d --build frontend` |
| Changed a component | `docker compose up -d --build frontend` |
| Updated `tailwind.config.ts` or `globals.css` | `docker compose up -d --build frontend` |
| Updated `next.config.js` | `docker compose up -d --build frontend` |
| Added a new npm package | `docker compose build --no-cache frontend && docker compose up -d` |

### ⚠️ Common Frontend Gotcha
If a **new page route** still shows 404 after rebuilding, it almost always means Docker used a cached `.next` build from your local machine. This is prevented by the [frontend/.dockerignore](./frontend/.dockerignore) file which excludes `.next` from the build context. If you accidentally delete `.dockerignore`, recreate it:

```
# frontend/.dockerignore
node_modules
.next
out
build
dist
.env
.env.local
.git
```

---

## ⚙️ Backend Changes

| Change Type | What to Run |
|---|---|
| Added a new module/controller/service | `docker compose up -d --build backend` |
| Changed business logic in a service | `docker compose up -d --build backend` |
| Updated `.env` (environment variables) | `docker compose up -d` (no rebuild needed) |
| Added a new npm package | `docker compose build --no-cache backend && docker compose up -d` |
| Updated `seed.js` | `docker compose up -d --build backend` then re-run seed |

### ⚠️ Common Backend Gotcha — bcrypt on Alpine
`bcrypt` is a native C++ module. On `node:20-alpine`, it needs Python and build tools to compile. These are pre-installed in the `backend/Dockerfile`. If you ever see this error:

```
npm error gyp ERR! find Python You need to install the latest version of Python.
```

Make sure `backend/Dockerfile` has this line **before** `RUN npm install`:
```dockerfile
RUN apk add --no-cache python3 make g++
```

---

## 🗄️ Database (PostgreSQL)

The database runs inside the `cognify_postgres` container and persists data in a Docker volume (`postgres_data`).

### Re-seeding the Database
```bash
# Run seed inside the running backend container
docker compose exec -T backend npm run seed
```

Seed uses `ON CONFLICT DO NOTHING` so it is safe to run multiple times — it will not duplicate data.

### Wiping the Database (Fresh Start)
```bash
# Stop all containers AND delete volumes (wipes all data!)
docker compose down -v

# Then rebuild and restart
docker compose build --no-cache
docker compose up -d
docker compose exec -T backend npm run seed
```

---

## 📋 Useful Commands Cheat Sheet

```bash
# View logs of all containers
docker compose logs -f

# View logs of a specific container
docker compose logs -f backend
docker compose logs -f frontend

# Check running containers
docker compose ps

# Stop all containers (keeps data)
docker compose down

# Stop all containers and delete data volumes
docker compose down -v

# Restart a single service
docker compose restart frontend
docker compose restart backend

# Open a shell inside a container
docker compose exec backend sh
docker compose exec frontend sh

# Check backend API health
curl http://localhost:4000/api

# Run the database seed script
docker compose exec -T backend npm run seed
```

---

## 🌐 Service URLs

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend API | http://localhost:4000/api  |
| Swagger Docs | http://localhost:4000/api |
| pgAdmin   | http://localhost:5050        |
| Admin Portal | http://localhost:3000/login/admin |

### pgAdmin Login
- **Email**: admin@cognify.com
- **Password**: admin
- **Server Host**: postgres (internal Docker hostname)
- **Port**: 5432

---

## 📦 Adding New npm Packages

### Frontend
```bash
# 1. Add to package.json locally
cd frontend
npm install <package-name>

# 2. Rebuild Docker image (must use --no-cache for new packages)
cd ..
docker compose build --no-cache frontend
docker compose up -d
```

### Backend
```bash
# 1. Add to package.json locally
cd backend
npm install <package-name>

# 2. If it's a native module (needs compilation), ensure Dockerfile has build tools
# backend/Dockerfile already includes: RUN apk add --no-cache python3 make g++

# 3. Rebuild Docker image
cd ..
docker compose build --no-cache backend
docker compose up -d
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Page shows 404 after adding new route | Run `docker compose up -d --build frontend` — Docker was using old cached image |
| `npm run seed` says "Missing script: seed" | Rebuild backend: `docker compose up -d --build backend` |
| `bcrypt` fails with Python not found | Check `backend/Dockerfile` has `RUN apk add --no-cache python3 make g++` |
| Changes not visible after `--build` | Use `docker compose build --no-cache` — Docker layer cache may be stale |
| Backend won't connect to database | Wait 5-10s for postgres to fully initialize, then restart backend: `docker compose restart backend` |
| Port already in use | Run `docker compose down` first, then `docker compose up -d` |
