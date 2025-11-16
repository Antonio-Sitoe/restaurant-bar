import { and, asc, eq, like } from 'drizzle-orm'
import { db } from '../db/connection'
import { categories, type Category, type NewCategory } from '../db/schema/categories.schema'

export interface CategoryFilters {
	query?: string
	isActive?: boolean
}

export const categoryService = {
	async getAll(filters?: CategoryFilters): Promise<Category[]> {
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
	async getById(id: number): Promise<Category | undefined> {
		const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1).all()
		return row
	},
	async create(input: NewCategory): Promise<Category> {
		const row = await db.insert(categories).values({ ...input, createdAt: Date.now() }).returning().get()
		return row as Category
	},
	async update(id: number, input: Partial<NewCategory>): Promise<Category> {
		const row = await db.update(categories).set(input).where(eq(categories.id, id)).returning().get()
		return row as Category
	},
	async remove(id: number): Promise<void> {
		await db.delete(categories).where(eq(categories.id, id)).run()
	},
	// Alias to match routes
	async delete(id: number): Promise<void> {
		return this.remove(id)
	},
	// Reorder categories by array of ids; sets displayOrder based on index
	async reorder(ids: number[]): Promise<void> {
		for (let i = 0; i < ids.length; i++) {
			const id = ids[i]
			await db.update(categories).set({ displayOrder: i }).where(eq(categories.id, id)).run()
		}
	},
}


