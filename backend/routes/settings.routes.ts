import { FastifyInstance } from 'fastify'
import { settingService } from '../services/setting.service'
import { settingSchema } from '../utils/validators'
import { authMiddleware, requireRole } from '../middleware/auth.middleware'
import { handleError } from '../utils/errors'
import { logger } from '../utils/logger'

export async function settingRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const settings = await settingService.getAll()
      return { success: true, data: settings }
    } catch (err: unknown) {
      logger.error('Error in GET /settings', err)
      return reply.status(500).send({ success: false, error: handleError(err) })
    }
  })

  fastify.get(
    '/:key',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { key } = request.params as { key: string }
        const setting = await settingService.get(key)
        if (!setting) {
          return reply
            .status(404)
            .send({
              success: false,
              error: { code: 'NOT_FOUND', message: 'Setting not found' },
            })
        }
        return { success: true, data: setting }
      } catch (err: unknown) {
        logger.error('Error in GET /settings/:key', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.put(
    '/:key',
    { preHandler: [authMiddleware, requireRole(['admin'])] },
    async (request, reply) => {
      try {
        const { key } = request.params as { key: string }
        const { value } = request.body as { value: unknown }
        const setting = await settingService.update(key, String(value))
        return { success: true, data: setting }
      } catch (err: unknown) {
        logger.error('Error in PUT /settings/:key', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.post(
    '/reset',
    { preHandler: [authMiddleware, requireRole(['admin'])] },
    async (request, reply) => {
      try {
        await settingService.reset()
        return { success: true }
      } catch (err: unknown) {
        logger.error('Error in POST /settings/reset', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )
}
