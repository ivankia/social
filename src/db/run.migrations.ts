import { AppDataSource } from './data.source';
import { logger } from '../utils/logger';

async function run() {
    try {
        logger.info('Running migrations...');
        await AppDataSource.initialize();
        const res = await AppDataSource.runMigrations();
        logger.info(`Migrations applied: ${res.length}`);
    } finally {
        await AppDataSource.destroy().catch(() => undefined);
    }
}

void run().catch((err) => {
    logger.error(err);
    process.exit(1);
});
