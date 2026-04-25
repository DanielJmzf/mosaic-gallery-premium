import express from 'express';
import cors from 'cors';
import path from 'path';
import { eventsRouter } from './routes/events';

const app = express();

// CORS
const allowedOrigin = process.env.CORS_ORIGIN ?? '*';
app.use(cors({
    origin: allowedOrigin === '*' ? '*' : (origin, cb) => {
        if (!origin || origin === allowedOrigin) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
