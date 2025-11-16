import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useSales, useCancelSale } from '@/hooks/useSales'
import { Sale } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Search, Receipt, X, Eye, Calendar, Printer } from 'lucide-react'
import { ReceiptPreview } from '@/components/reports/ReceiptPreview'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export const Route = createFileRoute('/sales')({
  component: SalesPage,
})

function SaleDetailModal({ sale, isOpen, onClose }: { sale: Sale | null; isOpen: boolean; onClose: () => void }) {
  if (!sale) return null

  const paymentMethodLabels = {
    cash: 'Dinheiro',
    card: 'Cartão',
    mpesa: 'M-Pesa',
    emola: 'E-Mola',
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda #{sale.invoiceNumber}</DialogTitle>
          <DialogClose onClose={onClose} />
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Data</p>
              <p className="font-medium">
                {format(new Date(sale.createdAt), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Método de Pagamento</p>
              <p className="font-medium">{paymentMethodLabels[sale.paymentMethod]}</p>
            </div>
            {sale.customer && (
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">{sale.customer.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={sale.status === 'completed' ? 'success' : 'destructive'}>
                {sale.status === 'completed' ? 'Concluída' : 'Cancelada'}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Itens da Venda</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice.toFixed(2)} MT</TableCell>
                    <TableCell className="text-right">{item.total.toFixed(2)} MT</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{sale.subtotal.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>{sale.discount.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between">
              <span>IVA:</span>
              <span>{sale.taxAmount.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{sale.total.toFixed(2)} MT</span>
            </div>
            {sale.paymentMethod === 'cash' && sale.cashReceived && (
              <div className="flex justify-between text-sm">
                <span>Valor Recebido:</span>
                <span>{sale.cashReceived.toFixed(2)} MT</span>
              </div>
            )}
            {sale.change && sale.change > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Troco:</span>
                <span>{sale.change.toFixed(2)} MT</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const { data: sales, isLoading } = useSales()
  const cancelSale = useCancelSale()

  const filteredSales = sales?.filter((sale) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      sale.invoiceNumber.toLowerCase().includes(query) ||
      sale.customer?.name.toLowerCase().includes(query) ||
      sale.items.some((item) => item.productName.toLowerCase().includes(query))
    )
  })

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setIsDetailOpen(true)
  }

  const handleCancel = async (sale: Sale) => {
    if (!confirm('Tem certeza que deseja cancelar esta venda?')) return

    try {
      await cancelSale.mutateAsync({ id: sale.id, reason: 'Cancelado pelo usuário' })
      toast.success('Venda cancelada com sucesso!')
    } catch (error) {
      console.error('Error canceling sale:', error)
    }
  }

  const paymentMethodLabels = {
    cash: 'Dinheiro',
    card: 'Cartão',
    mpesa: 'M-Pesa',
    emola: 'E-Mola',
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico de Vendas</h1>
            <p className="text-gray-600 mt-1">Visualize e gerencie todas as vendas realizadas</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número de fatura, cliente ou produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando vendas...</p>
              </div>
            ) : !filteredSales || filteredSales.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? 'Nenhuma venda encontrada' : 'Nenhuma venda registrada'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>{sale.customer?.name || 'Cliente não identificado'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sale.items.length} itens</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{paymentMethodLabels[sale.paymentMethod]}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{sale.total.toFixed(2)} MT</TableCell>
                      <TableCell>
                        <Badge variant={sale.status === 'completed' ? 'success' : 'destructive'}>
                          {sale.status === 'completed' ? 'Concluída' : 'Cancelada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setReceiptSale(sale)
                              setIsReceiptOpen(true)
                            }}
                            title="Ver recibo"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(sale)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {sale.status === 'completed' && (
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(sale)}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <SaleDetailModal sale={selectedSale} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />

        {/* Receipt Preview */}
        <ReceiptPreview
          sale={receiptSale}
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false)
            setReceiptSale(null)
          }}
          onPrint={() => {
            window.print()
          }}
        />
      </div>
    </MainLayout>
  )
}
