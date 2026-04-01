import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Post } from './post';

@Entity({ name: 'users' })
@Unique('unique_users_email', ['email'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 100 })
    username!: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 6 })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', precision: 6 })
    updatedAt!: Date;

    @OneToMany(() => Post, (post) => post.author)
    posts!: Post[];
}
