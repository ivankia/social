import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    DB_HOST: z.string().default('mariadb'),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_USER: z.string().default('social'),
    DB_PASSWORD: z.string().default('social'),
    DB_NAME: z.string().default('social'),
    JWT_ACCESS_SECRET: z
        .string()
        .min(16)
        .default('access_secret_qy3d34yny34rc1'),
    JWT_REFRESH_SECRET: z
        .string()
        .min(16)
        .default('refresh_secret_wqc98y30ny48'),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('error'),
});

export const env = envSchema.parse(process.env);
