import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/MainLayout'
import { useProducts } from '@/hooks/useProducts'
import { useCustomers } from '@/hooks/useCustomers'
import { useSales } from '@/hooks/useSales'
import { useDailySummary } from '@/hooks/useReports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
} from 'lucide-react'
import { format } from 'date-fns'
import { Sale, Product } from '@/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: products } = useProducts()
  const { data: customers } = useCustomers()
  const { data: sales } = useSales({ startDate: today, endDate: today })
  const { data: dailySummary } = useDailySummary(today)

  const totalProducts = products?.length || 0
  const totalCustomers = customers?.length || 0
  const salesArray = Array.isArray(sales) ? sales : []
  const todaySales = salesArray.length || 0
  const todayRevenue =
    (dailySummary && typeof dailySummary === 'object' && 'totalSales' in dailySummary
      ? (dailySummary as { totalSales?: number }).totalSales
      : undefined) ||
    (salesArray.length > 0
      ? salesArray.reduce((sum: number, sale: Sale) => sum + sale.total, 0)
      : 0)
  const lowStockProducts =
    (products || []).filter((p: Product) => p.stockQuantity <= p.minStock).length

  const stats = [
    {
      title: 'Vendas Hoje',
      value: `${todayRevenue.toFixed(2)} MT`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
    },
    {
      title: 'Vendas Realizadas',
      value: todaySales.toString(),
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5',
    },
    {
      title: 'Total de Produtos',
      value: totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: null,
    },
    {
      title: 'Total de Clientes',
      value: totalCustomers.toString(),
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: null,
    },
    {
      title: 'Stock Baixo',
      value: lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: lowStockProducts > 0 ? 'Atenção!' : null,
    },
  ]

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      {stat.change && (
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-500">
                            {stat.change}
                          </span>
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

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {salesArray && salesArray.length > 0 ? (
              <div className="space-y-3">
                {salesArray.slice(0, 5).map((sale: Sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{sale.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">
                        {sale.customer?.name || 'Cliente não identificado'} •{' '}
                        {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
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
              <p className="text-center text-gray-500 py-8">
                Nenhuma venda hoje
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
