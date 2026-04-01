import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user';

@Entity({ name: 'posts' })
@Index('idx_posts_created_at_id', ['createdAt', 'id'])
@Index('idx_posts_author_id_created_at', ['authorId', 'createdAt'])
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'author_id', type: 'uuid' })
    authorId!: string;

    @ManyToOne(() => User, (user) => user.posts, {
        onDelete: 'CASCADE',
        eager: false,
    })
    @JoinColumn({ name: 'author_id' })
    author!: User;

    @Column({ type: 'longtext' })
    content!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
    updatedAt!: Date;
}
