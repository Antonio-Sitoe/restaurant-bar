import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthenticatedRequest } from './auth.middleware.js'
import { auditService, type AuditAction } from '../services/audit.service.js'

export function auditMiddleware(action: AuditAction, tableName?: string) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		const authRequest = request as AuthenticatedRequest
		if (!authRequest.user) {
			return // Skip audit if not authenticated
		}

		try {
			const recordId = (request.params as any)?.id ? Number((request.params as any).id) : undefined
			const oldValues = request.method === 'PUT' || request.method === 'DELETE' ? request.body : undefined
			const newValues = request.method === 'POST' || request.method === 'PUT' ? request.body : undefined

			await auditService.log(action, {
				userId: authRequest.user.id,
				tableName,
				recordId,
				oldValues: oldValues as any,
				newValues: newValues as any,
			})
		} catch (error) {
			// Don't fail the request if audit fails
			console.error('Audit logging failed:', error)
		}
	}
}

