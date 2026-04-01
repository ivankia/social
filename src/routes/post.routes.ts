import { Router } from 'express';
import {
    validateBody,
    validateParams,
    validateQuery,
} from '../middlewares/validation.middleware';
import { requireAuthenticated } from '../middlewares/auth.guard';
import { requirePostOwner } from '../middlewares/post-owner.guard';
import { PostController } from '../controllers/post.controller';
import {
    contentSchema,
    idParamSchema,
    listSchema,
} from '../schemas/post.schema';

export const postRouter = Router();

const controller = new PostController();

postRouter.get('/', validateQuery(listSchema), controller.list);
postRouter.get(
    '/:id',
    validateParams(idParamSchema, 'Invalid post id'),
    controller.getById,
);
postRouter.post(
    '/',
    requireAuthenticated,
    validateBody(contentSchema, 'Invalid body'),
    controller.create,
);
postRouter.put(
    '/:id',
    requireAuthenticated,
    validateParams(idParamSchema, 'Invalid post id'),
    requirePostOwner,
    validateBody(contentSchema, 'Invalid body'),
    controller.update,
);
postRouter.delete(
    '/:id',
    requireAuthenticated,
    validateParams(idParamSchema, 'Invalid post id'),
    requirePostOwner,
    controller.remove,
);
