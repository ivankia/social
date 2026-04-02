export type UserInput = {
    id: string;
};

export type UserPosts = {
    id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
};

export type UserPostsResponse = {
    id: string;
    username: string;
    email: string;
    posts?: UserPosts[];
};
