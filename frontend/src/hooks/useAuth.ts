import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, AuthResponse, LoginCredentials } from '@/types'
import apiService from '@/services/api.service'

export function useAuth() {
  const queryClient = useQueryClient()

  // Get current user from localStorage
  const getUser = (): User | null => {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('auth_token') && !!getUser()
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiService.post<AuthResponse>('/api/auth/login', credentials)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })

  // Logout
  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    queryClient.clear()
    window.location.href = '/login'
  }

  return {
    user: getUser(),
    isAuthenticated: isAuthenticated(),
    login: loginMutation.mutateAsync,
    logout,
    isLoading: loginMutation.isPending,
  }
}

