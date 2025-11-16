import { FastifyInstance } from 'fastify'
import { reportService } from '../services/report.service'
import { reportPeriodSchema, topProductsSchema } from '../utils/validators'
import { authMiddleware } from '../middleware/auth.middleware'
import { handleError } from '../utils/errors'
import { logger } from '../utils/logger'

/**
 * Converte uma string de data ou número para timestamp (milissegundos)
 */
function parseDateToTimestamp(date: string | number | undefined): number {
  if (!date) {
    return Date.now()
  }

  // Se já é um número, valida se é finito
  if (typeof date === 'number') {
    return isFinite(date) && !isNaN(date) ? date : Date.now()
  }

  // Se é string, tenta converter
  if (typeof date === 'string') {
    // Tenta como número primeiro
    const numDate = Number(date)
    if (!isNaN(numDate) && isFinite(numDate)) {
      return numDate
    }

    // Tenta como string de data
    const dateObj = new Date(date)
    if (!isNaN(dateObj.getTime())) {
      return dateObj.getTime()
    }
  }

  // Fallback para hoje
  return Date.now()
}

export async function reportRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/sales/period',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const query = request.query as { startDate?: string; endDate?: string }
        const startDate = parseDateToTimestamp(query.startDate)
        const endDate = parseDateToTimestamp(query.endDate)
        const input = reportPeriodSchema.parse({ startDate, endDate })
        const report = await reportService.salesByPeriod(
          input.startDate,
          input.endDate
        )
        return { success: true, data: report }
      } catch (err: unknown) {
        logger.error('Error in GET /reports/sales/period', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/sales/product',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const query = request.query as { startDate?: string; endDate?: string }
        const startDate = parseDateToTimestamp(query.startDate)
        const endDate = parseDateToTimestamp(query.endDate)
        const input = reportPeriodSchema.parse({ startDate, endDate })
        const report = await reportService.salesByProduct(
          input.startDate,
          input.endDate
        )
        return { success: true, data: report }
      } catch (err: unknown) {
        logger.error('Error in GET /reports/sales/product', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/sales/category',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const query = request.query as { startDate?: string; endDate?: string }
        const startDate = parseDateToTimestamp(query.startDate)
        const endDate = parseDateToTimestamp(query.endDate)
        const input = reportPeriodSchema.parse({ startDate, endDate })
        const report = await reportService.salesByCategory(
          input.startDate,
          input.endDate
        )
        return { success: true, data: report }
      } catch (err: unknown) {
        logger.error('Error in GET /reports/sales/category', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/sales/payment-method',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const query = request.query as { startDate?: string; endDate?: string }
        const startDate = parseDateToTimestamp(query.startDate)
        const endDate = parseDateToTimestamp(query.endDate)
        const input = reportPeriodSchema.parse({ startDate, endDate })
        const report = await reportService.salesByPaymentMethod(
          input.startDate,
          input.endDate
        )
        return { success: true, data: report }
      } catch (err: unknown) {
        logger.error('Error in GET /reports/sales/payment-method', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/profit',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const query = request.query as { startDate?: string; endDate?: string }
        const startDate = parseDateToTimestamp(query.startDate)
        const endDate = parseDateToTimestamp(query.endDate)
        const input = reportPeriodSchema.parse({ startDate, endDate })
        const report = await reportService.profitAnalysis(
          input.startDate,
          input.endDate
        )
        return { success: true, data: report }
      } catch (err: unknown) {
        logger.error('Error in GET /reports/profit', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/stock-value',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const report = await reportService.stockValue()
        return { success: true, data: report }
      } catch (err: unknown) {
        logger.error('Error in GET /reports/stock-value', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/top-products',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const query = request.query as {
          limit?: string
          startDate?: string
          endDate?: string
        }
        const input = topProductsSchema.parse({
          limit: query.limit ? Number(query.limit) : 10,
          startDate: query.startDate
            ? parseDateToTimestamp(query.startDate)
            : undefined,
          endDate: query.endDate
            ? parseDateToTimestamp(query.endDate)
            : undefined,
        })
        const report = await reportService.topProducts(
          input.limit,
          input.startDate,
          input.endDate
        )
        return { success: true, data: report }
      } catch (err: unknown) {
        logger.error('Error in GET /reports/top-products', err)
        return reply
          .status(400)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/export/pdf',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const reportData = request.query
        const pdf = await reportService.exportPDF(reportData)
        reply.header('Content-Type', 'application/pdf')
        reply.header('Content-Disposition', 'attachment; filename=report.pdf')
        return pdf
      } catch (err: unknown) {
        logger.error('Error in GET /reports/export/pdf', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )

  fastify.get(
    '/export/excel',
    { preHandler: authMiddleware },
    async (request, reply) => {
      try {
        const reportData = request.query
        const excel = await reportService.exportExcel(reportData)
        reply.header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        reply.header('Content-Disposition', 'attachment; filename=report.xlsx')
        return excel
      } catch (err: unknown) {
        logger.error('Error in GET /reports/export/excel', err)
        return reply
          .status(500)
          .send({ success: false, error: handleError(err) })
      }
    }
  )
}
