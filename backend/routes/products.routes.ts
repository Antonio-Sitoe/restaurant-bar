import { FastifyInstance } from 'fastify'
import { productService } from '../services/product.service'
import { productSchema, updateProductSchema } from '../utils/validators'
import { authMiddleware } from '../middleware/auth.middleware'
import { handleError } from '../utils/errors'
import { logger } from '../utils/logger'
import { zodToJsonSchema } from '../utils/swagger'

export async function productRoutes(fastify: FastifyInstance) {
  // Get all products
  fastify.get(
    '/',
    {
      schema: {
        tags: ['Products'],
        description: 'Listar todos os produtos',
        querystring: {
          type: 'object',
          properties: {
            categoryId: { type: 'string' },
            isActive: { type: 'string' },
            lowStock: { type: 'string' },
            search: { type: 'string' },
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
          categoryId?: string
          isActive?: string
          lowStock?: string
          search?: string
          page?: string
          limit?: string
        }
        const products = await productService.getAll({
          categoryId: query.categoryId ? Number(query.categoryId) : undefined,
          isActive:
            query.isActive === 'true'
              ? true
              : query.isActive === 'false'
              ? false
              : undefined,
          lowStock: query.lowStock === 'true',
          search: query.search,
          page: query.page ? Number(query.page) : undefined,
          limit: query.limit ? Number(query.limit) : undefined,
        })
        return {
          success: true,
          data: products.data,
          pagination: products.pagination,
        }
      } catch (err: unknown) {
        logger.error('Error in GET /products', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Get product by ID
  fastify.get(
    '/:id',
    {
      schema: {
        tags: ['Products'],
        description: 'Buscar produto por ID',
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
        const product = await productService.getById(Number(id))
        if (!product) {
          return reply.status(404).send({
            success: false,
            error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
          })
        }
        return { success: true, data: product }
      } catch (err: unknown) {
        logger.error('Error in GET /products/:id', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Get product by barcode
  fastify.get(
    '/barcode/:barcode',
    {
      schema: {
        tags: ['Products'],
        description: 'Buscar produto por código de barras',
        params: {
          type: 'object',
          properties: {
            barcode: { type: 'string' },
          },
          required: ['barcode'],
        },
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { barcode } = request.params as { barcode: string }
        const product = await productService.getByBarcode(barcode)
        if (!product) {
          return reply.status(404).send({
            success: false,
            error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' },
          })
        }
        return { success: true, data: product }
      } catch (err: unknown) {
        logger.error('Error in GET /products/barcode/:barcode', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Search products
  fastify.get(
    '/search',
    {
      schema: {
        tags: ['Products'],
        description: 'Pesquisar produtos',
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string' },
          },
          required: ['q'],
        },
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { q } = request.query as { q?: string }
        if (!q) {
          return reply.status(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Query parameter "q" is required',
            },
          })
        }
        const products = await productService.search(q)
        return { success: true, data: products }
      } catch (err: unknown) {
        logger.error('Error in GET /products/search', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Create product
  fastify.post(
    '/',
    {
      schema: {
        tags: ['Products'],
        description: 'Criar novo produto',
        body: zodToJsonSchema(productSchema),
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const body = productSchema.parse(request.body)
        const product = await productService.create(body)
        return reply.status(201).send({ success: true, data: product })
      } catch (err: unknown) {
        logger.error('Error in POST /products', err)
        const error = handleError(err)
        return reply.status(400).send({ success: false, error })
      }
    }
  )

  // Update product
  fastify.put(
    '/:id',
    {
      schema: {
        tags: ['Products'],
        description: 'Atualizar produto',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: zodToJsonSchema(updateProductSchema),
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        const body = updateProductSchema.parse(request.body)
        const product = await productService.update(Number(id), body)
        return { success: true, data: product }
      } catch (err: unknown) {
        logger.error('Error in PUT /products/:id', err)
        const error = handleError(err)
        return reply.status(400).send({ success: false, error })
      }
    }
  )

  // Delete product
  fastify.delete(
    '/:id',
    {
      schema: {
        tags: ['Products'],
        description: 'Excluir produto',
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
        await productService.delete(Number(id))
        return { success: true }
      } catch (err: unknown) {
        logger.error('Error in DELETE /products/:id', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Upload product image
  fastify.post(
    '/:id/image',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string }
        // TODO: Handle file upload
        return { success: true, message: 'Image upload not yet implemented' }
      } catch (err: unknown) {
        logger.error('Error in POST /products/:id/image', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Get low stock products
  fastify.get(
    '/low-stock',
    {
      schema: {
        tags: ['Products'],
        description: 'Listar produtos com stock baixo',
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const products = await productService.getLowStock()
        return { success: true, data: products }
      } catch (err: unknown) {
        logger.error('Error in GET /products/low-stock', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Get top selling products
  fastify.get(
    '/top-selling',
    {
      schema: {
        tags: ['Products'],
        description: 'Listar produtos mais vendidos',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'string' },
          },
        },
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { limit } = request.query as { limit?: string }
        const products = await productService.getTopSelling(
          limit ? Number(limit) : undefined
        )
        return { success: true, data: products }
      } catch (err: unknown) {
        logger.error('Error in GET /products/top-selling', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Import CSV
  fastify.post(
    '/import',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        // TODO: Handle CSV file upload
        return { success: true, message: 'CSV import not yet implemented' }
      } catch (err: unknown) {
        logger.error('Error in POST /products/import', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )

  // Export CSV
  fastify.get(
    '/export',
    {
      schema: {
        tags: ['Products'],
        description: 'Exportar produtos para CSV',
      },
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const csv = await productService.exportCSV()
        reply.header('Content-Type', 'text/csv')
        reply.header('Content-Disposition', 'attachment; filename=products.csv')
        return csv
      } catch (err: unknown) {
        logger.error('Error in GET /products/export', err)
        const error = handleError(err)
        return reply.status(500).send({ success: false, error })
      }
    }
  )
}
