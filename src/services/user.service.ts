import { AppDataSource } from '../db/data.source';
import { Post } from '../models/entities/post';
import { User } from '../models/entities/user';
import { UserInput, UserPosts, UserPostsResponse } from '../types/user';
import { HttpError } from '../utils/http-error';

export class UserService {
    async getPosts(id: string): Promise<UserPostsResponse> {
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: id },
            select: ['username', 'email'],
        });
        if (!user) {
            throw new HttpError(401, 'No user found');
        }

        const username = user.username;
        const email = user.email;

        console.log('User found:', user);

        const limit = 3;
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
                'u.email AS u_email',
            ])
            .where('u.id = :id', { id })
            .orderBy('p.createdAt', 'DESC')
            .addOrderBy('p.id', 'DESC')
            .limit(limit);

        const rows = await qb.getRawMany<{
            p_id: string;
            p_content: string;
            p_createdAt: string | Date;
            p_updatedAt: string | Date;
            u_id: string;
            u_username: string;
            u_email: string;
        }>();

        const posts: UserPosts[] = rows.map((r) => ({
            id: r.p_id,
            content: r.p_content,
            created_at: new Date(r.p_createdAt),
            updated_at: new Date(r.p_updatedAt),
        }));

        const response: UserPostsResponse = { id, username, email, posts };
        return response;
    }
}
