import { z } from 'zod';
import type { Request, Response } from 'express';
import type { ValidatedRequest } from '../types/express';
import { idUserSchema } from '../schemas/user.schema';
import { asyncHandler } from '../utils/async.handler';
import { UserService } from '../services/user.service';

export class UserController {
    private readonly userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    posts = asyncHandler(async (req: Request, res: Response) => {
        const validatedReq = req as ValidatedRequest<
            unknown,
            z.infer<typeof idUserSchema>,
            unknown
        >;
        const { id } = validatedReq.validatedQuery;
        const post = await this.userService.getPosts(id);
        res.json(post);
    });
}
