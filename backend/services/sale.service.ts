import { eq, and, gte, lte, sql, desc } from 'drizzle-orm'
import { getDb } from '../db/connection'
import { saleItems, sales, type NewSale, type NewSaleItem, type Sale } from '../db/schema/sales.schema'
import { products } from '../db/schema/products.schema'
import { stockMovements } from '../db/schema/stock_movements.schema'
import { normalizePagination, type PaginatedResult, type PaginationParams } from '../utils/pagination.js'

export interface CreateSaleInput extends Omit<NewSale, 'id' | 'createdAt' | 'completedAt'> {
	items: Array<Omit<NewSaleItem, 'id' | 'saleId'>>
}

export interface SaleFilters extends PaginationParams {
	status?: string
	startDate?: number
	endDate?: number
}

const holdStore = new Map<string, any>()

export const saleService = {
	async getAll(filters?: SaleFilters): Promise<PaginatedResult<Sale>> {
		const db = getDb()
		const where = []
		if (filters?.status) {
			where.push(eq(sales.status, filters.status))
		}
		if (filters?.startDate) {
			where.push(gte(sales.createdAt, filters.startDate))
		}
		if (filters?.endDate) {
			where.push(lte(sales.createdAt, filters.endDate))
		}

		const { page, limit, offset } = normalizePagination(filters)
		const whereClause = where.length ? and(...where) : undefined

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(sales)
			.where(whereClause)

		// Get paginated data
		const rows = await db
			.select()
			.from(sales)
			.where(whereClause)
			.orderBy(desc(sales.createdAt))
			.limit(limit)
			.offset(offset)
			.all()

		const total = Number(count)
		const totalPages = Math.ceil(total / limit)

		return {
			data: rows,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		}
	},

  async getById(id: number): Promise<Sale | null> {
    const db = getDb()
    const row = await db.select().from(sales).where(eq(sales.id, id)).get()
    return row || null
  },

	async create(input: CreateSaleInput): Promise<{ sale: Sale }> {
		const db = getDb()
		const now = Date.now()
		const tx = (db as any).transaction((payload: CreateSaleInput) => {
			const saleRow = db
				.insert(sales)
				.values({
					invoiceNumber: payload.invoiceNumber,
					customerId: payload.customerId,
					userId: payload.userId,
					subtotal: payload.subtotal,
					taxAmount: payload.taxAmount ?? 0,
					discountAmount: payload.discountAmount ?? 0,
					total: payload.total,
					paymentMethod: payload.paymentMethod,
					cashReceived: payload.cashReceived,
					changeGiven: payload.changeGiven,
					status: payload.status ?? 'completed',
					notes: payload.notes,
					createdAt: now,
					completedAt: now,
				})
				.returning()
				.get()

			for (const item of payload.items) {
				db.insert(saleItems)
					.values({
						saleId: (saleRow as any).id,
						productId: item.productId,
						productName: item.productName,
						barcode: item.barcode,
						quantity: item.quantity,
						unitPrice: item.unitPrice,
						discountPercent: item.discountPercent ?? 0,
						discountAmount: item.discountAmount ?? 0,
						taxRate: item.taxRate ?? 0,
						taxAmount: item.taxAmount ?? 0,
						subtotal: item.subtotal,
						total: item.total,
						costPrice: item.costPrice,
					})
					.run()

				if (item.productId) {
					// adjust stock
					const [current] = db.select().from(products).where(eq(products.id, item.productId)).limit(1).all()
					const previousQty = (current?.stockQuantity ?? 0) as number
					const newQty = previousQty - (item.quantity as number)
					db.update(products).set({ stockQuantity: newQty, updatedAt: now }).where(eq(products.id, item.productId)).run()
					db.insert(stockMovements)
						.values({
							productId: item.productId,
							type: 'out',
							quantity: item.quantity,
							previousQuantity: previousQty,
							newQuantity: newQty,
							referenceType: 'sale',
							referenceId: (saleRow as any).id,
							costPrice: item.costPrice,
							createdAt: now,
						})
						.run()
				}
			}

			return saleRow
		})

		const sale = tx(input) as Sale
		return { sale }
	},

  async cancel(id: number, reason?: string): Promise<void> {
    const db = getDb()
    await db.update(sales).set({ status: 'cancelled', notes: reason }).where(eq(sales.id, id)).run()
  },

  async hold(data: any): Promise<string> {
    const id = crypto.randomUUID()
    holdStore.set(id, { ...data, createdAt: Date.now() })
    return id
  },

  async retrieveHold(id: string): Promise<any | null> {
    return holdStore.get(id) || null
  },

  async getDailySummary(dateMs: number): Promise<{ totalSales: number; totalRevenue: number; transactions: number }> {
    const db = getDb()
    const d = new Date(dateMs)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const end = start + 24 * 60 * 60 * 1000 - 1
    const rows = await db.select().from(sales).where(and(gte(sales.createdAt, start), lte(sales.createdAt, end), eq(sales.status, 'completed'))).all()
    const transactions = rows.length
    const totalRevenue = rows.reduce((s, r) => s + (r.total || 0), 0)
    return { totalSales: totalRevenue, totalRevenue, transactions }
  },

  async printReceipt(id: number): Promise<{ html: string }> {
    const sale = await this.getById(id)
    const html = `<html><body><h3>Receipt ${sale?.invoiceNumber ?? id}</h3><p>Total: ${sale?.total ?? ''}</p></body></html>`
    return { html }
  },
}


