import { FastifyInstance } from 'fastify'
import { categoryService } from '../services/category.service.js'
import { categorySchema, updateCategorySchema } from '../utils/validators.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { handleError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'
import { zodToJsonSchema } from '../utils/swagger.js'

export async function categoryRoutes(fastify: FastifyInstance) {
	fastify.get(
		'/',
		{
			schema: {
				tags: ['Categories'],
				description: 'Listar todas as categorias',
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const categories = await categoryService.getAll()
			return { success: true, data: categories }
		} catch (err: unknown) {
			logger.error('Error in GET /categories', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.get(
		'/:id',
		{
			schema: {
				tags: ['Categories'],
				description: 'Buscar categoria por ID',
				params: {
					type: 'object',
					properties: {
						id: { type: 'string' },
					},
					required: ['id'],
				},
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			const category = await categoryService.getById(Number(id))
			if (!category) {
				return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } })
			}
			return { success: true, data: category }
		} catch (err: unknown) {
			logger.error('Error in GET /categories/:id', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.post(
		'/',
		{
			schema: {
				tags: ['Categories'],
				description: 'Criar nova categoria',
				body: zodToJsonSchema(categorySchema),
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const body = categorySchema.parse(request.body)
			const category = await categoryService.create(body)
			return reply.status(201).send({ success: true, data: category })
		} catch (err: unknown) {
			logger.error('Error in POST /categories', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})

	fastify.put(
		'/:id',
		{
			schema: {
				tags: ['Categories'],
				description: 'Atualizar categoria',
				params: {
					type: 'object',
					properties: {
						id: { type: 'string' },
					},
					required: ['id'],
				},
				body: zodToJsonSchema(updateCategorySchema),
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			const body = updateCategorySchema.parse(request.body)
			const category = await categoryService.update(Number(id), body)
			return { success: true, data: category }
		} catch (err: unknown) {
			logger.error('Error in PUT /categories/:id', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})

	fastify.delete(
		'/:id',
		{
			schema: {
				tags: ['Categories'],
				description: 'Excluir categoria',
				params: {
					type: 'object',
					properties: {
						id: { type: 'string' },
					},
					required: ['id'],
				},
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const { id } = request.params as { id: string }
			await categoryService.delete(Number(id))
			return { success: true }
		} catch (err: unknown) {
			logger.error('Error in DELETE /categories/:id', err)
			return reply.status(500).send({ success: false, error: handleError(err) })
		}
	})

	fastify.post(
		'/reorder',
		{
			schema: {
				tags: ['Categories'],
				description: 'Reordenar categorias',
				body: {
					type: 'object',
					properties: {
						ids: {
							type: 'array',
							items: { type: 'number' },
						},
					},
					required: ['ids'],
				},
			},
			preHandler: authMiddleware,
		},
		async (request, reply) => {
		try {
			const { ids } = request.body as { ids: number[] }
			await categoryService.reorder(ids)
			return { success: true }
		} catch (err: unknown) {
			logger.error('Error in POST /categories/reorder', err)
			return reply.status(400).send({ success: false, error: handleError(err) })
		}
	})
}

