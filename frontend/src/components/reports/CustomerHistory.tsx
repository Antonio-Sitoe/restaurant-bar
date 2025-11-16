import { Customer, Sale } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ReceiptPreview } from './ReceiptPreview'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

interface CustomerHistoryProps {
  customer: Customer
  sales: Sale[]
}

export function CustomerHistory({ customer, sales }: CustomerHistoryProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  const salesArray = Array.isArray(sales) ? sales : []
  const totalSpent = salesArray.reduce((sum, sale) => sum + sale.total, 0)
  const averageOrder = salesArray.length > 0 ? totalSpent / salesArray.length : 0

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total de Compras</p>
              <p className="text-3xl font-bold text-blue-600">{customer.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Gasto</p>
              <p className="text-3xl font-bold text-green-600">{totalSpent.toFixed(2)} MT</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
              <p className="text-3xl font-bold text-purple-600">{averageOrder.toFixed(2)} MT</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {salesArray.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma compra registrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesArray.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-sm">
                      {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{sale.items.length}</TableCell>
                    <TableCell className="font-semibold">{sale.total.toFixed(2)} MT</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase">
                        {sale.paymentMethod === 'cash'
                          ? 'Dinheiro'
                          : sale.paymentMethod === 'card'
                            ? 'Cartão'
                            : sale.paymentMethod === 'mpesa'
                              ? 'M-Pesa'
                              : 'E-Mola'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'completed' ? 'success' : 'destructive'}>
                        {sale.status === 'completed' ? 'Concluída' : 'Cancelada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedSale(sale)
                          setIsReceiptOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipt Preview */}
      <ReceiptPreview
        sale={selectedSale}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false)
          setSelectedSale(null)
        }}
        onPrint={() => {
          // TODO: Implement print functionality
          window.print()
        }}
      />
    </div>
  )
}

