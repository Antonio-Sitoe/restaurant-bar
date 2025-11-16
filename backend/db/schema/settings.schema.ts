import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('settings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	key: text('key').unique().notNull(),
	value: text('value').notNull(),
	type: text('type'),
	category: text('category'),
	description: text('description'),
	updatedAt: integer('updated_at'),
})

export type Setting = typeof settings.$inferSelect
export type NewSetting = typeof settings.$inferInsert


