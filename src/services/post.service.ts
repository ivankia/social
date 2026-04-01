import { AppDataSource } from '../db/data.source';
import { HttpError } from '../utils/http-error';
import { Post } from '../models/entities/post';
import { PostInput, PostResponse, PostListResponse } from '../types/post';

export class PostService {
    async listPosts(input: PostInput): Promise<PostListResponse> {
        const limit = input.limit;
        const repo = AppDataSource.getRepository(Post);

        const qb = repo
            .createQueryBuilder('p')
            .leftJoin('p.author', 'u')
            .select([
                'p.id AS p_id',
                'p.content AS p_content',
                'p.createdAt AS p_createdAt',
                'p.updatedAt AS p_updatedAt',
                'u.id AS u_id',
                'u.username AS u_username',
            ])
            .orderBy('p.createdAt', 'DESC')
            .addOrderBy('p.id', 'DESC')
            .limit(limit);

        if (input.post_created_at && input.post_id) {
            qb.where(
                '(p.createdAt < :postCreatedAt) OR (p.createdAt = :postCreatedAt AND p.id < :postId)',
                {
                    postCreatedAt: input.post_created_at,
                    postId: input.post_id,
                },
            );
        }

        const rows = await qb.getRawMany<{
            p_id: string;
            p_content: string;
            p_createdAt: string | Date;
            p_updatedAt: string | Date;
            u_id: string;
            u_username: string;
        }>();

        const items: PostResponse[] = rows.map((r) => ({
            id: r.p_id,
            content: r.p_content,
            created_at: new Date(r.p_createdAt),
            updated_at: new Date(r.p_updatedAt),
            author: { id: r.u_id, username: r.u_username },
        }));

        const last = items.length > 0 ? items[items.length - 1] : undefined;
        const response: PostListResponse = { items };
        if (last) {
            response.next = {
                post_created_at: last.created_at.toISOString(),
                post_id: last.id,
            };
        }
        return response;
    }

    async getPostById(id: string): Promise<PostResponse> {
        const repo = AppDataSource.getRepository(Post);

        const qb = repo
            .createQueryBuilder('p')
            .leftJoin('p.author', 'u')
            .select([
                'p.id AS p_id',
                'p.content AS p_content',
                'p.createdAt AS p_createdAt',
                'p.updatedAt AS p_updatedAt',
                'u.id AS u_id',
                'u.username AS u_username',
            ])
            .where('p.id = :id', { id })
            .limit(1);

        const row = await qb.getRawOne<{
            p_id: string;
            p_content: string;
            p_createdAt: string | Date;
            p_updatedAt: string | Date;
            u_id: string;
            u_username: string;
        }>();

        if (!row) throw new HttpError(404, 'Post not found');

        return {
            id: row.p_id,
            content: row.p_content,
            created_at: new Date(row.p_createdAt),
            updated_at: new Date(row.p_updatedAt),
            author: { id: row.u_id, username: row.u_username },
        };
    }

    async createPost(authorId: string, content: string): Promise<PostResponse> {
        const repo = AppDataSource.getRepository(Post);
        const post = repo.create({ authorId, content });
        await repo.save(post);
        return this.getPostById(post.id);
    }

    async updatePost(
        id: string,
        authorId: string,
        content: string,
    ): Promise<PostResponse> {
        const repo = AppDataSource.getRepository(Post);
        const now = new Date();

        const result = await repo.update(
            { id, authorId },
            { content, updatedAt: now },
        );
        if (!result.affected) throw new HttpError(404, 'Post not found');

        return this.getPostById(id);
    }

    async deletePost(authorId: string, id: string): Promise<void> {
        const repo = AppDataSource.getRepository(Post);
        const result = await repo.delete({ id, authorId });
        if (!result.affected) throw new HttpError(404, 'Post not found');
    }
}
