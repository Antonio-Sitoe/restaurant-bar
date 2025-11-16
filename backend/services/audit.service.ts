import { db } from '../db/connection'
import { auditLogs } from '../db/schema/audit_logs.schema'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'backup'
  | 'restore'

export const auditService = {
  async log(
    action: AuditAction,
    data: {
      userId?: number
      tableName?: string
      recordId?: number
      oldValues?: any
      newValues?: any
    }
  ) {
    await db
      .insert(auditLogs)
      .values({
        userId: data.userId,
        action,
        tableName: data.tableName,
        recordId: data.recordId,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
        createdAt: new Date() as any,
      })
      .run()
  },
}
