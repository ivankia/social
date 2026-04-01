import type { AuthUser } from './auth';
import type { Request as ExpressRequest } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            validatedBody?: unknown;
            validatedQuery?: unknown;
            validatedParams?: unknown;
        }
    }
}

export type ValidatedRequest<
    Body = unknown,
    Query = unknown,
    Params = unknown,
> = ExpressRequest<Params, any, Body, Query> & {
    validatedBody: Body;
    validatedQuery: Query;
    validatedParams: Params;
};

export {};
