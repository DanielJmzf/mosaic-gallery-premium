# Daniel & Laura – Mosaic Gallery Premium

Personal social-network style timeline for Daniel & Laura.
A monorepo with a static **Frontend** and a Node.js **Backend**.

```
mosaic-gallery-premium/
├── Frontend/           ← Static site (HTML + CSS + JS)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/         ← Images
│
├── Backend/            ← Node.js + Express + Socket.IO + Prisma
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── socket.ts
│   │   ├── config/upload.ts
│   │   ├── controllers/events.ts
│   │   ├── routes/events.ts
│   │   └── validators/events.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── uploads/        ← Uploaded photos (git-ignored)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── README.md       ← API docs & DB schema
│   └── KNOWLEDGE.md    ← Architecture, skills, MCPs, roadmap
│
└── README.md           ← This file
```

---

## Quick Start

### 1 – Start the Backend

```bash
cd Backend
cp .env.example .env         # copy environment config
npm install                  # install dependencies
npm run prisma:migrate       # create SQLite DB + run migrations
npm run dev                  # start server → http://localhost:3001
```

The backend exposes:
- `GET  /api/events` – list events (filters + pagination)
- `POST /api/events` – create event (multipart/form-data)
- `GET  /api/events/:id` – single event
- `GET  /uploads/:file` – serve uploaded photos
- `GET  /health` – health check

### 2 – Open the Frontend

Open `Frontend/index.html` in your browser.

> **Tip:** Use a local static server for a better experience (avoids CORS issues with `file://`):
>
> ```bash
> # Option A – VS Code Live Server extension (right-click index.html → Open with Live Server)
> # Option B – npx
> npx serve Frontend
> # Option C – Python
> cd Frontend && python3 -m http.server 5500
> ```
>
> Then visit `http://localhost:5500`.

Make sure the `CORS_ORIGIN` in `Backend/.env` matches your frontend URL.

---

## Features

### Frontend
- Responsive mosaic photo gallery
- Smooth scroll + reveal animations
- **Eventos section** – personal timeline of events
- Create-event form (title, description, date, tags, photos)
- Real-time updates via Socket.IO (new events appear instantly)
- Filters: text search, date range, tags
- Photo lightbox
- Pagination

### Backend
- REST API (Express + TypeScript)
- SQLite database via Prisma ORM
- File uploads stored in `Backend/uploads/`
- Zod input validation
- Socket.IO broadcast on event creation
- CORS configured for local development

---

## Environment Variables

See `Backend/.env.example` for all available variables.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend HTTP port |
| `CORS_ORIGIN` | `http://localhost:5500` | Frontend origin allowed by CORS |
| `UPLOADS_DIR` | `uploads` | Upload directory (relative to Backend/) |
| `NODE_ENV` | `development` | Node environment |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (custom properties), Vanilla JS |
| Backend | Node.js 20+, Express 4, TypeScript 5 |
| Database | SQLite (via Prisma ORM) |
| Real-time | Socket.IO 4 |
| Validation | Zod |
| File upload | Multer |

---

## Documentation

- [`Backend/README.md`](Backend/README.md) – full API reference, DB schema, scripts
- [`Backend/KNOWLEDGE.md`](Backend/KNOWLEDGE.md) – architecture, MCPs, future features, skills
