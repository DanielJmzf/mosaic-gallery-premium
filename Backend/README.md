# Backend API – Daniel & Laura Timeline

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Database | SQLite via Prisma ORM |
| Real-time | Socket.IO 4 |
| Validation | Zod |
| File uploads | Multer |

---

## Getting started

```bash
cd Backend
cp .env.example .env
npm install
npm run prisma:migrate   # creates dev.db and runs migrations
npm run dev              # starts server on http://localhost:3001
```

---

## REST API Reference

Base URL: `http://localhost:3001`

### `POST /api/events`

Create a new event. Accepts `multipart/form-data`.

**Fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `description` | string | ✅ | Event description (max 5000 chars) |
| `event_date` | string (ISO date) | ✅ | Date of the event (e.g. `2026-04-20`) |
| `title` | string | ❌ | Optional title (max 200 chars) |
| `tags` | string | ❌ | Comma-separated tags (e.g. `viaje,playa`) |
| `photos` | file(s) | ❌ | Up to 10 images (JPEG, PNG, WebP, GIF, AVIF, max 10 MB each) |

**Response 201**

```json
{
  "id": 1,
  "title": "Viaje a la playa",
  "description": "Un día increíble...",
  "event_date": "2026-04-20T00:00:00.000Z",
  "createdAt": "2026-04-25T00:00:00.000Z",
  "updatedAt": "2026-04-25T00:00:00.000Z",
  "photos": [
    { "id": 1, "url": "/uploads/17000000-abc123.jpg", "originalName": "beach.jpg", "mimeType": "image/jpeg", "size": 204800 }
  ],
  "tags": [
    { "id": 1, "name": "viaje" },
    { "id": 2, "name": "playa" }
  ]
}
```

---

### `GET /api/events`

List events with optional filters and pagination.

**Query parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number (1-based) |
| `limit` | number | 10 | Results per page (max 100) |
| `search` | string | – | Text search in title and description |
| `dateFrom` | ISO date string | – | Filter events on or after this date |
| `dateTo` | ISO date string | – | Filter events on or before this date |
| `tags` | string | – | Comma-separated tag names (OR match) |

**Response 200**

```json
{
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "events": [ /* array of event objects */ ]
}
```

---

### `GET /api/events/:id`

Retrieve a single event by numeric ID.

**Response 200** – event object (same shape as above)  
**Response 404** – `{ "error": "Event not found" }`

---

### `GET /uploads/:filename`

Serve an uploaded image file (static).

---

### `GET /health`

Health check.

```json
{ "status": "ok", "timestamp": "2026-04-25T01:00:00.000Z" }
```

---

## Database Schema

```
Event
  id          Int       PK auto-increment
  title       String?   optional
  description String
  event_date  DateTime
  createdAt   DateTime  default now()
  updatedAt   DateTime  auto-updated
  photos      Photo[]   1-to-many
  tags        EventTag[] many-to-many via join table

Photo
  id           Int      PK
  url          String   e.g. /uploads/filename.jpg
  originalName String
  mimeType     String
  size         Int      bytes
  eventId      Int      FK → Event.id (cascade delete)
  createdAt    DateTime

Tag
  id   Int    PK
  name String unique

EventTag (join table)
  eventId Int  FK → Event.id
  tagId   Int  FK → Tag.id
  PK: (eventId, tagId)
```

---

## Real-time (Socket.IO)

The server emits the following events to all connected clients:

| Event | Payload | When |
|---|---|---|
| `event:created` | Full event object | After a new event is successfully created |

**Client-side example**

```js
const socket = io('http://localhost:3001');
socket.on('event:created', (event) => {
  console.log('New event:', event);
});
```

---

## Environment Variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | HTTP server port |
| `CORS_ORIGIN` | `http://localhost:5500` | Allowed frontend origin (`*` for any) |
| `UPLOADS_DIR` | `uploads` | Directory for uploaded files (relative to Backend/) |
| `NODE_ENV` | `development` | Node environment |

---

## NPM Scripts

| Script | Command |
|---|---|
| `npm run dev` | Start development server with hot-reload (`ts-node-dev`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled server (`dist/server.js`) |
| `npm run prisma:migrate` | Run pending Prisma migrations |
| `npm run prisma:generate` | Re-generate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio (DB browser) |
| `npm run typecheck` | TypeScript type-check without emit |
