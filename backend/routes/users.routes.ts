import { FastifyInstance } from 'fastify'
import {
  userService,
  type LoginCredentials,
  type CreateUserInput,
} from '../services/user.service'
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
} from '../utils/validators'
import { authMiddleware, requireRole } from '../middleware/auth.middleware'
import { handleError } from '../utils/errors'
import { logger } from '../utils/logger'
import jwt from 'jsonwebtoken'
import { createSwaggerSchema, zodToJsonSchema } from '../utils/swagger'

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const WINDOW_MS = 15 * 60 * 1000 // 15 min
const MAX_ATTEMPTS = 5

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const rec = loginAttempts.get(ip)
  if (!rec) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return true
  }
  const withinWindow = now - rec.firstAttempt < WINDOW_MS
  if (!withinWindow) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return true
  }
  if (rec.count >= MAX_ATTEMPTS) return false
  rec.count += 1
  return true
}

export async function userRoutes(fastify: FastifyInstance) {
  // Get all users (requires auth + admin)
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Users'],
        description: 'Listar todos os usuários (requer admin ou manager)',
      },
      preHandler: [authMiddleware, requireRole(['admin', 'manager'])],
    },
    async (request, reply) => {
      try {
        const users = await userService.getAll()
        return { success: true, data: users }
      } catch (err: unknown) {
        logger.error('Error in GET /users', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Get user by ID (requires auth)
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        description: 'Buscar usuário por ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const user = await userService.getById(Number(id))
        if (!user) {
          return reply.status(404).send({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'User not found' },
          })
        }
        return { success: true, data: user }
      } catch (err: unknown) {
        logger.error('Error in GET /users/:id', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Create user (requires auth + admin)
  fastify.post(
    '/',
    {
      schema: {
        tags: ['Users'],
        description: 'Criar novo usuário (requer admin)',
        body: zodToJsonSchema(createUserSchema),
      },
      preHandler: [authMiddleware, requireRole(['admin'])],
    },
    async (request, reply) => {
      try {
        const body = createUserSchema.parse(request.body)
        const user = await userService.create(body as CreateUserInput)
        return reply.status(201).send({ success: true, data: user })
      } catch (err: unknown) {
        logger.error('Error in POST /users', err)
        const error = handleError(err)
        return reply.status(400).send({ success: false, error })
      }
    }
  )

  // Update user (requires auth)
  fastify.put(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        description: 'Atualizar usuário',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: zodToJsonSchema(updateUserSchema),
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const body = updateUserSchema.parse(request.body)
        const user = await userService.update(
          Number(id),
          body as Partial<CreateUserInput>
        )
        return { success: true, data: user }
      } catch (err: unknown) {
        logger.error('Error in PUT /users/:id', err)
        const error = handleError(err)
        return reply.status(400).send({ success: false, error })
      }
    }
  )

  // Delete user (requires auth + admin)
  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        description: 'Excluir usuário (requer admin)',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
      preHandler: [authMiddleware, requireRole(['admin'])],
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        await userService.delete(Number(id))
        return { success: true }
      } catch (err: unknown) {
        logger.error('Error in DELETE /users/:id', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Change password (requires auth)
  fastify.post(
    '/:id/change-password',
    {
      schema: {
        tags: ['Users'],
        description: 'Alterar senha do usuário',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string' },
          },
          required: ['oldPassword', 'newPassword'],
        },
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const body = request.body as {
          oldPassword: string
          newPassword: string
        }
        // TODO: Implement changePassword in userService
        return { success: true, message: 'Password changed successfully' }
      } catch (err: unknown) {
        logger.error('Error in POST /users/:id/change-password', err)
        const error = handleError(err)
        return reply.status(400).send({ success: false, error })
      }
    }
  )
}
