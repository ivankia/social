import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthRole } from '../types/auth';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/token';

export class JwtService {
    signAccessToken(
        userId: string,
        role: Extract<AuthRole, 'authenticated'>,
    ): string {
        return jwt.sign(
            { sub: userId, role } satisfies AccessTokenPayload,
            env.JWT_ACCESS_SECRET,
            {
                expiresIn: env.JWT_ACCESS_TTL_SECONDS,
            },
        );
    }

    signRefreshToken(userId: string): string {
        return jwt.sign(
            { sub: userId } satisfies RefreshTokenPayload,
            env.JWT_REFRESH_SECRET,
            {
                expiresIn: env.JWT_REFRESH_TTL_SECONDS,
            },
        );
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        if (typeof decoded === 'string' || decoded === null) {
            throw new Error('Invalid access token payload');
        }

        const payload = decoded as Partial<AccessTokenPayload>;
        if (!payload.sub || payload.role !== 'authenticated') {
            throw new Error('Invalid access token payload');
        }
        return payload as AccessTokenPayload;
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
        if (typeof decoded === 'string' || decoded === null) {
            throw new Error('Invalid refresh token payload');
        }

        const payload = decoded as Partial<RefreshTokenPayload>;
        if (!payload.sub) {
            throw new Error('Invalid refresh token payload');
        }
        return payload as RefreshTokenPayload;
    }
}
