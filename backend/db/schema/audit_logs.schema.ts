import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users.schema'

export const auditLogs = sqliteTable('audit_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
	action: text('action').notNull(), // 'create', 'update', 'delete', 'login', etc
	tableName: text('table_name'),
	recordId: integer('record_id'),
	oldValues: text('old_values'), // JSON
	newValues: text('new_values'), // JSON
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert

