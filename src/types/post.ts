export type PostInput = {
    limit: number;
    post_created_at?: Date;
    post_id?: string;
};

export type PostResponse = {
    id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    author: {
        id: string;
        username: string;
    };
};

export type PostListResponse = {
    items: PostResponse[];
    next?: { post_created_at: string; post_id: string };
};
