/**
 * Decodifica um JWT sem verificar a assinatura (apenas para ler o payload)
 */
function decodeJWT(
  token: string
): { exp?: number; id?: number; username?: string; role?: string } | null {
  try {
    // JWT tem formato: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decodifica o payload (parte do meio)
    const payload = parts[1]

    // Base64 URL decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Verifica se o token JWT está expirado sem precisar validar com o servidor
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true

  try {
    const decoded = decodeJWT(token)

    if (!decoded || !decoded.exp) {
      return true
    }

    // Verifica se o token expirou (com margem de 1 minuto)
    const expirationTime = decoded.exp * 1000 // Converte para milissegundos
    const currentTime = Date.now()
    const margin = 60 * 1000 // 1 minuto de margem

    return currentTime >= expirationTime - margin
  } catch {
    return true
  }
}

/**
 * Obtém informações do token sem validar
 */
export function getTokenInfo(
  token: string | null
): { exp?: number; id?: number; username?: string; role?: string } | null {
  if (!token) return null
  return decodeJWT(token)
}
