import './types/express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { swaggerSetup } from './swagger';
import { router } from './routes';
import { errorHandler } from './middlewares/error.handler';
import { requestResponseLogger } from './middlewares/request-response.logger';
import { logger } from './utils/logger';

export function createApp() {
    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '1mb' }));
    app.use(requestResponseLogger);
    app.use(
        morgan('combined', {
            stream: {
                write: (message) => logger.info(message.trim()),
            },
        }),
    );

    app.get('/health', (_req, res) => {
        res.json({ ok: true });
    });

    swaggerSetup(app);
    app.use('/api', router);

    app.use(errorHandler);
    return app;
}
