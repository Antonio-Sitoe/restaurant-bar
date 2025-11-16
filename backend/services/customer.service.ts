import { and, asc, eq, like, sql } from 'drizzle-orm'
import { getDb } from '../db/connection'
import { customers, type Customer, type NewCustomer } from '../db/schema/customers.schema'
import { normalizePagination, type PaginatedResult, type PaginationParams } from '../utils/pagination.js'

export interface CustomerFilters extends PaginationParams {
	query?: string
	isActive?: boolean
}

export const customerService = {
	async getAll(filters?: CustomerFilters): Promise<PaginatedResult<Customer>> {
		const db = getDb()
		const where = []
		if (filters?.query) {
			const q = `%${filters.query}%`
			where.push(like(customers.name, q))
		}
		if (typeof filters?.isActive === 'boolean') {
			where.push(eq(customers.isActive, filters.isActive))
		}

		const { page, limit, offset } = normalizePagination(filters)
		const whereClause = where.length ? and(...where) : undefined

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(customers)
			.where(whereClause)

		// Get paginated data
		const rows = await db
			.select()
			.from(customers)
			.where(whereClause)
			.orderBy(asc(customers.name))
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
	async create(input: NewCustomer): Promise<Customer> {
		const db = getDb()
		const row = await db.insert(customers).values({ ...input, createdAt: Date.now(), updatedAt: Date.now() }).returning().get()
		return row as Customer
	},
	async update(id: number, input: Partial<NewCustomer>): Promise<Customer> {
		const db = getDb()
		const row = await db
			.update(customers)
			.set({ ...input, updatedAt: Date.now() })
			.where(eq(customers.id, id))
			.returning()
			.get()
		return row as Customer
	},
	async remove(id: number): Promise<void> {
		const db = getDb()
		await db.delete(customers).where(eq(customers.id, id)).run()
	},
}


