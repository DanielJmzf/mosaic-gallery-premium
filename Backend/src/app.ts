import express from 'express';
import cors from 'cors';
import path from 'path';
import { eventsRouter } from './routes/events';

const app = express();

// CORS – only allow wildcard in explicit development mode; otherwise use an allowlist
const isDev = process.env.NODE_ENV !== 'production';
const corsOriginEnv = process.env.CORS_ORIGIN;

// Build a fixed allowlist from the comma-separated env variable, or fall back to
// localhost-only defaults in development.  Never allow '*' in production.
const originAllowlist: string[] = corsOriginEnv
    ? corsOriginEnv.split(',').map((o) => o.trim()).filter(Boolean)
    : isDev
      ? ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000']
      : [];

app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no Origin header (same-origin / curl / mobile apps)
        if (!origin) return cb(null, true);
        if (originAllowlist.includes(origin)) return cb(null, true);
        cb(new Error(`Origin '${origin}' not allowed by CORS policy`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files – uploaded photos
const uploadsDir = path.resolve(__dirname, '..', process.env.UPLOADS_DIR ?? 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/events', eventsRouter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
