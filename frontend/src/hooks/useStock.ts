import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { StockMovement } from '@/types'
import apiService from '@/services/api.service'

export function useStockHistory(filters?: { productId?: number; limit?: number }) {
  return useQuery({
    queryKey: ['stock', 'history', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.productId) params.append('productId', filters.productId.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      return apiService.get<StockMovement[]>(`/api/stock/history${queryString ? `?${queryString}` : ''}`)
    },
  })
}

export function useCurrentStock(productId: number) {
  return useQuery({
    queryKey: ['stock', 'current', productId],
    queryFn: () => apiService.get<{ quantity: number }>(`/api/stock/${productId}`),
    enabled: !!productId,
  })
}

export function useAddStockMovement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      productId: number
      type: 'in' | 'out' | 'adjustment'
      quantity: number
      notes?: string
    }) => apiService.post('/api/stock/movement', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { productId: number; newQuantity: number; reason: string }) =>
      apiService.post('/api/stock/adjust', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function usePerformInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { counts: Array<{ productId: number; countedQuantity: number }> }) =>
      apiService.post('/api/stock/inventory', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

