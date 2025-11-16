import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sale, CreateSaleInput } from '@/types'
import apiService from '@/services/api.service'

export function useSales(filters?: { startDate?: string; endDate?: string; status?: string }) {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.status) params.append('status', filters.status)

      const queryString = params.toString()
      return apiService.get<Sale[]>(`/api/sales${queryString ? `?${queryString}` : ''}`)
    },
  })
}

export function useSale(id: number) {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => apiService.get<Sale>(`/api/sales/${id}`),
    enabled: !!id,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSaleInput) => apiService.post<Sale>('/api/sales', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      apiService.post(`/api/sales/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

