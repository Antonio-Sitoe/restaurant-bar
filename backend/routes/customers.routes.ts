import { FastifyInstance } from 'fastify'
import { customerService } from '../services/customer.service'
import { customerSchema, updateCustomerSchema } from '../utils/validators'
import { authMiddleware } from '../middleware/auth.middleware'
import { handleError } from '../utils/errors'
import { logger } from '../utils/logger'

export async function customerRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Customers'],
        description: 'Listar todos os clientes',
        querystring: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            isActive: { type: 'string' },
            page: { type: 'string' },
            limit: { type: 'string' },
          },
        },
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const query = request.query as {
          query?: string
          isActive?: string
          page?: string
          limit?: string
        }
        const customers = await customerService.getAll({
          query: query.query,
          isActive:
            query.isActive === 'true'
              ? true
              : query.isActive === 'false'
              ? false
              : undefined,
          page: query.page ? Number(query.page) : undefined,
          limit: query.limit ? Number(query.limit) : undefined,
        })
        return {
          success: true,
          data: customers.data,
          pagination: customers.pagination,
        }
      } catch (err: unknown) {
        logger.error('Error in GET /customers', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const customer = await customerService.getById(Number(id))
        if (!customer) {
          return reply
            .status(404)
            .send({
              success: false,
              error: { code: 'NOT_FOUND', message: 'Customer not found' },
            })
        }
        return { success: true, data: customer }
      } catch (err: unknown) {
        logger.error('Error in GET /customers/:id', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/search',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { q } = request.query as { q?: string }
        if (!q) {
          return reply
            .status(400)
            .send({
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Query parameter "q" is required',
              },
            })
        }
        const customers = await customerService.search(q)
        return { success: true, data: customers }
      } catch (err: unknown) {
        logger.error('Error in GET /customers/search', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.post('/', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const body = customerSchema.parse(request.body)
      const customer = await customerService.create(body)
      return reply.status(201).send({ success: true, data: customer })
    } catch (err: unknown) {
      logger.error('Error in POST /customers', err)
      return reply.status(400).send({ success: false, error: handleError(err) })
    }
  })

  fastify.put(
    '/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const body = updateCustomerSchema.parse(request.body)
        const customer = await customerService.update(Number(id), body)
        return { success: true, data: customer }
      } catch (err: unknown) {
        logger.error('Error in PUT /customers/:id', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.delete(
    '/:id',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        await customerService.delete(Number(id))
        return { success: true }
      } catch (err: unknown) {
        logger.error('Error in DELETE /customers/:id', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/:id/history',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const history = await customerService.getPurchaseHistory(Number(id))
        return { success: true, data: history }
      } catch (err: unknown) {
        logger.error('Error in GET /customers/:id/history', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )
}
