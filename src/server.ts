import 'reflect-metadata';
import type { Server } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { AppDataSource } from './db/data.source';
import { logger } from './utils/logger';

async function shutdown(server: Server) {
    logger.info('Close signal received. Graceful shutdown started...');

    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            logger.info('Database connection closed.');
        }
    } catch (error) {
        logger.error('Error while closing database connection:', error);
    }

    server.close((closeError) => {
        if (closeError) {
            logger.error('HTTP server close error:', closeError);
            process.exit(1);
        }

        logger.info('HTTP server closed.');
        process.exit(0);
    });

    setTimeout(() => {
        logger.warn('Forced shutdown after timeout.');
        process.exit(1);
    }, 10000).unref();
}

async function main() {
    await AppDataSource.initialize();
    const app = createApp();
    const server = app.listen(env.PORT, () => {
        logger.info(`API listening on port ${env.PORT}`);
    });

    process.on('SIGTERM', () => {
        void shutdown(server);
    });
    process.on('SIGINT', () => {
        void shutdown(server);
    });
}

main().catch((error) => {
    logger.error('Failed to start application:', error);
    process.exit(1);
});
