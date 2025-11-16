export interface PaginationParams {
	page?: number
	limit?: number
}

export interface PaginatedResult<T> {
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
}

export function normalizePagination(params?: PaginationParams): { page: number; limit: number; offset: number } {
	const page = Math.max(1, params?.page || 1)
	const limit = Math.min(100, Math.max(1, params?.limit || 20)) // Default 20, max 100
	const offset = (page - 1) * limit
	return { page, limit, offset }
}

