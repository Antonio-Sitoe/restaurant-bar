import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const sales = sqliteTable('sales', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	invoiceNumber: text('invoice_number').unique().notNull(),
	customerId: integer('customer_id'),
	userId: integer('user_id'),
	subtotal: real('subtotal').notNull(),
	taxAmount: real('tax_amount').default(0),
	discountAmount: real('discount_amount').default(0),
	total: real('total').notNull(),
	paymentMethod: text('payment_method'),
	cashReceived: real('cash_received'),
	changeGiven: real('change_given'),
	status: text('status').default('completed'),
	notes: text('notes'),
	createdAt: integer('created_at'),
	completedAt: integer('completed_at'),
})

export const saleItems = sqliteTable('sale_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	saleId: integer('sale_id').notNull(),
	productId: integer('product_id'),
	productName: text('product_name').notNull(),
	barcode: text('barcode'),
	quantity: real('quantity').notNull(),
	unitPrice: real('unit_price').notNull(),
	discountPercent: real('discount_percent').default(0),
	discountAmount: real('discount_amount').default(0),
	taxRate: real('tax_rate').default(0),
	taxAmount: real('tax_amount').default(0),
	subtotal: real('subtotal').notNull(),
	total: real('total').notNull(),
	costPrice: real('cost_price'),
})

export type Sale = typeof sales.$inferSelect
export type NewSale = typeof sales.$inferInsert
export type SaleItem = typeof saleItems.$inferSelect
export type NewSaleItem = typeof saleItems.$inferInsert


