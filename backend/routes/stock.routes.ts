import { FastifyInstance } from 'fastify'
import { stockService } from '../services/stock.service.js'
import { stockMovementSchema, stockAdjustSchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { handleError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export async function stockRoutes(fastify: FastifyInstance) {
	fastify.post('/movement', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const body = stockMovementSchema.parse(request.body)
			const movement = await stockService.addMovement(body)
			return reply.status(201).send({ success: true, data: movement })
		} catch (err: unknown) {
			logger.error('Error in POST /stock/movement', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})

	fastify.post('/adjust', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const body = stockAdjustSchema.parse(request.body)
			const authRequest = request as any
			const adjustment = await stockService.adjust(body.productId, body.newQuantity, body.reason, authRequest.user?.id)
			return { success: true, data: adjustment }
		} catch (err: unknown) {
			logger.error('Error in POST /stock/adjust', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get(
		'/history',
		{
			schema: {
				tags: ['Stock'],
				description: 'Histórico de movimentações',
				querystring: {
					type: 'object',
					properties: {
						productId: { type: 'string' },
						limit: { type: 'string' },
						page: { type: 'string' },
					},
				},
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const { productId, limit, page } = request.query as { productId?: string; limit?: string; page?: string }
			const history = await stockService.getHistory(
				productId ? Number(productId) : undefined,
				limit ? Number(limit) : undefined,
				page ? Number(page) : undefined
			)
			return { success: true, data: history.data, pagination: history.pagination }
		} catch (err: unknown) {
			logger.error('Error in GET /stock/history', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get('/:productId', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const { productId } = request.params as { productId: string }
			const stock = await stockService.getCurrentStock(Number(productId))
			return { success: true, data: stock }
		} catch (err: unknown) {
			logger.error('Error in GET /stock/:productId', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.post('/inventory', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const { counts } = request.body as { counts: Array<{ productId: number; quantity: number }> }
			const result = await stockService.performInventory(counts)
			return { success: true, data: result }
		} catch (err: unknown) {
			logger.error('Error in POST /stock/inventory', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})
}

