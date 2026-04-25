import { z } from 'zod';

export const createEventSchema = z.object({
    title: z.string().max(200).optional(),
    description: z.string().min(1, 'Description is required').max(5000),
    event_date: z.string().refine((v) => !isNaN(Date.parse(v)), {
        message: 'event_date must be a valid date string',
    }),
    tags: z
        .string()
        .optional()
        .transform((v) =>
            v
                ? v.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
                : []
        ),
});

export const listEventsSchema = z.object({
    page: z
        .string()
        .optional()
        .default('1')
        .transform(Number)
        .refine((n) => n >= 1, { message: 'page must be >= 1' }),
    limit: z
        .string()
        .optional()
        .default('10')
        .transform(Number)
        .refine((n) => n >= 1 && n <= 100, { message: 'limit must be 1-100' }),
    search: z.string().max(200).optional(),
    dateFrom: z
        .string()
        .optional()
        .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'dateFrom must be a valid date' }),
    dateTo: z
        .string()
        .optional()
        .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'dateTo must be a valid date' }),
    tags: z
        .string()
        .optional()
        .transform((v) =>
            v ? v.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : undefined
        ),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type ListEventsInput = z.infer<typeof listEventsSchema>;
