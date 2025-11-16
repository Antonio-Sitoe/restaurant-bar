import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  useSalesByPeriod,
  useSalesByPaymentMethod,
  useTopProducts,
} from '@/hooks/useReports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Download, Calendar } from 'lucide-react'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
})

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

function ReportsPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const lastWeek = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  const lastMonth = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const [startDate, setStartDate] = useState(lastWeek)
  const [endDate, setEndDate] = useState(today)

  const { data: salesByPeriod } = useSalesByPeriod(startDate, endDate)
  const { data: salesByPayment } = useSalesByPaymentMethod({
    startDate,
    endDate,
  })
  const { data: topProducts } = useTopProducts(10, { startDate, endDate })

  const handleExportPDF = async () => {
    try {
      const response = await fetch(
        `/api/reports/export/pdf?startDate=${startDate}&endDate=${endDate}`
      )
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${startDate}-${endDate}.pdf`
      a.click()
      toast.success('Relatório exportado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar relatório')
      console.error('Error exporting PDF:', error)
    }
  }

  const handleExportExcel = async () => {
    try {
      const response = await fetch(
        `/api/reports/export/excel?startDate=${startDate}&endDate=${endDate}`
      )
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${startDate}-${endDate}.xlsx`
      a.click()
      toast.success('Relatório exportado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar relatório')
      console.error('Error exporting Excel:', error)
    }
  }

  const paymentMethodData = salesByPayment
    ? Object.entries(salesByPayment).map(([method, value]) => ({
        name:
          method === 'cash'
            ? 'Dinheiro'
            : method === 'card'
              ? 'Cartão'
              : method === 'mpesa'
                ? 'M-Pesa'
                : 'E-Mola',
        value: Number(value),
      }))
    : []

  const topProductsData =
    topProducts?.map((p: Product) => ({
      name: p.name?.substring(0, 20) || 'Produto',
      quantidade: p.totalQuantity || 0,
      receita: p.totalRevenue || 0,
    })) || []

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-1">
              Análise de vendas e performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros de Data */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium">Período:</label>
              </div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <span className="text-gray-500">até</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(lastWeek)
                    setEndDate(today)
                  }}
                >
                  Última Semana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate(lastMonth)
                    setEndDate(today)
                  }}
                >
                  Último Mês
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Vendas por Período */}
        {salesByPeriod && salesByPeriod.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    name="Total (MT)"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#82ca9d"
                    name="Quantidade"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Vendas por Método de Pagamento */}
        {paymentMethodData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Produtos */}
        {topProductsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="quantidade"
                    fill="#8884d8"
                    name="Quantidade Vendida"
                  />
                  <Bar dataKey="receita" fill="#82ca9d" name="Receita (MT)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
