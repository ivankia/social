import { Router } from 'express';
import { validateBody } from '../middlewares/validation.middleware';
import { AuthController } from '../controllers/auth.controller';
import {
    loginSchema,
    refreshSchema,
    registerSchema,
} from '../schemas/auth.schema';

export const authRouter = Router();

const controller = new AuthController();

authRouter.post('/register', validateBody(registerSchema), controller.register);
authRouter.post('/login', validateBody(loginSchema), controller.login);
authRouter.post('/refresh', validateBody(refreshSchema), controller.refresh);
