import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class CreatePostsTable20260330173851 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('posts');
        if (!hasTable) {
            await queryRunner.createTable(
                new Table({
                    name: 'posts',
                    columns: [
                        {
                            name: 'id',
                            type: 'char',
                            length: '36',
                            isPrimary: true,
                            isNullable: false,
                            generationStrategy: 'uuid',
                        },
                        {
                            name: 'author_id',
                            type: 'char',
                            length: '36',
                            isNullable: false,
                        },
                        {
                            name: 'content',
                            type: 'text',
                            isNullable: false,
                        },
                        {
                            name: 'created_at',
                            type: 'timestamp',
                            precision: 6,
                            isNullable: false,
                            default: 'CURRENT_TIMESTAMP(6)',
                        },
                        {
                            name: 'updated_at',
                            type: 'timestamp',
                            precision: 6,
                            isNullable: false,
                            default: 'CURRENT_TIMESTAMP(6)',
                            onUpdate: 'CURRENT_TIMESTAMP(6)',
                        },
                    ],
                    foreignKeys: [
                        new TableForeignKey({
                            columnNames: ['author_id'],
                            referencedColumnNames: ['id'],
                            referencedTableName: 'users',
                            onDelete: 'CASCADE',
                            onUpdate: 'CASCADE',
                        }),
                    ],
                }),
            );
        }

        const createdAtIdxName = 'idx_posts_created_at_id';
        const authorCreatedAtIdxName = 'idx_posts_author_id_created_at';

        const [createdAtExisting] = (await queryRunner.query(
            'SHOW INDEX FROM posts WHERE Key_name = ?',
            [createdAtIdxName],
        )) as unknown[];
        if (!createdAtExisting) {
            await queryRunner.query(
                'CREATE INDEX ' +
                    createdAtIdxName +
                    ' ON posts (created_at, id)',
            );
        }

        const [authorCreatedAtExisting] = (await queryRunner.query(
            'SHOW INDEX FROM posts WHERE Key_name = ?',
            [authorCreatedAtIdxName],
        )) as unknown[];
        if (!authorCreatedAtExisting) {
            await queryRunner.query(
                'CREATE INDEX ' +
                    authorCreatedAtIdxName +
                    ' ON posts (author_id, created_at)',
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('posts');
    }
}
