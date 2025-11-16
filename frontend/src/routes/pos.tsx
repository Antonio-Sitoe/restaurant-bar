import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useProducts, useProductByBarcode } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useCreateSale } from '@/hooks/useSales'
import { CustomerSelector } from '@/components/pos/CustomerSelector'
import { PaymentModal } from '@/components/pos/PaymentModal'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ShoppingCart, Plus, Minus, X, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { Customer } from '@/types'

export const Route = createFileRoute('/pos')({
  component: POSPage,
})

interface CartItem {
  productId: number
  productName: string
  unitPrice: number
  quantity: number
}

function POSPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>()

  const { data: products } = useProducts({ query: searchQuery || undefined })
  const { data: allProducts } = useProducts()
  const { data: categories } = useCategories()
  const { data: productByBarcode } = useProductByBarcode(barcode)
  const createSale = useCreateSale()

  // Adicionar produto ao carrinho
  const addToCart = (product: any, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.salePrice,
          quantity,
        },
      ]
    })
    setSearchQuery('')
    setBarcode('')
  }

  // Remover do carrinho
  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  // Atualizar quantidade
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  // Calcular totais
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const tax = subtotal * 0.17 // 17% IVA
  const total = subtotal + tax

  const handlePaymentConfirm = async (paymentData: {
    method: 'cash' | 'card' | 'mpesa' | 'emola'
    cashReceived?: number
  }) => {
    if (cart.length === 0) {
      toast.error('Adicione produtos ao carrinho')
      return
    }

    try {
      await createSale.mutateAsync({
        customerId: selectedCustomer?.id || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod: paymentData.method,
        cashReceived: paymentData.cashReceived,
        discountAmount: 0,
      })

      toast.success(`Venda concluída! Total: ${total.toFixed(2)} MT`)
      setCart([])
      setSelectedCustomer(null)
      setSearchQuery('')
      setBarcode('')
      setIsPaymentModalOpen(false)
    } catch (error) {
      console.error('Error creating sale:', error)
    }
  }

  // Buscar por código de barras
  const handleBarcodeSearch = (value: string) => {
    setBarcode(value)
  }

  // Quando produto é encontrado por código de barras
  useEffect(() => {
    if (productByBarcode && barcode && barcode.length >= 3) {
      const existing = cart.find((item) => item.productId === productByBarcode.id)
      if (!existing) {
        addToCart(productByBarcode, 1)
      }
      setBarcode('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productByBarcode])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ponto de Venda</h1>
            <p className="text-gray-600">Busque e adicione produtos ao carrinho</p>
          </div>

          {/* Busca e Seleção de Cliente */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente <span className="text-xs text-gray-500 font-normal">(opcional - pode vender sem cliente)</span>
                  </label>
                  <CustomerSelector
                    selectedCustomer={selectedCustomer}
                    onSelect={setSelectedCustomer}
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produto por nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Input
                    placeholder="Ou escaneie código de barras..."
                    value={barcode}
                    onChange={(e) => handleBarcodeSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtro de Categoria */}
          {!searchQuery && categories && categories.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategoryId === undefined ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategoryId(undefined)}
                  >
                    Todas
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Produtos ou Grid */}
          {searchQuery && products && products.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Resultados da Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.slice(0, 12).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Estoque: {product.stockQuantity}
                      </div>
                      <div className="text-lg font-bold text-blue-600 mt-2">
                        {product.salePrice.toFixed(2)} MT
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !searchQuery && allProducts && categories ? (
            <Card>
              <CardContent className="pt-6">
                <ProductGrid
                  products={allProducts}
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onProductClick={addToCart}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Carrinho */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Itens do Carrinho */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.productName}</div>
                        <div className="text-xs text-gray-500">
                          {item.unitPrice.toFixed(2)} MT x {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-2 text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totais */}
              {cart.length > 0 && (
                <>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{subtotal.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IVA (17%):</span>
                      <span>{tax.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{total.toFixed(2)} MT</span>
                    </div>
                  </div>

                  {/* Botão Finalizar */}
                  <Button
                    className="w-full"
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={cart.length === 0}
                  >
                    Finalizar Venda
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          total={total}
          onConfirm={handlePaymentConfirm}
          isLoading={createSale.isPending}
        />
      </div>
    </MainLayout>
  )
}

