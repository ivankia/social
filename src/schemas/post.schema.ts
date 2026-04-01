import { z } from 'zod';

export const listSchema = z
    .object({
        limit: z.coerce.number().int().positive().max(100).default(50),
        post_created_at: z.string().datetime().optional(),
        post_id: z.string().uuid().optional(),
    })
    .refine(
        (v) =>
            (v.post_created_at != null && v.post_id != null) ||
            (v.post_created_at == null && v.post_id == null),
        {
            message:
                'Cursor-based seek. Provide both post_created_at and post_id (or none).',
        },
    );

export const idParamSchema = z.object({
    id: z.string().uuid(),
});

export const contentSchema = z.object({
    content: z.string().min(1).max(16000),
});
