import { z } from 'zod';

export const idUserSchema = z.object({
    id: z.string(),
});
