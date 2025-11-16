import { eq, desc, sql, and } from 'drizzle-orm'
import { db } from '../db/connection'
import { products } from '../db/schema/products.schema'
import { stockMovements, type StockMovement, type NewStockMovement } from '../db/schema/stock_movements.schema'
import { normalizePagination, type PaginatedResult, type PaginationParams } from '../utils/pagination.js'

export interface StockMovementInput {
	productId: number
	type: 'in' | 'out' | 'adjustment' | 'return' | 'damage' | 'transfer'
	quantity: number
	referenceType?: string
	referenceId?: number
	costPrice?: number
	notes?: string
	userId?: number
}

export const stockService = {
	async addMovement(input: StockMovementInput): Promise<StockMovement> {
		const product = await db.select().from(products).where(eq(products.id, input.productId)).get()

		if (!product) {
			throw new Error('Product not found')
		}

		const previousQuantity = product.stockQuantity ?? 0
		let newQuantity = previousQuantity

		if (input.type === 'in' || input.type === 'return') {
			newQuantity = previousQuantity + input.quantity
		} else if (input.type === 'out' || input.type === 'damage' || input.type === 'transfer') {
			newQuantity = previousQuantity - input.quantity
		} else if (input.type === 'adjustment') {
			newQuantity = input.quantity
		}

		// Update product stock
		await db
			.update(products)
			.set({ stockQuantity: newQuantity, updatedAt: Date.now() })
			.where(eq(products.id, input.productId))
			.run()

		// Create movement record
		const newMovement: NewStockMovement = {
			productId: input.productId,
			type: input.type,
			quantity: input.quantity,
			previousQuantity,
			newQuantity,
			referenceType: input.referenceType ?? null,
			referenceId: input.referenceId ?? null,
			costPrice: input.costPrice ?? null,
			notes: input.notes ?? null,
			userId: input.userId ?? null,
			createdAt: Date.now(),
		}

		const result = await db.insert(stockMovements).values(newMovement).returning().get()
		return result
	},

	async getHistory(productId?: number, limit?: number, page?: number): Promise<PaginatedResult<StockMovement>> {
		const where = productId ? [eq(stockMovements.productId, productId)] : []
		const whereClause = where.length ? and(...where) : undefined

		const { page: p, limit: l, offset } = normalizePagination({ page, limit: limit || 100 })

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(stockMovements)
			.where(whereClause)

		// Get paginated data
		const rows = await db
			.select()
			.from(stockMovements)
			.where(whereClause)
			.orderBy(desc(stockMovements.createdAt))
			.limit(l)
			.offset(offset)
			.all()

		const total = Number(count)
		const totalPages = Math.ceil(total / l)

		return {
			data: rows,
			pagination: {
				page: p,
				limit: l,
				total,
				totalPages,
				hasNext: p < totalPages,
				hasPrev: p > 1,
			},
		}
	},

	async getCurrentStock(productId: number): Promise<number> {
		const product = await db.select().from(products).where(eq(products.id, productId)).get()
		return product?.stockQuantity ?? 0
	},

	async adjust(productId: number, newQuantity: number, notes?: string, userId?: number): Promise<StockMovement> {
		const product = await db.select().from(products).where(eq(products.id, productId)).get()

		if (!product) {
			throw new Error('Product not found')
		}

		const previousQuantity = product.stockQuantity ?? 0
		const adjustmentQuantity = newQuantity - previousQuantity

		return await this.addMovement({
			productId,
			type: 'adjustment',
			quantity: adjustmentQuantity,
			notes: notes ?? `Manual adjustment from ${previousQuantity} to ${newQuantity}`,
			userId,
		})
	},
}

