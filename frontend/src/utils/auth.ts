import { User } from '@/types'

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getUser()
}

export const hasPermission = (requiredRole: 'admin' | 'manager' | 'cashier'): boolean => {
  const user = getUser()
  if (!user) return false

  const roleHierarchy = {
    admin: 3,
    manager: 2,
    cashier: 1,
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export const clearAuth = (): void => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
}

