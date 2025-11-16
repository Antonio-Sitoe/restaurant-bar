import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function PaymentModal({
  isOpen,
  onClose,
  total,
  onConfirm,
  isLoading,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'card' | 'mpesa' | 'emola'
  >('cash')
  const [cashReceived, setCashReceived] = useState(0)
  const [inputValue, setInputValue] = useState('')

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

  const handleKeypadClick = (value: string) => {
    if (value === 'C') {
      setInputValue('')
      setCashReceived(0)
    } else if (value === '←') {
      const newValue = inputValue.slice(0, -1)
      setInputValue(newValue)
      setCashReceived(newValue ? parseFloat(newValue) : 0)
    } else if (value === '.') {
      if (!inputValue.includes('.')) {
        const newValue = inputValue + value
        setInputValue(newValue)
      }
    } else {
      const newValue = inputValue + value
      setInputValue(newValue)
      setCashReceived(parseFloat(newValue) || 0)
    }
  }

  const handleQuickAmount = (amount: number) => {
    setInputValue(amount.toString())
    setCashReceived(amount)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permite apenas números e um ponto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value)
      setCashReceived(value ? parseFloat(value) : 0)
    }
  }

  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
    { value: 'card', label: 'Cartão', icon: CreditCard },
    { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
    { value: 'emola', label: 'E-Mola', icon: Wallet },
  ]

  const keypadButtons = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '.',
    '0',
    '←',
  ]

  const quickAmounts = [
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '500', value: 500 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1400px] w-[96vw] p-0 overflow-hidden">
        {/* Header com gradiente */}
        <DialogHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6">
          <DialogTitle className="text-3xl font-black flex items-center gap-3">
            💳 Finalizar Pagamento
          </DialogTitle>
          <DialogClose onClose={onClose} />
        </DialogHeader>

        <div className="grid grid-cols-3 gap-0">
          {/* COLUNA ESQUERDA: Total e Métodos de Pagamento */}
          <div className="col-span-1 p-6 space-y-5 bg-gray-50 border-r-2 border-gray-200">
            {/* Total com destaque */}
            <Card className="border-3 border-emerald-300 shadow-xl bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-base text-gray-700 mb-2 font-bold uppercase">
                    💰 Total a Pagar
                  </p>
                  <p className="text-6xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
                    {total.toFixed(2)}
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">MT</p>
                </div>
              </CardContent>
            </Card>

            {/* Método de Pagamento */}
            <div>
              <label className="text-xl font-black mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-wide">
                💵 Método de Pagamento
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.value
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          method.value as 'cash' | 'card' | 'mpesa' | 'emola'
                        )
                      }
                      className={`group relative p-5 border-3 rounded-2xl text-center transition-all duration-200 h-28 flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-100 to-green-100 shadow-2xl scale-105 ring-4 ring-emerald-200'
                          : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50 hover:scale-102 shadow-md'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                      )}
                      <Icon
                        className={`h-12 w-12 mb-2 transition-colors ${
                          isSelected
                            ? 'text-emerald-600'
                            : 'text-gray-500 group-hover:text-emerald-500'
                        }`}
                      />
                      <p
                        className={`text-base font-bold ${
                          isSelected ? 'text-emerald-800' : 'text-gray-700'
                        }`}
                      >
                        {method.label}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={handleConfirm}
                className="w-full h-16 text-xl font-black bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl transition-all rounded-xl"
                disabled={
                  isLoading ||
                  (paymentMethod === 'cash' && cashReceived < total)
                }
              >
                {isLoading ? '⏳ Processando...' : '✅ Confirmar'}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-14 text-base font-bold border-2 hover:bg-red-50 hover:border-red-400 hover:text-red-700 rounded-xl"
                disabled={isLoading}
              >
                ❌ Cancelar
              </Button>
            </div>
          </div>
          {/* COLUNA DIREITA: Teclado e Display (apenas para dinheiro) */}
          {paymentMethod === 'cash' && (
            <div className="col-span-2 p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
              <div className="space-y-5">
                {/* Display do valor - Input editável */}
                <div>
                  <label className="text-base font-bold mb-2 flex items-center gap-2 text-gray-800 uppercase">
                    💵 Digite o Valor Recebido
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="text-7xl font-black text-center text-blue-600 h-32 border-4 border-blue-400 rounded-xl shadow-xl pr-24 bg-white"
                      autoFocus
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl font-bold text-blue-500 pointer-events-none">
                      MT
                    </span>
                  </div>
                </div>

                {/* Valores Rápidos */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2 uppercase">
                    ⚡ Valores Rápidos
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount.value}
                        onClick={() => handleQuickAmount(amount.value)}
                        className="h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all rounded-lg"
                        type="button"
                      >
                        {amount.label} MT
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Teclado Numérico */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2 uppercase">
                    🔢 Teclado Virtual
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {keypadButtons.map((key) => (
                      <Button
                        key={key}
                        onClick={() => handleKeypadClick(key)}
                        className={`h-14 text-2xl font-bold transition-all rounded-lg ${
                          key === '←'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg'
                            : 'bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-800 hover:border-blue-400 shadow-sm hover:shadow-md'
                        }`}
                        type="button"
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Botão Limpar */}
                <Button
                  onClick={() => handleKeypadClick('C')}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all rounded-lg"
                  type="button"
                >
                  🗑️ Limpar Tudo
                </Button>

                {/* Feedback de Troco */}
                {cashReceived > 0 && (
                  <div className="space-y-4 pt-2">
                    {change > 0 && (
                      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between text-white">
                            <span className="text-2xl font-bold">
                              💸 Troco:
                            </span>
                            <span className="text-5xl font-black">
                              {change.toFixed(2)} MT
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {change < 0 && (
                      <Card className="bg-gradient-to-r from-red-500 to-orange-600 border-0 shadow-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between text-white">
                            <span className="text-2xl font-bold">
                              ⚠️ Faltam:
                            </span>
                            <span className="text-5xl font-black">
                              {Math.abs(change).toFixed(2)} MT
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {change === 0 && (
                      <Card className="bg-gradient-to-r from-emerald-500 to-green-600 border-0 shadow-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-center text-white">
                            <span className="text-3xl font-black">
                              ✅ Valor Exato!
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
