import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { createEventSchema, listEventsSchema } from '../validators/events';
import { getIO } from '../socket';

const prisma = new PrismaClient();

// ─── POST /api/events ─────────────────────────────────────────────────────────

export async function createEvent(req: Request, res: Response): Promise<void> {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation error', details: parsed.error.flatten() });
        return;
    }

    const { title, description, event_date, tags } = parsed.data;
    const files = req.files as Express.Multer.File[] | undefined;

    try {
        const event = await prisma.event.create({
            data: {
                title: title ?? null,
                description,
                event_date: new Date(event_date),
                photos: {
                    create: (files ?? []).map((f) => ({
                        url: `/uploads/${f.filename}`,
                        originalName: f.originalname,
                        mimeType: f.mimetype,
                        size: f.size,
                    })),
                },
                tags: {
                    create: await resolveTags(tags ?? []),
                },
            },
            include: { photos: true, tags: { include: { tag: true } } },
        });

        // Normalise response shape
        const payload = normaliseEvent(event);

        // Broadcast to all connected Socket.IO clients
        try {
            getIO().emit('event:created', payload);
        } catch {
            // Socket not available; non-fatal
        }

        res.status(201).json(payload);
    } catch (err) {
        console.error('createEvent error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ─── GET /api/events ──────────────────────────────────────────────────────────

export async function listEvents(req: Request, res: Response): Promise<void> {
    const parsed = listEventsSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: 'Validation error', details: parsed.error.flatten() });
        return;
    }

    const { page, limit, search, dateFrom, dateTo, tags } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.EventWhereInput = {};

    if (search) {
        where.OR = [
            { title: { contains: search } },
            { description: { contains: search } },
        ];
    }

    if (dateFrom || dateTo) {
        where.event_date = {};
        if (dateFrom) where.event_date.gte = new Date(dateFrom);
        if (dateTo) {
            const end = new Date(dateTo);
            end.setHours(23, 59, 59, 999);
            where.event_date.lte = end;
        }
    }

    if (tags && tags.length > 0) {
        where.tags = {
            some: {
                tag: { name: { in: tags } },
            },
        };
    }

    try {
        const [total, events] = await Promise.all([
            prisma.event.count({ where }),
            prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: { event_date: 'desc' },
                include: { photos: true, tags: { include: { tag: true } } },
            }),
        ]);

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            events: events.map(normaliseEvent),
        });
    } catch (err) {
        console.error('listEvents error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ─── GET /api/events/:id ──────────────────────────────────────────────────────

export async function getEvent(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id' });
        return;
    }

    try {
        const event = await prisma.event.findUnique({
            where: { id },
            include: { photos: true, tags: { include: { tag: true } } },
        });

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        res.json(normaliseEvent(event));
    } catch (err) {
        console.error('getEvent error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveTags(tagNames: string[]) {
    return Promise.all(
        tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
                where: { name },
                update: {},
                create: { name },
            });
            return { tagId: tag.id };
        })
    );
}

type EventWithRelations = {
    id: number;
    title: string | null;
    description: string;
    event_date: Date;
    createdAt: Date;
    updatedAt: Date;
    photos: { id: number; url: string; originalName: string; mimeType: string; size: number; createdAt: Date }[];
    tags: { tag: { id: number; name: string } }[];
};

function normaliseEvent(event: EventWithRelations) {
    return {
        id: event.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date.toISOString(),
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        photos: event.photos.map((p) => ({
            id: p.id,
            url: p.url,
            originalName: p.originalName,
            mimeType: p.mimeType,
            size: p.size,
        })),
        tags: event.tags.map((et) => ({ id: et.tag.id, name: et.tag.name })),
    };
}
