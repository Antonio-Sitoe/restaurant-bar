import { FastifyInstance } from 'fastify'
import { backupService } from '../services/backup.service'
import { z } from 'zod'
import { authMiddleware, requireRole } from '../middleware/auth.middleware'
import { handleError } from '../utils/errors'
import { logger } from '../utils/logger'
import os from 'node:os'

const restoreBackupSchema = z.object({
  filePath: z.string().min(1),
})

export async function systemRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/backup',
    { preHandler: [authMiddleware, requireRole(['admin'])] },
    async (request, reply) => {
      try {
        const backupPath = await backupService.createBackup()
        return { success: true, data: { path: backupPath } }
      } catch (err: unknown) {
        logger.error('Error in POST /system/backup', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.post(
    '/restore',
    { preHandler: [authMiddleware, requireRole(['admin'])] },
    async (request, reply) => {
      try {
        const body = restoreBackupSchema.parse(request.body)
        await backupService.restoreBackup(body.filePath)
        return { success: true }
      } catch (err: unknown) {
        logger.error('Error in POST /system/restore', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/info',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        return {
          success: true,
          data: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            osType: os.type(),
            osRelease: os.release(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
          },
        }
      } catch (err: unknown) {
        logger.error('Error in GET /system/info', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/logs',
    { preHandler: [authMiddleware, requireRole(['admin'])] },
    async (request, reply) => {
      try {
        // TODO: Implement log retrieval
        logger.info('Log retrieval not yet implemented')
        return { success: true, data: [] }
      } catch (err: unknown) {
        logger.error('Error in GET /system/logs', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/backups',
    { preHandler: [authMiddleware, requireRole(['admin'])] },
    async (request, reply) => {
      try {
        const backups = await backupService.listBackups()
        return { success: true, data: backups }
      } catch (err: unknown) {
        logger.error('Error in GET /system/backups', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.post(
    '/backup/schedule',
    { preHandler: [authMiddleware, requireRole(['admin'])] },
    async (request, reply) => {
      try {
        const config = request.body as any
        await backupService.scheduleBackup(config)
        return { success: true, message: 'Backup scheduled successfully' }
      } catch (err: unknown) {
        logger.error('Error in POST /system/backup/schedule', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )
}
