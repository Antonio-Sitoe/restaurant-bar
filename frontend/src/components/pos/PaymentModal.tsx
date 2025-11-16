import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  onConfirm: (paymentData: {
    method: 'cash' | 'card' | 'mpesa' | 'emola'
    cashReceived?: number
  }) => void
  isLoading?: boolean
}

export function PaymentModal({ isOpen, onClose, total, onConfirm, isLoading }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mpesa' | 'emola'>('cash')
  const [cashReceived, setCashReceived] = useState(0)

  const change = cashReceived - total

  const handleConfirm = () => {
    if (paymentMethod === 'cash' && cashReceived < total) {
      return
    }
    onConfirm({
      method: paymentMethod,
      cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
    })
  }

  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
    { value: 'card', label: 'Cartão', icon: CreditCard },
    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
    { value: 'emola', label: 'E-Mola', icon: Wallet },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Pagamento</DialogTitle>
          <DialogClose onClose={onClose} />
        </DialogHeader>

        <div className="space-y-4">
          {/* Total */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
                <p className="text-4xl font-bold text-blue-600">{total.toFixed(2)} MT</p>
              </div>
            </CardContent>
          </Card>

          {/* Método de Pagamento */}
          <div>
            <label className="text-sm font-medium mb-2 block">Método de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value as any)}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-sm font-medium">{method.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Valor Recebido (apenas para dinheiro) */}
          {paymentMethod === 'cash' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Valor Recebido</label>
              <Input
                type="number"
                value={cashReceived || ''}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                placeholder="0.00"
                className="text-lg font-semibold"
                autoFocus
              />
              {cashReceived > 0 && (
                <div className="mt-2 space-y-1">
                  {change > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Troco: {change.toFixed(2)} MT
                    </p>
                  )}
                  {change < 0 && (
                    <p className="text-sm text-red-600 font-medium">
                      Faltam: {Math.abs(change).toFixed(2)} MT
                    </p>
                  )}
                  {change === 0 && (
                    <p className="text-sm text-green-600 font-medium">Valor exato!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={isLoading || (paymentMethod === 'cash' && cashReceived < total)}
            >
              {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

