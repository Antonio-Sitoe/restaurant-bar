import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	parentId: integer('parent_id'),
	color: text('color'),
	icon: text('icon'),
	displayOrder: integer('display_order').default(0),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	createdAt: integer('created_at'),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert


