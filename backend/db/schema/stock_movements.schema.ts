import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const stockMovements = sqliteTable('stock_movements', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	productId: integer('product_id').notNull(),
	type: text('type').notNull(), // in | out | adjustment | return | damage | transfer
	quantity: real('quantity').notNull(),
	previousQuantity: real('previous_quantity').notNull(),
	newQuantity: real('new_quantity').notNull(),
	referenceType: text('reference_type'),
	referenceId: integer('reference_id'),
	costPrice: real('cost_price'),
	notes: text('notes'),
	userId: integer('user_id'),
	createdAt: integer('created_at'),
})

export type StockMovement = typeof stockMovements.$inferSelect
export type NewStockMovement = typeof stockMovements.$inferInsert


