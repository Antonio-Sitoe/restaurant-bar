import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users.schema'

export const dailyClosures = sqliteTable('daily_closures', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'restrict' }),
	openingAmount: real('opening_amount').notNull(),
	closingAmount: real('closing_amount'),
	totalSales: real('total_sales').default(0),
	totalWithdrawals: real('total_withdrawals').default(0),
	totalSupplies: real('total_supplies').default(0),
	notes: text('notes'),
	openedAt: integer('opened_at').notNull(),
	closedAt: integer('closed_at'),
})

export type DailyClosure = typeof dailyClosures.$inferSelect
export type NewDailyClosure = typeof dailyClosures.$inferInsert

