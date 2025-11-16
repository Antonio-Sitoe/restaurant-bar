import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/MainLayout'
import { useProducts } from '@/hooks/useProducts'
import { useCustomers } from '@/hooks/useCustomers'
import { useSales } from '@/hooks/useSales'
import { useDailySummary, useSalesByPeriod } from '@/hooks/useReports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { format, subDays } from 'date-fns'
import { Sale, Product } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  const { data: products } = useProducts()
  const { data: customers } = useCustomers()
  const { data: sales } = useSales({ startDate: today, endDate: today })
  const { data: dailySummary } = useDailySummary(today)
  const { data: salesByPeriod } = useSalesByPeriod(startDate, today)

  const totalProducts = products?.length || 0
  const totalCustomers = customers?.length || 0
  const salesArray = Array.isArray(sales) ? sales : []
  const todaySales = salesArray.length || 0
  const todayRevenue =
    (dailySummary &&
    typeof dailySummary === 'object' &&
    'totalSales' in dailySummary
      ? (dailySummary as { totalSales?: number }).totalSales
      : undefined) ||
    (salesArray.length > 0
      ? salesArray.reduce((sum: number, sale: Sale) => sum + sale.total, 0)
      : 0)
  const lowStockProducts = (products || []).filter(
    (p: Product) => p.stockQuantity <= p.minStock
  ).length

  // Preparar dados para gráfico
  const chartData = Array.isArray(salesByPeriod)
    ? salesByPeriod.map((item: { date: string; total?: number }) => ({
        date: format(new Date(item.date), 'dd/MM'),
        vendas: item.total || 0,
      }))
    : []

  const stats = [
    {
      title: 'Vendas Hoje',
      value: `${todayRevenue.toFixed(2)} MT`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+12%',
      changeType: 'up' as const,
    },
    {
      title: 'Vendas Realizadas',
      value: todaySales.toString(),
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+5',
      changeType: 'up' as const,
    },
    {
      title: 'Total de Produtos',
      value: totalProducts.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: null,
      changeType: null as null,
    },
    {
      title: 'Total de Clientes',
      value: totalCustomers.toString(),
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: null,
      changeType: null as null,
    },
    {
      title: 'Stock Baixo',
      value: lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: lowStockProducts > 0 ? 'Atenção!' : null,
      changeType: lowStockProducts > 0 ? ('down' as const) : null,
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Dashboard</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className="hover:shadow-md transition-shadow border-gray-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-bold mb-2 ${stat.color}`}>
                        {stat.value}
                      </p>
                      {stat.change && (
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            stat.changeType === 'up'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.changeType === 'up' ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          <span>{stat.change}</span>
                        </div>
                      )}
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Vendas dos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar
                      dataKey="vendas"
                      fill="#9333ea"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales Table */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Vendas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {salesArray && salesArray.length > 0 ? (
                <div className="space-y-2">
                  {salesArray.slice(0, 8).map((sale: Sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {sale.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sale.customer?.name || 'Cliente não identificado'} •{' '}
                          {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {sale.total.toFixed(2)} MT
                        </p>
                        <p className="text-xs text-gray-500">
                          {sale.items?.length || 0} itens
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  Nenhuma venda hoje
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Produtos com Stock Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Produto
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Stock Atual
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Stock Mínimo
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(products || [])
                      .filter((p: Product) => p.stockQuantity <= p.minStock)
                      .slice(0, 10)
                      .map((product: Product) => (
                        <tr
                          key={product.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {product.stockQuantity}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {product.minStock}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Stock Baixo
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                Todos os produtos têm stock adequado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
