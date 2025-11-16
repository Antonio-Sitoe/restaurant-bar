import { and, eq, like, sql } from 'drizzle-orm'
import { getDb } from '../db/connection'
import { products, type Product, type NewProduct } from '../db/schema/products.schema'
import { normalizePagination, type PaginatedResult, type PaginationParams } from '../utils/pagination.js'

export interface ProductFilters extends PaginationParams {
	query?: string
	isActive?: boolean
	categoryId?: number
}

export const productService = {
	async getAll(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
		const db = getDb()
		const where = []
		if (filters?.query) {
			const q = `%${filters.query}%`
			where.push(like(products.name, q))
		}
		if (typeof filters?.isActive === 'boolean') {
			where.push(eq(products.isActive, filters.isActive))
		}
		if (filters?.categoryId) {
			where.push(eq(products.categoryId, filters.categoryId))
		}

		const { page, limit, offset } = normalizePagination(filters)
		const whereClause = where.length ? and(...where) : undefined

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(products)
			.where(whereClause)

		// Get paginated data
		const rows = await db
			.select()
			.from(products)
			.where(whereClause)
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
	async getById(id: number): Promise<Product | undefined> {
		const db = getDb()
		const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1).all()
		return row
	},
	async create(input: NewProduct): Promise<Product> {
		const db = getDb()
		const now = Date.now()
		const toInsert = { ...input, createdAt: now, updatedAt: now }
		const inserted = await db.insert(products).values(toInsert).returning().get()
		return inserted as Product
	},
	async update(id: number, input: Partial<NewProduct>): Promise<Product> {
		const db = getDb()
		const updated = await db
			.update(products)
			.set({ ...input, updatedAt: Date.now() })
			.where(eq(products.id, id))
			.returning()
			.get()
		return updated as Product
	},
	async remove(id: number): Promise<void> {
		const db = getDb()
		await db.delete(products).where(eq(products.id, id)).run()
	},
}


