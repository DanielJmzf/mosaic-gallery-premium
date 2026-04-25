# Knowledge Base – Mosaic Gallery Premium Backend

This document captures the technical knowledge, architecture decisions, required skills,
Minimal Critical Project Components (MCPs), and future roadmap for this project.

---

## 1. Required Skills to Maintain & Extend

### Core
- **TypeScript** – strict typing, generics, utility types, module resolution
- **Node.js / Express** – request lifecycle, middleware, error handling, streaming
- **Prisma ORM** – schema definition, migrations, relations, raw queries
- **SQLite** – embedded database, file-based, PRAGMA tuning; migration path to PostgreSQL
- **Socket.IO** – rooms, namespaces, event broadcasting, reconnection strategies

### Secondary
- **Zod** – schema validation, `safeParse`, transforms, error formatting
- **Multer** – multipart file handling, diskStorage, fileFilter, limits
- **REST API design** – resource naming, status codes, pagination conventions
- **CORS** – origin policies, preflight requests, credentials

### DevOps / Tooling
- **npm / package.json scripts** – lifecycle scripts, cross-env
- **dotenv** – environment variable management per environment
- **ESLint + Prettier** – code style enforcement
- **Git** – branching, conventional commits

---

## 2. Minimal Critical Project Components (MCPs)

These are the minimal components that must be healthy for the system to function:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (Static HTML/CSS/JS)                                      │
│  - Reads API: GET /api/events                                       │
│  - Writes API: POST /api/events (multipart)                         │
│  - Listens Socket.IO: event:created                                 │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ HTTP + WS (localhost:3001)
┌──────────────────────▼──────────────────────────────────────────────┐
│  Express HTTP Server (app.ts)                                        │
│  ├── CORS middleware                                                  │
│  ├── Static /uploads serving                                         │
│  ├── Router: /api/events → eventsRouter                              │
│  └── /health                                                         │
│                                                                       │
│  Socket.IO Server (socket.ts)                                        │
│  └── Attached to same http.Server instance                          │
│      └── Broadcasts: event:created                                   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ Prisma Client (ORM)
┌──────────────────────▼──────────────────────────────────────────────┐
│  SQLite Database (prisma/dev.db)                                     │
│  Tables: Event, Photo, Tag, EventTag                                 │
└─────────────────────────────────────────────────────────────────────┘
                       │ Multer (disk storage)
┌──────────────────────▼──────────────────────────────────────────────┐
│  Local filesystem: Backend/uploads/                                  │
│  Photo files with randomised names                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Summary

| From | To | Protocol | Purpose |
|---|---|---|---|
| Frontend | Backend | HTTP REST | CRUD events, pagination, filters |
| Frontend | Backend | WebSocket (Socket.IO) | Real-time new event notifications |
| Backend controller | Prisma client | Function calls | DB reads/writes |
| Backend controller | Socket.IO | `getIO().emit()` | Push to all connected clients |
| Backend | Filesystem | `fs` + Multer | Store and serve uploaded photos |
| Prisma client | SQLite file | SQLite protocol | Persist all data |

---

## 3. Future Features & Roadmap

### Authentication & Users
- **JWT or session-based auth** – protect POST endpoints so only the owner can publish
- **User profiles** – name, avatar, bio
- **Multiple users / followers** – turn this into a shared timeline
- **OAuth 2.0** – login with Google/GitHub

### Media & Storage
- **Cloud storage** – migrate uploads from local disk to AWS S3 / Cloudflare R2
- **Image optimisation** – resize and convert to WebP on upload (Sharp library)
- **Video support** – short-form video events
- **CDN serving** – serve media from a CDN for performance

### Content
- **Reactions / likes** – emoji reactions on events
- **Comments** – threaded comments per event
- **Pinned events** – pin important moments to the top
- **Categories / albums** – group events by album or category beyond tags
- **Markdown descriptions** – rich text rendering

### Discovery & Search
- **Full-text search** – FTS5 in SQLite or Elasticsearch for large datasets
- **Map/location** – attach GPS coordinates to events, show on a map
- **Calendar view** – visualise events on a monthly calendar

### Infrastructure
- **PostgreSQL** – migrate from SQLite for multi-user production use
- **Docker Compose** – containerise backend + database for easy deployment
- **CI/CD pipeline** – GitHub Actions: lint → typecheck → test → deploy
- **Monitoring** – structured logging (Pino), error tracking (Sentry)
- **Rate limiting** – protect API from abuse (express-rate-limit)

### Developer Experience
- **Integration tests** – Vitest or Jest + Supertest for API endpoints
- **OpenAPI/Swagger** – auto-generated API docs with validation
- **Database seeding** – `prisma db seed` for demo data
- **Environment stages** – dev / staging / production `.env` strategy

---

## 4. Skills Necessary for Future Copilot / Agent Workflow

When using an AI coding agent (GitHub Copilot, Copilot Coding Agent, etc.) on this project,
the agent needs the following capabilities to be effective:

### Testing
- Write and run **unit tests** (controllers, validators) with Jest/Vitest
- Write **integration tests** with Supertest against a test database
- Use **test fixtures / factories** for Prisma models

### Linting & Formatting
- Run ESLint with TypeScript rules (`@typescript-eslint`)
- Auto-fix formatting with Prettier
- Enforce Conventional Commits

### Type Safety
- Keep `strict: true` in tsconfig and fix all type errors before merging
- Use Prisma-generated types – never cast to `any` for DB models
- Use Zod inferred types (`z.infer<>`) for all input validation

### Schema Migrations
- Understand Prisma migration workflow: `migrate dev` → `migrate deploy`
- Never edit `migration.sql` files directly; always change `schema.prisma` and re-run migrate
- Keep migrations in version control

### Security
- Validate all user input with Zod before it reaches the database
- Use `path.basename()` when serving user-supplied filenames
- Set file size and count limits on Multer
- Never expose raw Prisma/SQL errors to clients
- Keep dependencies updated (Dependabot / `npm audit`)

### Code Quality
- Follow single-responsibility principle: routes → controllers → Prisma
- Extract shared helpers (e.g. `normaliseEvent`) to avoid duplication
- Write descriptive commit messages (Conventional Commits)
- Document non-obvious decisions in inline comments

---

## 5. Recommended Development Tools

| Tool | Purpose |
|---|---|
| Prisma Studio (`npm run prisma:studio`) | Visual DB browser |
| Insomnia / Postman | API manual testing |
| VS Code + Prisma extension | Schema syntax highlighting |
| VS Code + ESLint + Prettier extensions | Code quality |
| TablePlus | SQLite GUI |
| Socket.IO Admin UI | Real-time connection monitoring |
