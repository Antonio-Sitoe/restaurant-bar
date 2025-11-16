import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Setting } from '@/types'
import apiService from '@/services/api.service'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiService.get<Setting[]>('/api/settings'),
  })
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => apiService.get<Setting>(`/api/settings/${key}`),
    enabled: !!key,
  })
}

export function useUpdateSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string | number | boolean }) =>
      apiService.put<Setting>(`/api/settings/${key}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

