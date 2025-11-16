import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useSettings, useUpdateSetting } from '@/hooks/useSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSetting = useUpdateSetting()
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({})

  const handleChange = (key: string, value: string) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (key: string) => {
    const value = editedSettings[key]
    if (value === undefined) return

    try {
      const setting = settings?.find((s) => s.key === key)
      if (!setting) return

      // Converter valor conforme o tipo
      let convertedValue: string | number | boolean = value
      if (setting.type === 'number') {
        convertedValue = Number(value)
      } else if (setting.type === 'boolean') {
        convertedValue = value === 'true'
      }

      await updateSetting.mutateAsync({ key, value: convertedValue })
      toast.success('Configuração salva com sucesso!')
      setEditedSettings((prev) => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })
    } catch (error) {
      console.error('Error saving setting:', error)
    }
  }

  const getSettingValue = (key: string): string => {
    if (editedSettings[key] !== undefined) return editedSettings[key]
    const setting = settings?.find((s) => s.key === key)
    return setting?.value || ''
  }

  const generalSettings = settings?.filter((s) => s.key.startsWith('store_')) || []
  const salesSettings = settings?.filter((s) => s.key.includes('tax') || s.key.includes('print')) || []
  const otherSettings = settings?.filter(
    (s) => !s.key.startsWith('store_') && !s.key.includes('tax') && !s.key.includes('print')
  ) || []

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <p className="text-center py-8 text-gray-500">Carregando configurações...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
        </div>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Informações básicas da loja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generalSettings.map((setting) => (
              <div key={setting.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-1">
                    {setting.description || setting.key}
                  </label>
                  <Input
                    value={getSettingValue(setting.key)}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    placeholder={setting.value}
                  />
                </div>
                <Button
                  onClick={() => handleSave(setting.key)}
                  disabled={editedSettings[setting.key] === undefined || updateSetting.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Configurações de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Vendas</CardTitle>
            <CardDescription>IVA, impressão e outras configurações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesSettings.map((setting) => (
              <div key={setting.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-1">
                    {setting.description || setting.key}
                  </label>
                  {setting.type === 'boolean' ? (
                    <select
                      value={getSettingValue(setting.key)}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  ) : (
                    <Input
                      type={setting.type === 'number' ? 'number' : 'text'}
                      value={getSettingValue(setting.key)}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      placeholder={setting.value}
                    />
                  )}
                </div>
                <Button
                  onClick={() => handleSave(setting.key)}
                  disabled={editedSettings[setting.key] === undefined || updateSetting.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Outras Configurações */}
        {otherSettings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Outras Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {otherSettings.map((setting) => (
                <div key={setting.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium block mb-1">
                      {setting.description || setting.key}
                    </label>
                    <Input
                      type={setting.type === 'number' ? 'number' : 'text'}
                      value={getSettingValue(setting.key)}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      placeholder={setting.value}
                    />
                  </div>
                  <Button
                    onClick={() => handleSave(setting.key)}
                    disabled={editedSettings[setting.key] === undefined || updateSetting.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
