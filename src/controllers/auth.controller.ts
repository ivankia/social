import { z } from 'zod';
import type { Request, Response } from 'express';
import type { ValidatedRequest } from '../types/express';
import {
    registerSchema,
    loginSchema,
    refreshSchema,
} from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/async.handler';
import { JwtService } from '../services/jwt.service';

export class AuthController {
    private readonly authService: AuthService;

    constructor() {
        this.authService = new AuthService(new JwtService());
    }

    register = asyncHandler(async (req: Request, res: Response) => {
        const validatedReq = req as ValidatedRequest<
            z.infer<typeof registerSchema>
        >;
        const body = validatedReq.validatedBody;
        const tokens = await this.authService.register(body);
        res.status(201).json(tokens);
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const validatedReq = req as ValidatedRequest<
            z.infer<typeof loginSchema>
        >;
        const body = validatedReq.validatedBody;
        const tokens = await this.authService.login(body);
        res.json(tokens);
    });

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const validatedReq = req as ValidatedRequest<
            z.infer<typeof refreshSchema>
        >;
        const body = validatedReq.validatedBody;
        const tokens = await this.authService.refresh(body.refreshToken);
        res.json(tokens);
    });
}
