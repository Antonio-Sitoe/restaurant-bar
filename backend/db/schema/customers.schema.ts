import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const customers = sqliteTable('customers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').unique(),
	phone: text('phone'),
	nuit: text('nuit').unique(),
	address: text('address'),
	city: text('city'),
	postalCode: text('postal_code'),
	totalPurchases: real('total_purchases').default(0),
	totalOrders: integer('total_orders').default(0),
	loyaltyPoints: integer('loyalty_points').default(0),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	createdAt: integer('created_at'),
	updatedAt: integer('updated_at'),
})

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert


