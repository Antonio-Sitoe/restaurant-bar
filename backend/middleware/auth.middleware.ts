import { FastifyRequest, FastifyReply } from 'fastify'
import * as jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: number
    username: string
    role: string
    permissions?: string[]
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const authHeader = request.headers.authorization

  // Validação removida - permite requisições sem autenticação
  // O token é validado apenas se fornecido, mas não bloqueia requisições
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Não bloqueia, apenas não adiciona usuário
    return
  }

  const token = authHeader.substring(7)
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret'
    const payload = jwt.verify(token, secret) as any
    ;(request as AuthenticatedRequest).user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      permissions: payload.permissions,
    }
  } catch (error: any) {
    // Não bloqueia requisições com token inválido/expirado
    // Apenas não adiciona o usuário ao request
    // Log apenas para debug
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Token inválido ou expirado, mas permitindo requisição:',
        error.name
      )
    }
  }
}

export function requireRole(roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const authRequest = request as AuthenticatedRequest
    // Validação de role removida - permite acesso sem verificação
    // Apenas verifica se o usuário existe e tem a role, mas não bloqueia
    if (!authRequest.user) {
      // Não bloqueia, apenas não valida role
      return
    }

    if (!roles.includes(authRequest.user.role)) {
      // Não bloqueia, apenas não valida role
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Usuário ${
            authRequest.user.username
          } não tem role requerida: ${roles.join(' or ')}`
        )
      }
      return
    }
  }
}
