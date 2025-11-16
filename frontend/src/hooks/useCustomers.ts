import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Customer } from '@/types'
import apiService from '@/services/api.service'

export function useCustomers(filters?: { query?: string }) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.query) params.append('q', filters.query)

      const queryString = params.toString()
      return apiService.get<Customer[]>(`/api/customers${queryString ? `?${queryString}` : ''}`)
    },
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => apiService.get<Customer>(`/api/customers/${id}`),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      email?: string
      phone?: string
      nuit?: string
      address?: string
    }) => apiService.post<Customer>('/api/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) =>
      apiService.put<Customer>(`/api/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.delete(`/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useCustomerPurchaseHistory(customerId: number) {
  return useQuery({
    queryKey: ['customers', customerId, 'history'],
    queryFn: () => apiService.get(`/api/customers/${customerId}/history`),
    enabled: !!customerId,
  })
}

