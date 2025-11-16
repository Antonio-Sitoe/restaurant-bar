import { and, eq, gte, lte, sql, sum } from 'drizzle-orm'
import { db } from '../db/connection'
import { sales, saleItems } from '../db/schema/sales.schema'
import { products } from '../db/schema/products.schema'
import { categories } from '../db/schema/categories.schema'
import type {
	SalesByPeriodReport,
	SalesByProductReport,
	SalesByCategoryReport,
	ProfitAnalysisReport,
} from '../types'

export const reportService = {
	async salesByPeriod(startDate: number, endDate: number): Promise<SalesByPeriodReport> {

		// Get sales in period
		const salesInPeriod = await db
			.select()
			.from(sales)
			.where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate), eq(sales.status, 'completed')))

		const totalSales = salesInPeriod.length
		const totalRevenue = salesInPeriod.reduce((sum, sale) => sum + sale.total, 0)
		const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

		// Calculate profit (revenue - cost)
		let totalProfit = 0
		for (const sale of salesInPeriod) {
			const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale.id))
			const cost = items.reduce((sum, item) => sum + (item.costPrice || 0) * item.quantity, 0)
			totalProfit += sale.total - cost
		}

		// Group by day
		const salesByDay = new Map<string, { sales: number; revenue: number }>()
		for (const sale of salesInPeriod) {
			const date = new Date(sale.createdAt || 0).toISOString().split('T')[0]
			const existing = salesByDay.get(date) || { sales: 0, revenue: 0 }
			salesByDay.set(date, {
				sales: existing.sales + 1,
				revenue: existing.revenue + sale.total,
			})
		}

		return {
			period: {
				start: new Date(startDate),
				end: new Date(endDate),
			},
			summary: {
				totalSales,
				totalRevenue,
				totalProfit,
				averageTicket,
				totalTransactions: totalSales,
			},
			salesByDay: Array.from(salesByDay.entries()).map(([date, data]) => ({
				date: new Date(date),
				sales: data.sales,
				revenue: data.revenue,
			})),
		}
	},

	async salesByProduct(startDate: number, endDate: number): Promise<SalesByProductReport> {

		const salesInPeriod = await db
			.select({ id: sales.id })
			.from(sales)
			.where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate), eq(sales.status, 'completed')))

		const saleIds = salesInPeriod.map((s) => s.id)

		if (saleIds.length === 0) {
			return { products: [] }
		}

		const items = await db
			.select({
				productId: saleItems.productId,
				productName: saleItems.productName,
				quantity: sum(saleItems.quantity),
				revenue: sum(saleItems.total),
				cost: sum(sql`${saleItems.costPrice} * ${saleItems.quantity}`),
			})
			.from(saleItems)
			.where(sql`${saleItems.saleId} IN (${sql.join(saleIds.map((id) => sql`${id}`), sql`, `)})`)
			.groupBy(saleItems.productId)

		return {
			products: items.map((item) => ({
				productId: item.productId || 0,
				productName: item.productName || 'Unknown',
				quantity: Number(item.quantity) || 0,
				revenue: Number(item.revenue) || 0,
				profit: Number(item.revenue) - Number(item.cost || 0),
			})),
		}
	},

	async salesByCategory(startDate: number, endDate: number): Promise<SalesByCategoryReport> {

		const salesInPeriod = await db
			.select({ id: sales.id, total: sales.total })
			.from(sales)
			.where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate), eq(sales.status, 'completed')))

		const totalRevenue = salesInPeriod.reduce((sum, sale) => sum + sale.total, 0)

		// Get items with categories
		const categoryMap = new Map<number, { name: string; revenue: number }>()
		for (const sale of salesInPeriod) {
			const items = await db
				.select({
					productId: saleItems.productId,
					total: saleItems.total,
				})
				.from(saleItems)
				.where(eq(saleItems.saleId, sale.id))

			for (const item of items) {
				if (item.productId) {
					const product = await db.select().from(products).where(eq(products.id, item.productId)).get()
					const categoryId = product?.categoryId
					if (categoryId) {
						const category = await db.select().from(categories).where(eq(categories.id, categoryId)).get()
						const existing = categoryMap.get(categoryId) || { name: category?.name || 'Unknown', revenue: 0 }
						categoryMap.set(categoryId, {
							name: existing.name,
							revenue: existing.revenue + (item.total || 0),
						})
					}
				}
			}
		}

		return {
			categories: Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
				categoryId,
				categoryName: data.name,
				sales: 0, // Would need to count sales per category
				revenue: data.revenue,
				percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
			})),
		}
	},

	async salesByPaymentMethod(startDate: number, endDate: number) {

		const salesInPeriod = await db
			.select({
				paymentMethod: sales.paymentMethod,
				total: sales.total,
			})
			.from(sales)
			.where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate), eq(sales.status, 'completed')))

		const methodMap = new Map<string, { transactions: number; amount: number }>()
		for (const sale of salesInPeriod) {
			const method = sale.paymentMethod || 'unknown'
			const existing = methodMap.get(method) || { transactions: 0, amount: 0 }
			methodMap.set(method, {
				transactions: existing.transactions + 1,
				amount: existing.amount + sale.total,
			})
		}

		return Array.from(methodMap.entries()).map(([method, data]) => ({
			method,
			transactions: data.transactions,
			amount: data.amount,
		}))
	},

	async profitAnalysis(startDate: number, endDate: number): Promise<ProfitAnalysisReport> {

		const salesInPeriod = await db
			.select()
			.from(sales)
			.where(and(gte(sales.createdAt, startDate), lte(sales.createdAt, endDate), eq(sales.status, 'completed')))

		let totalRevenue = 0
		let totalCost = 0
		let taxCollected = 0

		for (const sale of salesInPeriod) {
			totalRevenue += sale.total
			taxCollected += sale.taxAmount || 0

			const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale.id))
			for (const item of items) {
				totalCost += (item.costPrice || 0) * item.quantity
			}
		}

		const totalProfit = totalRevenue - totalCost
		const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

		return {
			totalRevenue,
			totalCost,
			totalProfit,
			margin,
			taxCollected,
		}
	},

	async stockValue() {
		const allProducts = await db.select().from(products).where(eq(products.isActive, true))

		let totalCostValue = 0
		let totalSaleValue = 0

		for (const product of allProducts) {
			if (product.trackStock) {
				totalCostValue += product.costPrice * product.stockQuantity
				totalSaleValue += product.salePrice * product.stockQuantity
			}
		}

		return {
			totalCostValue,
			totalSaleValue,
			potentialProfit: totalSaleValue - totalCostValue,
		}
	},

	async topProducts(limit: number = 10, startDate?: number, endDate?: number) {

		let query = db
			.select({
				productId: saleItems.productId,
				productName: saleItems.productName,
				quantity: sum(saleItems.quantity),
				revenue: sum(saleItems.total),
			})
			.from(saleItems)
			.groupBy(saleItems.productId)
			.orderBy(sql`${sum(saleItems.quantity)} DESC`)
			.limit(limit)

		if (startDate && endDate) {
			const salesInPeriod = await db
				.select({ id: sales.id })
				.from(sales)
				.where(
					and(
						gte(sales.createdAt, startDate),
						lte(sales.createdAt, endDate),
						eq(sales.status, 'completed')
					)
				)
			const saleIds = salesInPeriod.map((s) => s.id)
			if (saleIds.length > 0) {
				query = query.where(sql`${saleItems.saleId} IN (${sql.join(saleIds.map((id) => sql`${id}`), sql`, `)})`)
			}
		}

		const results = await query

		return results.map((item) => ({
			productId: item.productId || 0,
			productName: item.productName || 'Unknown',
			quantity: Number(item.quantity) || 0,
			revenue: Number(item.revenue) || 0,
		}))
	},

	async exportPDF(reportData: unknown): Promise<Buffer> {
		const PDFDocument = await import('pdfkit')
		const doc = new PDFDocument.default()
		const chunks: Buffer[] = []

		doc.on('data', (chunk) => chunks.push(chunk))
		doc.on('end', () => {})

		doc.fontSize(20).text('Relatório', { align: 'center' })
		doc.moveDown()
		doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`)
		doc.moveDown()
		doc.text(JSON.stringify(reportData, null, 2))

		doc.end()

		return new Promise((resolve) => {
			doc.on('end', () => {
				resolve(Buffer.concat(chunks))
			})
		})
	},

	async exportExcel(reportData: unknown): Promise<Buffer> {
		const ExcelJS = await import('exceljs')
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet('Relatório')

		worksheet.columns = [{ header: 'Dados', key: 'data', width: 50 }]
		worksheet.addRow({ data: JSON.stringify(reportData, null, 2) })

		const buffer = await workbook.xlsx.writeBuffer()
		return Buffer.from(buffer)
	},
}

