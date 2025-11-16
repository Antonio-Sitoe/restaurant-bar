import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sale } from '@/types'
import apiService from '@/services/api.service'

export function useHeldSales() {
  return useQuery({
    queryKey: ['sales', 'held'],
    queryFn: () => apiService.get<Sale[]>('/api/sales/hold'),
  })
}

export function useHoldSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { items: any[]; customerId?: number }) => apiService.post<Sale>('/api/sales/hold', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', 'held'] })
    },
  })
}

export function useRecoverHeldSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.get<Sale>(`/api/sales/hold/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', 'held'] })
    },
  })
}

export function useDeleteHeldSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.delete(`/api/sales/hold/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', 'held'] })
    },
  })
}

