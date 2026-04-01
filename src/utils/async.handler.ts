import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function asyncHandler<Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
    return (req, res, next) => {
        void fn(req as Req, res, next).catch(next);
    };
}
