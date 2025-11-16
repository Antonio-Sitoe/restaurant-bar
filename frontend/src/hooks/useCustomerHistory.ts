import { useQuery } from '@tanstack/react-query'
import { Sale } from '@/types'
import apiService from '@/services/api.service'

export function useCustomerHistory(customerId: number) {
  return useQuery({
    queryKey: ['customers', customerId, 'history'],
    queryFn: () => apiService.get<Sale[]>(`/api/customers/${customerId}/history`),
    enabled: !!customerId,
  })
}

