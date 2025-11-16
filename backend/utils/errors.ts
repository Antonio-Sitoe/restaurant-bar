export class AppError extends Error {
	constructor(
		public code: string,
		message: string,
		public statusCode: number = 500,
		public details?: unknown
	) {
		super(message)
		this.name = 'AppError'
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super('VALIDATION_ERROR', message, 400, details)
		this.name = 'ValidationError'
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string, id?: string | number) {
		super('NOT_FOUND', `${resource} not found${id ? `: ${id}` : ''}`, 404)
		this.name = 'NotFoundError'
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string = 'Unauthorized') {
		super('UNAUTHORIZED', message, 401)
		this.name = 'UnauthorizedError'
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string = 'Forbidden') {
		super('FORBIDDEN', message, 403)
		this.name = 'ForbiddenError'
	}
}

export class ConflictError extends AppError {
	constructor(message: string, details?: unknown) {
		super('CONFLICT', message, 409, details)
		this.name = 'ConflictError'
	}
}

export function handleError(error: unknown): { code: string; message: string; details?: unknown } {
	if (error instanceof AppError) {
		return {
			code: error.code,
			message: error.message,
			details: error.details,
		}
	}

	if (error instanceof Error) {
		return {
			code: 'INTERNAL_ERROR',
			message: error.message,
			details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		}
	}

	return {
		code: 'UNKNOWN_ERROR',
		message: 'An unknown error occurred',
	}
}

