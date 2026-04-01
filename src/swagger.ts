import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';

export function swaggerSetup(app: Express) {
    const spec = {
        openapi: '3.0.0',
        info: {
            title: 'Social Platform API',
            version: '1.0.0',
        },
        servers: [{ url: `http://localhost:${env.PORT}/api` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                AuthTokens: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                    },
                    required: ['accessToken', 'refreshToken'],
                },
                RegisterRequest: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        username: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 50,
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            maxLength: 50,
                        },
                    },
                    required: ['email', 'username', 'password'],
                },
                LoginRequest: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: {
                            type: 'string',
                            minLength: 8,
                            maxLength: 50,
                        },
                    },
                    required: ['email', 'password'],
                },
                RefreshRequest: {
                    type: 'object',
                    properties: {
                        refreshToken: { type: 'string' },
                    },
                    required: ['refreshToken'],
                },
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        content: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 16000,
                        },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        author: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                username: { type: 'string' },
                            },
                            required: ['id', 'username'],
                        },
                    },
                    required: [
                        'id',
                        'content',
                        'created_at',
                        'updated_at',
                        'author',
                    ],
                },
                PostListResponse: {
                    type: 'object',
                    properties: {
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Post' },
                        },
                        next: {
                            type: 'object',
                            properties: {
                                post_created_at: {
                                    type: 'string',
                                    format: 'date-time',
                                },
                                post_id: { type: 'string' },
                            },
                            nullable: true,
                        },
                    },
                    required: ['items'],
                },
            },
        },
        security: [],
        paths: {
            '/auth/register': {
                post: {
                    tags: ['Auth'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/RegisterRequest',
                                },
                            },
                        },
                    },
                    responses: {
                        '201': {
                            description: 'Tokens issued',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/AuthTokens',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/LoginRequest',
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Tokens issued',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/AuthTokens',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/auth/refresh': {
                post: {
                    tags: ['Auth'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/RefreshRequest',
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'New access token',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/AuthTokens',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/posts': {
                get: {
                    tags: ['Posts'],
                    parameters: [
                        {
                            name: 'limit',
                            in: 'query',
                            schema: {
                                type: 'integer',
                                default: 50,
                                maximum: 100,
                            },
                        },
                        {
                            name: 'post_created_at',
                            in: 'query',
                            schema: { type: 'string', format: 'date-time' },
                        },
                        {
                            name: 'post_id',
                            in: 'query',
                            schema: { type: 'string' },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Post list',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/PostListResponse',
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ['Posts'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        content: {
                                            type: 'string',
                                            minLength: 1,
                                            maxLength: 16000,
                                        },
                                    },
                                    required: ['content'],
                                },
                            },
                        },
                    },
                    responses: {
                        '201': {
                            description: 'Post created',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Post',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/posts/{id}': {
                get: {
                    tags: ['Posts'],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Post',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Post',
                                    },
                                },
                            },
                        },
                        '404': { description: 'Not found' },
                    },
                },
                put: {
                    tags: ['Posts'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        content: {
                                            type: 'string',
                                            minLength: 1,
                                            maxLength: 16000,
                                        },
                                    },
                                    required: ['content'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Post updated',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Post',
                                    },
                                },
                            },
                        },
                        '404': {
                            description: 'Not found (or not owned by the user)',
                        },
                    },
                },
                delete: {
                    tags: ['Posts'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                        },
                    ],
                    responses: {
                        '204': { description: 'Deleted' },
                        '404': {
                            description: 'Not found (or not owned by the user)',
                        },
                    },
                },
            },
        },
    } as const;

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
}
