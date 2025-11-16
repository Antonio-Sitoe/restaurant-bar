import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').unique().notNull(),
	passwordHash: text('password_hash').notNull(),
	fullName: text('full_name').notNull(),
	email: text('email').unique(),
	role: text('role').notNull(), // admin | manager | cashier
	permissions: text('permissions'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	lastLogin: integer('last_login'),
	createdAt: integer('created_at'),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert


