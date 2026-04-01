export type AuthRole = 'guest' | 'authenticated';

export type AuthUser = {
    id: string;
    role: 'authenticated';
};

export type RegisterInput = {
    email: string;
    username: string;
    password: string;
};

export type LoginInput = {
    email: string;
    password: string;
};
