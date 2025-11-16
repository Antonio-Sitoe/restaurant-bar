import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User } from '@/types'
import apiService from '@/services/api.service'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.get<User[]>('/api/users'),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiService.get<User>(`/api/users/${id}`),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      username: string
      email: string
      password: string
      fullName?: string
      role: 'admin' | 'manager' | 'cashier'
    }) => apiService.post<User>('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      apiService.put<User>(`/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, oldPassword, newPassword }: { id: number; oldPassword: string; newPassword: string }) =>
      apiService.post(`/api/users/${id}/change-password`, { oldPassword, newPassword }),
  })
}

