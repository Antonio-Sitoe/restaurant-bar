import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { productRoutes } from './products.routes'
import { categoryRoutes } from './categories.routes'
import { customerRoutes } from './customers.routes'
import { saleRoutes } from './sales.routes'
import { stockRoutes } from './stock.routes'
import { userRoutes } from './users.routes'
import { settingRoutes } from './settings.routes'
import { reportRoutes } from './reports.routes'
import { systemRoutes } from './system.routes'

export async function registerRoutes(fastify: FastifyInstance) {
  // Auth routes (no auth required) - apenas login
  await fastify.register(
    async (fastify) => {
      fastify.post(
        '/login',
        {
          schema: {
            tags: ['Auth'],
            description: 'Autenticação de usuário',
            security: [],
          },
        },
        async (request, reply) => {
          const { userService } = await import('../services/user.service')
          const { loginSchema } = await import('../utils/validators')
          const { handleError } = await import('../utils/errors')
          const { logger } = await import('../utils/logger')
          
          const loginAttempts = new Map<
            string,
            { count: number; firstAttempt: number }
          >()
          const WINDOW_MS = 15 * 60 * 1000
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

          try {
            const body = loginSchema.parse(request.body)
            const ip = (
              request.ip ||
              request.headers['x-forwarded-for'] ||
              ''
            ).toString()
            if (!checkRateLimit(ip)) {
              return reply
                .status(429)
                .send({
                  success: false,
                  error: { code: 'RATE_LIMIT', message: 'Too many attempts' },
                })
            }
            const user = await userService.login(body as any)
            if (!user) {
              return reply
                .status(401)
                .send({
                  success: false,
                  error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid credentials',
                  },
                })
            }
            const secret: jwt.Secret = (process.env.JWT_SECRET || 'dev-secret') as jwt.Secret
            const token = jwt.sign(
              {
                id: (user as any).id,
                username: (user as any).username,
                role: (user as any).role,
              },
              secret,
              { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any } // 24 horas por padrão, pode ser configurado via env
            )
            return { success: true, data: { user, token } }
          } catch (err: unknown) {
            logger.error('Error in POST /auth/login', err)
            return reply
              .status(400)
              .send({ success: false, error: handleError(err) })
          }
        }
      )
    },
    { prefix: '/auth' }
  )

  // Protected routes
  await fastify.register(productRoutes, { prefix: '/products' })
  await fastify.register(categoryRoutes, { prefix: '/categories' })
  await fastify.register(customerRoutes, { prefix: '/customers' })
  await fastify.register(saleRoutes, { prefix: '/sales' })
  await fastify.register(stockRoutes, { prefix: '/stock' })
  await fastify.register(userRoutes, { prefix: '/users' })
  await fastify.register(settingRoutes, { prefix: '/settings' })
  await fastify.register(reportRoutes, { prefix: '/reports' })
  await fastify.register(systemRoutes, { prefix: '/system' })
}
