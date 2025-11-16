import { and, asc, eq, like } from 'drizzle-orm'
import { getDb } from '../db/connection'
import { categories, type Category, type NewCategory } from '../db/schema/categories.schema'

export interface CategoryFilters {
	query?: string
	isActive?: boolean
}

export const categoryService = {
	async getAll(filters?: CategoryFilters): Promise<Category[]> {
		const db = getDb()
		const where = []
		if (filters?.query) {
			const q = `%${filters.query}%`
			where.push(like(categories.name, q))
		}
		if (typeof filters?.isActive === 'boolean') {
			where.push(eq(categories.isActive, filters.isActive))
		}
		return db.select().from(categories).where(where.length ? and(...where) : undefined).orderBy(asc(categories.displayOrder)).all()
	},
	async create(input: NewCategory): Promise<Category> {
		const db = getDb()
		const row = await db.insert(categories).values({ ...input, createdAt: Date.now() }).returning().get()
		return row as Category
	},
	async update(id: number, input: Partial<NewCategory>): Promise<Category> {
		const db = getDb()
		const row = await db.update(categories).set(input).where(eq(categories.id, id)).returning().get()
		return row as Category
	},
	async remove(id: number): Promise<void> {
		const db = getDb()
		await db.delete(categories).where(eq(categories.id, id)).run()
	},
}


