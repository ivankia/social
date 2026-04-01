import { z } from 'zod';
import type { Request, Response } from 'express';
import type { ValidatedRequest } from '../types/express';
import {
    contentSchema,
    idParamSchema,
    listSchema,
} from '../schemas/post.schema';
import { PostService } from '../services/post.service';
import { HttpError } from '../utils/http-error';
import { asyncHandler } from '../utils/async.handler';

export class PostController {
    private readonly postService: PostService;

    constructor() {
        this.postService = new PostService();
    }

    list = asyncHandler(async (req: Request, res: Response) => {
        const validatedReq = req as unknown as ValidatedRequest<
            unknown,
            z.infer<typeof listSchema>
        >;
        const parsed = validatedReq.validatedQuery;

        const postCreatedAt =
            parsed.post_created_at != null
                ? new Date(parsed.post_created_at)
                : undefined;

        const input = { limit: parsed.limit } as const;
        const postInput: Parameters<PostService['listPosts']>[0] = {
            ...input,
        };
        if (postCreatedAt) postInput.post_created_at = postCreatedAt;
        if (parsed.post_id) postInput.post_id = parsed.post_id;

        const result = await this.postService.listPosts(postInput);

        res.json(result);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const validatedReq = req as ValidatedRequest<
            unknown,
            unknown,
            z.infer<typeof idParamSchema>
        >;
        const { id } = validatedReq.validatedParams;
        const post = await this.postService.getPostById(id);
        res.json(post);
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new HttpError(401, 'Unauthorized');

        const validatedReq = req as ValidatedRequest<
            z.infer<typeof contentSchema>
        >;
        const { content } = validatedReq.validatedBody;
        const post = await this.postService.createPost(req.user.id, content);
        res.status(201).json(post);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new HttpError(401, 'Unauthorized');

        const validatedReq = req as ValidatedRequest<
            z.infer<typeof contentSchema>,
            unknown,
            z.infer<typeof idParamSchema>
        >;
        const { id } = validatedReq.validatedParams;
        const { content } = validatedReq.validatedBody;

        const post = await this.postService.updatePost(
            id,
            req.user.id,
            content,
        );
        res.json(post);
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) throw new HttpError(401, 'Unauthorized');

        const validatedReq = req as ValidatedRequest<
            unknown,
            unknown,
            z.infer<typeof idParamSchema>
        >;
        const { id } = validatedReq.validatedParams;
        await this.postService.deletePost(req.user.id, id);
        res.status(204).send();
    });
}
