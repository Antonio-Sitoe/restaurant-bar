import { useQuery } from '@tanstack/react-query'
import apiService from '@/services/api.service'

export function useDailySummary(date?: string) {
  return useQuery({
    queryKey: ['reports', 'daily-summary', date],
    queryFn: () =>
      apiService.get(`/api/sales/daily-summary${date ? `?date=${date}` : ''}`),
  })
}

export function useTopProducts(
  limit: number = 10,
  period?: { startDate: string; endDate: string }
) {
  return useQuery({
    queryKey: ['reports', 'top-products', limit, period],
    queryFn: () => {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (period?.startDate) params.append('startDate', period.startDate)
      if (period?.endDate) params.append('endDate', period.endDate)

      return apiService.get(`/api/reports/top-products?${params.toString()}`)
    },
  })
}

export function useSalesByPeriod(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'sales-period', startDate, endDate],
    queryFn: () =>
      apiService.get(
        `/api/reports/sales/period?startDate=${startDate}&endDate=${endDate}`
      ),
    enabled: !!startDate && !!endDate,
  })
}

export function useSalesByPaymentMethod(period?: {
  startDate: string
  endDate: string
}) {
  return useQuery({
    queryKey: ['reports', 'sales-payment-method', period],
    queryFn: () => {
      const params = new URLSearchParams()
      if (period?.startDate) params.append('startDate', period.startDate)
      if (period?.endDate) params.append('endDate', period.endDate)

      return apiService.get(
        `/api/reports/sales/payment-method${params.toString() ? `?${params.toString()}` : ''}`
      )
    },
  })
}
