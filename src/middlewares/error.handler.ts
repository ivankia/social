import type {
    ErrorRequestHandler,
    NextFunction,
    Request,
    Response,
} from 'express';
import { HttpError } from '../utils/http-error';
import { logger } from '../utils/logger';

export function errorHandlerFallback(_req: Request, res: Response) {
    res.status(500).json({ message: 'Internal server error' });
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            message: err.message,
            details: err.details,
        });
    }

    logger.error('Unhandled request error', err);
    errorHandlerFallback(_req, res);
};
