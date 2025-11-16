import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'
import toast from 'react-hot-toast'
import { isTokenExpired } from '../utils/token'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - adiciona token de autenticação
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token')

        // Adiciona o token se existir
        // A verificação de expiração será feita pelo backend
        // Não bloqueamos aqui para evitar falsos positivos
        if (token && config.headers) {
          // Verifica se está expirado apenas para logging, mas sempre envia o token
          // O backend vai validar de qualquer forma
          const expired = isTokenExpired(token)
          if (expired) {
            console.warn(
              'Token pode estar expirado, mas enviando para validação do backend'
            )
          }

          // Sempre adiciona o token se existir
          // O backend vai retornar 401 se estiver inválido/expirado
          config.headers.Authorization = `Bearer ${token}`
        } else if (
          !token &&
          config.url &&
          !config.url.includes('/auth/login')
        ) {
          // Log apenas para debug - não bloqueia requisições
          console.debug('Request sem token:', config.url)
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - trata erros globalmente
    this.api.interceptors.response.use(
      (response) => response,
      async (
        error: AxiosError<{
          success?: boolean
          error?: { code?: string; message?: string }
          message?: string
        }>
      ) => {
        if (error.response) {
          const status = error.response.status
          const errorData = error.response.data as {
            success?: boolean
            error?: { code?: string; message?: string }
            message?: string
          }
          const message =
            errorData?.error?.message ||
            errorData?.message ||
            errorData?.error ||
            'Erro desconhecido'

          switch (status) {
            case 401: {
              // Token inválido ou expirado
              const currentPath = window.location.pathname

              // Só processa se não estiver já na página de login
              if (currentPath !== '/login') {
                // Limpa dados de autenticação
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user')

                // Evita múltiplos toasts usando o ID único do toast
                const toastId = 'session-expired-401'
                toast.error('Sessão expirada. Faça login novamente.', {
                  id: toastId,
                  duration: 5000,
                })

                // Usa navigate do router se disponível, senão usa window.location
                setTimeout(() => {
                  if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                  }
                }, 500)
              }
              break
            }
            case 403:
              toast.error('Você não tem permissão para realizar esta ação.')
              break
            case 404:
              toast.error('Recurso não encontrado.')
              break
            case 422:
              // Erro de validação
              toast.error(message)
              break
            case 500:
              toast.error(
                'Erro interno do servidor. Tente novamente mais tarde.'
              )
              break
            default:
              toast.error(message || 'Ocorreu um erro inesperado.')
          }
        } else if (error.request) {
          toast.error('Erro de conexão. Verifique sua internet.')
        } else {
          toast.error('Erro ao processar requisição.')
        }

        return Promise.reject(error)
      }
    )
  }

  get instance() {
    return this.api
  }

  // Métodos HTTP
  async get<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.get<{
      success?: boolean
      data?: T
      error?: unknown
    }>(url, config)
    // Se a resposta tem formato { success: true, data: ... }, extrai o data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return (response.data as { success: boolean; data: T }).data as T
    }
    return response.data as T
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.post<{
      success?: boolean
      data?: T
      error?: unknown
    }>(url, data, config)
    // Se a resposta tem formato { success: true, data: ... }, extrai o data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return (response.data as { success: boolean; data: T }).data as T
    }
    return response.data as T
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.put<{
      success?: boolean
      data?: T
      error?: unknown
    }>(url, data, config)
    // Se a resposta tem formato { success: true, data: ... }, extrai o data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return (response.data as { success: boolean; data: T }).data as T
    }
    return response.data as T
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.patch<{
      success?: boolean
      data?: T
      error?: unknown
    }>(url, data, config)
    // Se a resposta tem formato { success: true, data: ... }, extrai o data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return (response.data as { success: boolean; data: T }).data as T
    }
    return response.data as T
  }

  async delete<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.api.delete<{
      success?: boolean
      data?: T
      error?: unknown
    }>(url, config)
    // Se a resposta tem formato { success: true, data: ... }, extrai o data
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return (response.data as { success: boolean; data: T }).data as T
    }
    return response.data as T
  }
}

export const apiService = new ApiService()
export default apiService
