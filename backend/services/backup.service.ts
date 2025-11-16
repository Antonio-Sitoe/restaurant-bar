import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { createGzip, createGunzip } from 'node:zlib'
import { createHash } from 'node:crypto'
import path from 'node:path'
import type { BackupConfig } from '../types/index'
import { logger } from '../utils/logger'

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups')
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'app.db')

export const backupService = {
  async createBackup(): Promise<string> {
    const backupDir = BACKUP_DIR

    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFileName = `backup-${timestamp}.db.gz`
    const backupPath = path.join(backupDir, backupFileName)

    try {
      // Get database path
      const dbPath = DB_PATH

      if (!existsSync(dbPath)) {
        throw new Error('Database file not found')
      }

      // Create backup
      const dbStream = createReadStream(dbPath)
      const gzipStream = createGzip()
      const writeStream = createWriteStream(backupPath)

      await new Promise<void>((resolve, reject) => {
        dbStream
          .pipe(gzipStream)
          .pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject)
      })

      // Calculate checksum
      const hash = createHash('sha256')
      const backupStream = createReadStream(backupPath)
      await new Promise<void>((resolve, reject) => {
        backupStream
          .on('data', (chunk) => hash.update(chunk))
          .on('end', resolve)
          .on('error', reject)
      })
      const checksum = hash.digest('hex')

      logger.info('Backup created successfully', { backupPath, checksum })

      return backupPath
    } catch (error) {
      logger.error('Failed to create backup', error)
      throw error
    }
  },

  async restoreBackup(filePath: string): Promise<void> {
    try {
      if (!existsSync(filePath)) {
        throw new Error('Backup file not found')
      }

      await new Promise<void>((resolve, reject) => {
        const gunzip = createGunzip()
        const write = createWriteStream(DB_PATH)
        createReadStream(filePath)
          .pipe(gunzip)
          .pipe(write)
          .on('finish', resolve)
          .on('error', reject)
      })

      logger.info('Backup restored successfully', { filePath, to: DB_PATH })
    } catch (error) {
      logger.error('Failed to restore backup', error)
      throw error
    }
  },

  async listBackups(): Promise<
    Array<{ path: string; timestamp: Date; size: number }>
  > {
    const backupDir = BACKUP_DIR

    if (!existsSync(backupDir)) {
      return []
    }

    const files = readdirSync(backupDir)
      .filter((f) => f.startsWith('backup-') && f.endsWith('.db.gz'))
      .map((file) => {
        const filePath = path.join(backupDir, file)
        const stats = statSync(filePath)
        return {
          path: filePath,
          timestamp: stats.mtime,
          size: stats.size,
        }
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return files
  },

  async scheduleBackup(config: BackupConfig): Promise<void> {
    const cron = await import('node-cron')
    const { backupService } = await import('./backup.service')

    // Parse schedule (e.g., '0 2 * * *' for daily at 2 AM)
    const schedule = config.schedule || '0 2 * * *' // Default: daily at 2 AM

    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron schedule: ${schedule}`)
    }

    cron.schedule(schedule, async () => {
      try {
        logger.info('Starting scheduled backup', { schedule })
        const backupPath = await backupService.createBackup()
        logger.info('Scheduled backup completed', { backupPath })

        // Cleanup old backups if retention is configured
        if (config.retentionDays) {
          const backups = await backupService.listBackups()
          const cutoffDate =
            Date.now() - config.retentionDays * 24 * 60 * 60 * 1000
          for (const backup of backups) {
            if (backup.timestamp.getTime() < cutoffDate) {
              const { unlinkSync } = await import('node:fs')
              try {
                unlinkSync(backup.path)
                logger.info('Deleted old backup', { path: backup.path })
              } catch (error) {
                logger.error('Failed to delete old backup', error)
              }
            }
          }
        }
      } catch (error) {
        logger.error('Scheduled backup failed', error)
      }
    })

    logger.info('Backup scheduled', {
      schedule,
      retentionDays: config.retentionDays,
    })
  },

  async verifyBackup(filePath: string): Promise<boolean> {
    try {
      if (!existsSync(filePath)) {
        return false
      }

      // TODO: Verify backup integrity
      // This would involve checking the checksum and file structure

      return true
    } catch (error) {
      logger.error('Failed to verify backup', error)
      return false
    }
  },
}
