import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

function safeSerialize(value: unknown) {
    if (typeof value === 'string') {
        return value.length > 1000 ? `${value.slice(0, 1000)}...` : value;
    }

    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
}

export function requestResponseLogger(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const start = process.hrtime();
    const { method, originalUrl, headers, query, body } = req;

    logger.debug('Incoming request', {
        method,
        url: originalUrl,
        headers: safeSerialize(headers),
        query: safeSerialize(query),
        body: safeSerialize(body),
    });

    const oldSend = res.send.bind(res);
    let responseBody: unknown;

    res.send = function (payload: unknown) {
        responseBody = safeSerialize(payload);
        return oldSend(payload);
    } as typeof res.send;

    function logResponse() {
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = Math.round(seconds * 1000 + nanoseconds / 1e6);

        logger.debug('Outgoing response', {
            method,
            url: originalUrl,
            status: res.statusCode,
            durationMs,
            body: responseBody,
        });
    }

    res.once('finish', logResponse);
    res.once('close', logResponse);

    next();
}
