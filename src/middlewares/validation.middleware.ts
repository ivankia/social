import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { HttpError } from '../utils/http-error';

function createValidationMiddleware<T extends ZodTypeAny>(
    schema: T,
    source: 'body' | 'query' | 'params',
    errorMessage: string,
): RequestHandler {
    return (req, _res, next) => {
        try {
            const parsed = schema.parse(
                source === 'body'
                    ? req.body
                    : source === 'query'
                      ? req.query
                      : req.params,
            );

            if (source === 'body') req.validatedBody = parsed;
            if (source === 'query') req.validatedQuery = parsed;
            if (source === 'params') req.validatedParams = parsed;

            next();
        } catch {
            next(new HttpError(400, errorMessage));
        }
    };
}

export const validateBody = <T extends ZodTypeAny>(
    schema: T,
    errorMessage = 'Invalid body',
) => createValidationMiddleware(schema, 'body', errorMessage);

export const validateQuery = <T extends ZodTypeAny>(
    schema: T,
    errorMessage = 'Invalid query params',
) => createValidationMiddleware(schema, 'query', errorMessage);

export const validateParams = <T extends ZodTypeAny>(
    schema: T,
    errorMessage = 'Invalid path params',
) => createValidationMiddleware(schema, 'params', errorMessage);
