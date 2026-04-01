import { Router } from 'express';
import { authRouter } from './auth.routes';
import { postRouter } from './post.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/posts', postRouter);
