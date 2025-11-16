// Common types
export interface IPCResponse<T> {
	success: boolean
	data?: T
	error?: {
		code: string
		message: string
		details?: unknown
	}
}

// Pagination
export interface PaginationParams {
	page?: number
	limit?: number
}

export interface PaginatedResponse<T> {
	data: T[]
	total: number
	page: number
	limit: number
	totalPages: number
}

// Filters
export interface ProductFilters {
	categoryId?: number
	isActive?: boolean
	lowStock?: boolean
	search?: string
}

export interface SaleFilters {
	startDate?: number
	endDate?: number
	status?: 'completed' | 'cancelled' | 'refunded'
	customerId?: number
	userId?: number
	paymentMethod?: string
}

export interface StockFilters {
	productId?: number
	type?: 'in' | 'out' | 'adjustment' | 'return' | 'damage' | 'transfer'
	startDate?: number
	endDate?: number
}

// Report types
export interface SalesByPeriodReport {
	period: {
		start: Date
		end: Date
	}
	summary: {
		totalSales: number
		totalRevenue: number
		totalProfit: number
		averageTicket: number
		totalTransactions: number
	}
	salesByDay: Array<{
		date: Date
		sales: number
		revenue: number
	}>
}

export interface SalesByProductReport {
	products: Array<{
		productId: number
		productName: string
		quantity: number
		revenue: number
		profit: number
	}>
}

export interface SalesByCategoryReport {
	categories: Array<{
		categoryId: number
		categoryName: string
		sales: number
		revenue: number
		percentage: number
	}>
}

export interface ProfitAnalysisReport {
	totalRevenue: number
	totalCost: number
	totalProfit: number
	margin: number
	taxCollected: number
}

// Backup types
export interface BackupFile {
	version: string
	timestamp: string
	database: Buffer
	images: Record<string, Buffer>
	settings: Record<string, unknown>
	checksum: string
}

export interface BackupConfig {
	enabled?: boolean
	frequency?: 'hourly' | 'daily' | 'weekly'
	schedule?: string // Cron expression (e.g., '0 2 * * *' for daily at 2 AM)
	time?: string
	retention?: number
	retentionDays?: number // Number of days to keep backups
	location?: string
}

