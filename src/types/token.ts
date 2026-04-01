import type { AuthRole } from '../types/auth';

export type AccessTokenPayload = {
    sub: string;
    role: Extract<AuthRole, 'authenticated'>;
};

export type RefreshTokenPayload = {
    sub: string;
};
