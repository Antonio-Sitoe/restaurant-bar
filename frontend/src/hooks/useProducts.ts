import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, CreateProductInput } from '@/types'
import apiService from '@/services/api.service'

export function useProducts(filters?: { query?: string; categoryId?: number }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.query) params.append('q', filters.query)
      if (filters?.categoryId)
        params.append('categoryId', filters.categoryId.toString())

      const queryString = params.toString()
      return apiService.get<Product[]>(
        `/api/products${queryString ? `?${queryString}` : ''}`
      )
    },
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiService.get<Product>(`/api/products/${id}`),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      apiService.post<Product>('/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<CreateProductInput>
    }) => apiService.put<Product>(`/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => apiService.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useProductByBarcode(barcode: string) {
  return useQuery({
    queryKey: ['products', 'barcode', barcode],
    queryFn: () => apiService.get<Product>(`/api/products/barcode/${barcode}`),
    enabled: !!barcode && barcode.length > 0,
  })
}
