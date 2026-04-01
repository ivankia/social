import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../utils/async.handler';
import { AppDataSource } from '../db/data.source';
import { Post } from '../models/entities/post';
import { HttpError } from '../utils/http-error';

export const requirePostOwner = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) return next(new HttpError(401, 'Unauthorized'));

        const rawId =
            (req.validatedParams as { id?: string } | undefined)?.id ??
            req.params.id;
        const postId = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!postId) return next(new HttpError(400, 'Missing post id'));

        const post = await AppDataSource.getRepository(Post).findOne({
            where: { id: postId },
            select: ['id', 'authorId'],
        });

        if (!post || post.authorId !== req.user.id) {
            return next(new HttpError(404, 'Post not found'));
        }

        return next();
    },
);
