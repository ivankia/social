import bcrypt from 'bcryptjs';
import { RegisterInput, LoginInput } from '../types/auth';
import { AppDataSource } from '../db/data.source';
import { HttpError } from '../utils/http-error';
import type { JwtService } from './jwt.service';
import { JwtService as JwtServiceImpl } from './jwt.service';
import { User } from '../models/entities/user';

export class AuthService {
    private readonly jwtService: JwtService;

    constructor(jwtService: JwtServiceImpl = new JwtServiceImpl()) {
        this.jwtService = jwtService;
    }

    async register(
        input: RegisterInput,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const userRepo = AppDataSource.getRepository(User);

        const email = input.email.trim().toLowerCase();
        const username = input.username.trim();
        const password = input.password;

        const existing = await userRepo.findOne({
            where: { email },
            select: ['id'],
        });
        if (existing) {
            throw new HttpError(409, 'Email already registered');
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = userRepo.create({
            email,
            username,
            passwordHash,
        });
        await userRepo.save(user);

        const accessToken = this.jwtService.signAccessToken(
            user.id,
            'authenticated',
        );
        const refreshToken = this.jwtService.signRefreshToken(user.id);

        return { accessToken, refreshToken };
    }

    async login(
        input: LoginInput,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const userRepo = AppDataSource.getRepository(User);

        const email = input.email.trim().toLowerCase();
        const user = await userRepo.findOne({
            where: { email },
            select: ['id', 'email', 'passwordHash'],
        });

        if (!user) {
            throw new HttpError(401, 'Invalid email or password');
        }

        const ok = await bcrypt.compare(input.password, user.passwordHash);
        if (!ok) {
            throw new HttpError(401, 'Invalid email or password');
        }

        const accessToken = this.jwtService.signAccessToken(
            user.id,
            'authenticated',
        );
        const refreshToken = this.jwtService.signRefreshToken(user.id);
        return { accessToken, refreshToken };
    }

    async refresh(
        refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        let payload: ReturnType<JwtServiceImpl['verifyRefreshToken']>;
        try {
            payload = this.jwtService.verifyRefreshToken(refreshToken);
        } catch {
            throw new HttpError(401, 'Invalid refresh token');
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: payload.sub },
            select: ['id'],
        });
        if (!user) {
            throw new HttpError(401, 'Invalid refresh token');
        }

        const accessToken = this.jwtService.signAccessToken(
            user.id,
            'authenticated',
        );
        return { accessToken, refreshToken };
    }
}
