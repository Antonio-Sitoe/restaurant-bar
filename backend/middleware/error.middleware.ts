import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { handleError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export async function errorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply
) {
	const errorResponse = handleError(error)

	logger.error('Request error', {
		method: request.method,
		url: request.url,
		error: errorResponse,
		stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
	})

	reply.status(error.statusCode || 500).send({
		success: false,
		error: {
			code: errorResponse.code,
			message: errorResponse.message,
			details: process.env.NODE_ENV === 'development' ? errorResponse.details : undefined,
		},
	})
}

