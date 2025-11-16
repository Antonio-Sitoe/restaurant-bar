import { Sale } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { format } from 'date-fns'

interface ReceiptPreviewProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
  onPrint?: () => void
}

export function ReceiptPreview({ sale, isOpen, onClose, onPrint }: ReceiptPreviewProps) {
  if (!sale) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recibo de Venda</DialogTitle>
          <DialogClose onClose={onClose} />
        </DialogHeader>

        <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg font-mono text-sm">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">SISTEMA POS</h2>
            <p className="text-xs text-gray-600">Recibo de Venda</p>
          </div>

          <div className="border-t border-b border-gray-300 py-2 mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Fatura:</span>
              <span className="font-bold">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span>Data:</span>
              <span>{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            {sale.customer && (
              <div className="flex justify-between text-xs">
                <span>Cliente:</span>
                <span>{sale.customer.name}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-4">
            {sale.items.map((item) => (
              <div key={item.id} className="mb-2 pb-2 border-b border-gray-200">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.productName}</span>
                  <span>{item.total.toFixed(2)} MT</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    {item.quantity} x {item.unitPrice.toFixed(2)} MT
                  </span>
                  {item.discount > 0 && <span>Desc: {item.discount.toFixed(2)} MT</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-300 pt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Subtotal:</span>
              <span>{sale.subtotal.toFixed(2)} MT</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-xs">
                <span>Desconto:</span>
                <span>-{sale.discount.toFixed(2)} MT</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span>IVA (17%):</span>
              <span>{sale.taxAmount.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
              <span>TOTAL:</span>
              <span>{sale.total.toFixed(2)} MT</span>
            </div>
            {sale.paymentMethod === 'cash' && sale.cashReceived && (
              <>
                <div className="flex justify-between text-xs mt-2">
                  <span>Recebido:</span>
                  <span>{sale.cashReceived.toFixed(2)} MT</span>
                </div>
                {sale.change && sale.change > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Troco:</span>
                    <span>{sale.change.toFixed(2)} MT</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between text-xs mt-2">
              <span>Pagamento:</span>
              <span className="uppercase">
                {sale.paymentMethod === 'cash'
                  ? 'Dinheiro'
                  : sale.paymentMethod === 'card'
                    ? 'Cartão'
                    : sale.paymentMethod === 'mpesa'
                      ? 'M-Pesa'
                      : 'E-Mola'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600">Obrigado pela sua compra!</p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
          {onPrint && (
            <Button onClick={onPrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

