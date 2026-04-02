import { Router } from 'express';
import { validateQuery } from '../middlewares/validation.middleware';
import { UserController } from '../controllers/user.controller';
import { idUserSchema } from '../schemas/user.schema';

export const userRouter = Router();

const controller = new UserController();

userRouter.get(
    '/',
    validateQuery(idUserSchema, 'Invalid user id'),
    controller.posts,
);
