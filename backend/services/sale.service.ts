import { eq, and, gte, lte, sql, desc, inArray } from 'drizzle-orm'
import { db } from '../db/connection'
import {
  saleItems,
  sales,
  type NewSale,
  type NewSaleItem,
  type Sale,
} from '../db/schema/sales.schema'
import { products } from '../db/schema/products.schema'
import { stockMovements } from '../db/schema/stock_movements.schema'
import {
  normalizePagination,
  type PaginatedResult,
  type PaginationParams,
} from '../utils/pagination'

export interface CreateSaleInput
  extends Omit<NewSale, 'id' | 'createdAt' | 'completedAt' | 'invoiceNumber'> {
  invoiceNumber?: string
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
    const row = await db.select().from(sales).where(eq(sales.id, id)).get()
    return row || null
  },

  async create(input: CreateSaleInput): Promise<{ sale: Sale }> {
    const now = Date.now()

    // Gerar invoice_number automaticamente se não fornecido
    const generateInvoiceNumber = async (): Promise<string> => {
      const date = new Date(now)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')
      let invoiceNumber = `INV-${year}${month}${day}-${random}`

      // Verificar se já existe e gerar novo se necessário
      let attempts = 0
      while (attempts < 10) {
        const existing = await db
          .select()
          .from(sales)
          .where(eq(sales.invoiceNumber, invoiceNumber))
          .get()
        if (!existing) {
          break
        }
        const newRandom = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')
        invoiceNumber = `INV-${year}${month}${day}-${newRandom}`
        attempts++
      }

      return invoiceNumber
    }

    const invoiceNumber = input.invoiceNumber || (await generateInvoiceNumber())

    // Calcular valores dos items e totais
    const TAX_RATE = 0.17 // 17% IVA padrão

    // Buscar todos os produtos de uma vez
    const productIds = input.items
      .map((item) => item.productId)
      .filter((id): id is number => id !== undefined && id !== null)
    const productMap = new Map()
    if (productIds.length > 0) {
      const foundProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds))
        .all()
      foundProducts.forEach((p: any) => {
        productMap.set(p.id, p)
      })
    }

    const processedItems = input.items.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice
      const itemDiscountAmount = item.discountAmount ?? 0
      const itemDiscountPercent = item.discountPercent ?? 0
      const finalDiscount =
        itemDiscountAmount || (itemSubtotal * itemDiscountPercent) / 100
      const itemSubtotalAfterDiscount = itemSubtotal - finalDiscount
      const itemTaxRate = item.taxRate ?? TAX_RATE
      const itemTaxAmount = itemSubtotalAfterDiscount * itemTaxRate
      const itemTotal = itemSubtotalAfterDiscount + itemTaxAmount

      // Obter produto do map
      const product = productMap.get(item.productId)
      const costPrice = product?.costPrice ?? 0
      const barcode = product?.barcode ?? null
      const productName = product?.name ?? 'Produto Desconhecido'

      return {
        ...item,
        barcode,
        productName: productName,
        discountPercent: itemDiscountPercent,
        discountAmount: finalDiscount,
        taxRate: itemTaxRate,
        taxAmount: itemTaxAmount,
        subtotal: itemSubtotal,
        total: itemTotal,
        costPrice,
      }
    })

    // Calcular totais da venda
    const subtotal = processedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    )
    const discountAmount = input.discountAmount ?? 0
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxAmount = processedItems.reduce(
      (sum, item) => sum + item.taxAmount,
      0
    )
    const total = subtotalAfterDiscount + taxAmount

    // Calcular troco se for pagamento em dinheiro
    const cashReceived = input.cashReceived ?? 0
    const changeGiven =
      input.paymentMethod === 'cash' && cashReceived > 0
        ? Math.max(0, cashReceived - total)
        : 0

    // Obter userId do token de autenticação (assumindo que está disponível no request)
    // Por enquanto, vamos usar null se não fornecido
    const userId = input.userId ?? null

    const sale = await db.transaction(async (tx) => {
      const saleRow = await tx
        .insert(sales)
        .values({
          invoiceNumber: invoiceNumber,
          customerId: input.customerId ?? null,
          userId: userId,
          subtotal: subtotal,
          taxAmount: taxAmount,
          discountAmount: discountAmount,
          total: total,
          paymentMethod: input.paymentMethod,
          cashReceived: cashReceived > 0 ? cashReceived : null,
          changeGiven: changeGiven > 0 ? changeGiven : null,
          status: input.status ?? 'completed',
          notes: input.notes ?? null,
          createdAt: now,
          completedAt: now,
        })
        .returning()
        .get()

      if (!saleRow || !saleRow.id) {
        throw new Error('Failed to create sale: sale ID not returned')
      }

      const saleId = saleRow.id

      for (const item of processedItems) {
        await tx
          .insert(saleItems)
          .values({
            saleId: saleId,
            productId: item.productId,
            productName: item.productName,
            barcode: item.barcode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent,
            discountAmount: item.discountAmount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            subtotal: item.subtotal,
            total: item.total,
            costPrice: item.costPrice,
          })
          .run()

        if (item.productId) {
          // adjust stock
          const [current] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1)
            .all()
          const previousQty = (current?.stockQuantity ?? 0) as number
          const newQty = previousQty - (item.quantity as number)
          await tx
            .update(products)
            .set({ stockQuantity: newQty, updatedAt: now })
            .where(eq(products.id, item.productId))
            .run()
          await tx
            .insert(stockMovements)
            .values({
              productId: item.productId,
              type: 'out',
              quantity: item.quantity,
              previousQuantity: previousQty,
              newQuantity: newQty,
              referenceType: 'sale',
              referenceId: saleId,
              costPrice: item.costPrice,
              createdAt: now,
            })
            .run()
        }
      }

      return saleRow
    })

    return { sale: sale as Sale }
  },

  async cancel(id: number, reason?: string): Promise<void> {
    await db
      .update(sales)
      .set({ status: 'cancelled', notes: reason })
      .where(eq(sales.id, id))
      .run()
  },

  async hold(data: any): Promise<string> {
    const id = crypto.randomUUID()
    holdStore.set(id, { ...data, createdAt: Date.now() })
    return id
  },

  async retrieveHold(id: string): Promise<any | null> {
    return holdStore.get(id) || null
  },

  async getDailySummary(dateMs: number): Promise<{
    totalSales: number
    totalRevenue: number
    transactions: number
  }> {
    // Valida se dateMs é um número finito válido
    if (!isFinite(dateMs) || isNaN(dateMs)) {
      dateMs = Date.now()
    }

    const d = new Date(dateMs)

    // Valida se a data é válida
    if (isNaN(d.getTime())) {
      dateMs = Date.now()
      d.setTime(dateMs)
    }

    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const end = start + 24 * 60 * 60 * 1000 - 1

    // Garante que start e end são números finitos
    if (!isFinite(start) || !isFinite(end)) {
      throw new Error('Invalid date range for daily summary')
    }

    const rows = await db
      .select()
      .from(sales)
      .where(
        and(
          gte(sales.createdAt, start),
          lte(sales.createdAt, end),
          eq(sales.status, 'completed')
        )
      )
      .all()
    const transactions = rows.length
    const totalRevenue = rows.reduce(
      (s: number, r: Sale) => s + (r.total || 0),
      0
    )
    return { totalSales: totalRevenue, totalRevenue, transactions }
  },

  async printReceipt(id: number): Promise<{ html: string }> {
    const sale = await this.getById(id)
    const html = `<html><body><h3>Receipt ${
      sale?.invoiceNumber ?? id
    }</h3><p>Total: ${sale?.total ?? ''}</p></body></html>`
    return { html }
  },
}
