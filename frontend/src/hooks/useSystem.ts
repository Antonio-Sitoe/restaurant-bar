import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/services/api.service'

export function useSystemInfo() {
  return useQuery({
    queryKey: ['system', 'info'],
    queryFn: () => apiService.get('/api/system/info'),
  })
}

export function useSystemLogs(filters?: { level?: string; limit?: number }) {
  return useQuery({
    queryKey: ['system', 'logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.level) params.append('level', filters.level)
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      return apiService.get(`/api/system/logs${queryString ? `?${queryString}` : ''}`)
    },
  })
}

export function useSystemBackups() {
  return useQuery({
    queryKey: ['system', 'backups'],
    queryFn: () => apiService.get('/api/system/backups'),
  })
}

export function useCreateBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiService.post('/api/system/backup'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'backups'] })
    },
  })
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (backupId: string) => apiService.post(`/api/system/restore`, { backupId }),
  })
}

