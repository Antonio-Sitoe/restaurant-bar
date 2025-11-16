import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	barcode: text('barcode').unique(),
	sku: text('sku').unique(),
	name: text('name').notNull(),
	description: text('description'),
	categoryId: integer('category_id'),
	costPrice: real('cost_price').notNull(),
	salePrice: real('sale_price').notNull(),
	stockQuantity: integer('stock_quantity').default(0),
	minStock: integer('min_stock').default(0),
	maxStock: integer('max_stock'),
	unit: text('unit').default('un'),
	taxRate: real('tax_rate').default(0),
	imageUrl: text('image_url'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	trackStock: integer('track_stock', { mode: 'boolean' }).default(true),
	allowNegativeStock: integer('allow_negative_stock', { mode: 'boolean' }).default(false),
	createdAt: integer('created_at'),
	updatedAt: integer('updated_at'),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert


