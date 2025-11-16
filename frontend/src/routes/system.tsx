import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  useSystemInfo,
  useSystemLogs,
  useSystemBackups,
  useCreateBackup,
  useRestoreBackup,
} from '@/hooks/useSystem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Database, Download, Upload, FileText, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export const Route = createFileRoute('/system')({
  component: SystemPage,
})

function SystemPage() {
  const [logLevel, setLogLevel] = useState<string>('')
  const { data: systemInfo } = useSystemInfo()
  const { data: logs } = useSystemLogs({ level: logLevel || undefined, limit: 100 })
  const { data: backups } = useSystemBackups()
  const createBackup = useCreateBackup()
  const restoreBackup = useRestoreBackup()

  const handleCreateBackup = async () => {
    if (!confirm('Deseja criar um backup do sistema agora?')) return

    try {
      await createBackup.mutateAsync()
      toast.success('Backup criado com sucesso!')
    } catch (error) {
      toast.error('Erro ao criar backup')
      console.error('Error creating backup:', error)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('ATENÇÃO: Esta ação irá restaurar o backup selecionado. Todos os dados atuais serão substituídos. Deseja continuar?')) return

    try {
      await restoreBackup.mutateAsync(backupId)
      toast.success('Backup restaurado com sucesso!')
    } catch (error) {
      toast.error('Erro ao restaurar backup')
      console.error('Error restoring backup:', error)
    }
  }

  const logLevelColors: Record<string, 'default' | 'destructive' | 'secondary'> = {
    error: 'destructive',
    warn: 'default',
    info: 'secondary',
    debug: 'secondary',
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema</h1>
          <p className="text-gray-600 mt-1">Backup, restore e logs do sistema</p>
        </div>

        {/* Informações do Sistema */}
        {systemInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Versão</p>
                  <p className="font-semibold">{systemInfo.version || '1.0.0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Banco de Dados</p>
                  <p className="font-semibold">{systemInfo.database || 'SQLite'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Última Atualização</p>
                  <p className="font-semibold">
                    {systemInfo.lastUpdate ? format(new Date(systemInfo.lastUpdate), 'dd/MM/yyyy HH:mm') : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup e Restore */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleCreateBackup} disabled={createBackup.isPending} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                {createBackup.isPending ? 'Criando Backup...' : 'Criar Backup Agora'}
              </Button>
              <p className="text-sm text-gray-600">
                Crie um backup completo do banco de dados. Recomenda-se fazer backups regularmente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Restaurar Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {backups && backups.length > 0 ? (
                <div className="space-y-2">
                  {backups.map((backup: any) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{backup.filename || backup.id}</p>
                        <p className="text-xs text-gray-500">
                          {backup.createdAt ? format(new Date(backup.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={restoreBackup.isPending}
                      >
                        Restaurar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum backup disponível</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Logs do Sistema
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="w-40"
                >
                  <option value="">Todos</option>
                  <option value="error">Erro</option>
                  <option value="warn">Aviso</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logs && logs.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={logLevelColors[log.level] || 'secondary'}>
                            {log.level?.toUpperCase() || 'INFO'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.message || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum log encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
