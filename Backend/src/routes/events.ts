import { Router } from 'express';
import { upload } from '../config/upload';
import { createEvent, listEvents, getEvent } from '../controllers/events';

export const eventsRouter = Router();

// GET /api/events – list with filters + pagination
eventsRouter.get('/', listEvents);

// GET /api/events/:id – single event
eventsRouter.get('/:id', getEvent);

// POST /api/events – create event with optional photo uploads
eventsRouter.post('/', upload.array('photos', 10), createEvent);
