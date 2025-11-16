import { and, eq, like, sql } from 'drizzle-orm'
import { db } from '../db/connection'
import {
  products,
  type Product,
  type NewProduct,
} from '../db/schema/products.schema'
import {
  normalizePagination,
  type PaginatedResult,
  type PaginationParams,
} from '../utils/pagination'

export interface ProductFilters extends PaginationParams {
  query?: string
  isActive?: boolean
  categoryId?: number
	lowStock?: boolean
	search?: string
}

export const productService = {
  async getAll(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
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
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .all()
    return row
  },
  async getByBarcode(barcode: string): Promise<Product | undefined> {
    const row = await db.select().from(products).where(eq(products.barcode, barcode)).get()
    return row ?? undefined
  },
  async search(q: string): Promise<Product[]> {
    const likeQ = `%${q}%`
    return await db.select().from(products).where(like(products.name, likeQ)).all()
  },
  async create(input: NewProduct): Promise<Product> {
    const now = Date.now()
    const toInsert = { ...input, createdAt: now, updatedAt: now }
    const inserted = await db
      .insert(products)
      .values(toInsert)
      .returning()
      .get()
    return inserted as Product
  },
  async update(id: number, input: Partial<NewProduct>): Promise<Product> {
    const updated = await db
      .update(products)
      .set({ ...input, updatedAt: Date.now() })
      .where(eq(products.id, id))
      .returning()
      .get()
    return updated as Product
  },
  async remove(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id)).run()
  },
  async delete(id: number): Promise<void> {
    return this.remove(id)
  },
  async getLowStock(): Promise<Product[]> {
    const rows = await db.select().from(products).all()
    return rows.filter((p) => (p.stockQuantity ?? 0) <= 0)
  },
  async getTopSelling(limit = 10): Promise<Array<{ productId: number; quantity: number; revenue: number }>> {
    return []
  },
  async exportCSV(): Promise<string> {
    const rows = await db.select().from(products).all()
    const headers = ['id', 'barcode', 'sku', 'name', 'salePrice', 'costPrice', 'stockQuantity']
    const lines = [
      headers.join(','),
      ...rows.map((p) =>
        [
          p.id,
          p.barcode ?? '',
          p.sku ?? '',
          (p.name ?? '').replace(/,/g, ' '),
          p.salePrice ?? 0,
          p.costPrice ?? 0,
          p.stockQuantity ?? 0,
        ].join(',')
      ),
    ]
    return lines.join('\n')
  },
}
