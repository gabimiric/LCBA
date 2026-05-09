export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'LCBA Achievements API',
    version: '1.0.0',
    description: 'Lab 7 CRUD API with JWT auth, role/permissions support, pagination, and Swagger docs.',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'JWT token endpoint' },
    { name: 'Achievements', description: 'CRUD operations for achievements' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      TokenRequest: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['ADMIN', 'WRITER', 'VISITOR'],
            description: 'Optional role used to derive permissions.',
          },
          permissions: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['READ', 'WRITE', 'DELETE'],
            },
            description: 'Optional explicit permissions to include in token.',
          },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          expiresInSeconds: { type: 'integer', example: 60 },
          expiresAt: { type: 'string', format: 'date-time' },
          role: { type: 'string', nullable: true },
          permissions: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      Achievement: {
        type: 'object',
        required: ['id', 'name', 'projectionRate', 'group', 'keywords', 'completed', 'source'],
        properties: {
          id: { type: 'integer', minimum: 1 },
          name: { type: 'string' },
          projectionRate: { type: 'number', minimum: 0 },
          group: { type: 'string' },
          keywords: {
            type: 'array',
            items: { type: 'string' },
          },
          completed: { type: 'boolean' },
          source: { type: 'string', enum: ['base', 'custom'] },
        },
      },
      AchievementCreate: {
        type: 'object',
        required: ['name', 'group', 'keywords'],
        properties: {
          name: { type: 'string' },
          projectionRate: { type: 'number', minimum: 0, default: 0 },
          group: { type: 'string' },
          keywords: {
            type: 'array',
            items: { type: 'string' },
          },
          completed: { type: 'boolean', default: false },
          source: { type: 'string', enum: ['base', 'custom'], default: 'custom' },
        },
      },
      AchievementUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          projectionRate: { type: 'number', minimum: 0 },
          group: { type: 'string' },
          keywords: {
            type: 'array',
            items: { type: 'string' },
          },
          completed: { type: 'boolean' },
          source: { type: 'string', enum: ['base', 'custom'] },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
          count: { type: 'integer' },
        },
      },
      AchievementListResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Achievement' },
          },
          pagination: { $ref: '#/components/schemas/Pagination' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/token': {
      post: {
        tags: ['Auth'],
        summary: 'Issue JWT token',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TokenRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token issued',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          400: {
            description: 'Invalid role/permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Auth'],
        summary: 'Issue JWT token via query params',
        parameters: [
          {
            in: 'query',
            name: 'role',
            schema: { type: 'string', enum: ['ADMIN', 'WRITER', 'VISITOR'] },
          },
          {
            in: 'query',
            name: 'permissions',
            schema: { type: 'string', example: 'READ,WRITE' },
            description: 'Comma-separated permissions list.',
          },
        ],
        responses: {
          200: {
            description: 'Token issued',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          400: {
            description: 'Invalid role/permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/achievements': {
      get: {
        tags: ['Achievements'],
        summary: 'List achievements with pagination',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 500, default: 50 },
          },
          {
            in: 'query',
            name: 'offset',
            schema: { type: 'integer', minimum: 0, default: 0 },
          },
        ],
        responses: {
          200: {
            description: 'Paginated achievements',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AchievementListResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Achievements'],
        summary: 'Create achievement',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AchievementCreate' },
            },
          },
        },
        responses: {
          201: {
            description: 'Achievement created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Achievement' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/achievements/{id}': {
      get: {
        tags: ['Achievements'],
        summary: 'Get one achievement',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Achievement found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Achievement' },
              },
            },
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Achievements'],
        summary: 'Update achievement',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AchievementUpdate' },
            },
          },
        },
        responses: {
          200: {
            description: 'Achievement updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Achievement' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Achievements'],
        summary: 'Delete achievement',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          204: {
            description: 'Achievement deleted',
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};
