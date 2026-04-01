import type { NextFunction, Request, Response } from 'express';
import { JwtService } from '../services/jwt.service';
import { HttpError } from '../utils/http-error';

const jwtService = new JwtService();

function extractBearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;
    if (!header.startsWith('Bearer ')) return null;
    const token = header.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
}

export function requireAuthenticated(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    const token = extractBearerToken(req);
    if (!token) return next(new HttpError(401, 'Missing access token'));

    try {
        const payload = jwtService.verifyAccessToken(token);
        req.user = { id: payload.sub, role: 'authenticated' };
        return next();
    } catch {
        return next(new HttpError(401, 'Invalid access token'));
    }
}
