import { FastifyInstance } from 'fastify'
import { saleService } from '../services/sale.service.js'
import { createSaleSchema } from '../utils/validators.js'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { handleError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export async function saleRoutes(fastify: FastifyInstance) {
	fastify.post('/', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const body = createSaleSchema.parse(request.body)
			const authRequest = request as AuthenticatedRequest
			const userId = authRequest.user?.id
			
			// Adicionar userId ao body se disponível
			const saleData = { ...body, userId }
			
			const result = await saleService.create(saleData)
			return reply.status(201).send({ success: true, data: result })
		} catch (err: unknown) {
			logger.error('Error in POST /sales', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get(
		'/',
		{
			schema: {
				tags: ['Sales'],
				description: 'Listar todas as vendas',
				querystring: {
					type: 'object',
					properties: {
						status: { type: 'string' },
						startDate: { type: 'string' },
						endDate: { type: 'string' },
						page: { type: 'string' },
						limit: { type: 'string' },
					},
				},
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const query = request.query as { status?: string; startDate?: string; endDate?: string; page?: string; limit?: string }
			const sales = await saleService.getAll({
				status: query.status,
				startDate: query.startDate ? Number(query.startDate) : undefined,
				endDate: query.endDate ? Number(query.endDate) : undefined,
				page: query.page ? Number(query.page) : undefined,
				limit: query.limit ? Number(query.limit) : undefined,
			})
			return { success: true, data: sales.data, pagination: sales.pagination }
		} catch (err: unknown) {
			logger.error('Error in GET /sales', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get('/:id', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			const sale = await saleService.getById(Number(id))
			if (!sale) {
				return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Sale not found' } })
			}
			return { success: true, data: sale }
		} catch (err: unknown) {
			logger.error('Error in GET /sales/:id', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.post('/:id/cancel', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			const { reason } = request.body as { reason: string }
			await saleService.cancel(Number(id), reason)
			return { success: true }
		} catch (err: unknown) {
			logger.error('Error in POST /sales/:id/cancel', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get('/:id/receipt', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			const receipt = await saleService.printReceipt(Number(id))
			return { success: true, data: receipt }
		} catch (err: unknown) {
			logger.error('Error in GET /sales/:id/receipt', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.post('/hold', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const holdData = request.body as any
			const holdId = await saleService.hold(holdData)
			return { success: true, data: { holdId } }
		} catch (err: unknown) {
			logger.error('Error in POST /sales/hold', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get('/hold/:id', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			const sale = await saleService.retrieveHold(id)
			return { success: true, data: sale }
		} catch (err: unknown) {
			logger.error('Error in GET /sales/hold/:id', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get('/daily-summary', { preHandler: authMiddleware }, async (request, reply) => {
		try {
			const { date } = request.query as { date?: string }
			let dateMs: number
			
			if (date) {
				// Se for uma string de data (formato ISO ou YYYY-MM-DD), converte para timestamp
				if (isNaN(Number(date))) {
					// É uma string de data, precisa converter
					const dateObj = new Date(date)
					if (isNaN(dateObj.getTime())) {
						// Data inválida, usa hoje
						dateMs = Date.now()
					} else {
						dateMs = dateObj.getTime()
					}
				} else {
					// É um número (timestamp)
					const numDate = Number(date)
					if (!isFinite(numDate)) {
						dateMs = Date.now()
					} else {
						dateMs = numDate
					}
				}
			} else {
				dateMs = Date.now()
			}
			
			const summary = await saleService.getDailySummary(dateMs)
			return { success: true, data: summary }
		} catch (err: unknown) {
			logger.error('Error in GET /sales/daily-summary', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})
}

