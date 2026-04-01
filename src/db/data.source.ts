import path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/env';

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4',
    synchronize: false,
    logging: false,
    entities: [
        path.join(__dirname, '../models/entities/**/*.ts'),
        path.join(__dirname, '../models/entities/**/*.js'),
    ],
    migrations: [
        path.join(__dirname, './migrations/**/*.ts'),
        path.join(__dirname, './migrations/**/*.js'),
    ],
    migrationsRun: false,
    extra: {
        connectionLimit: 10,
    },
});
