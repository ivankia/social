import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(2).max(50),
    password: z.string().min(8).max(50),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(50),
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(10),
});
