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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >()

  const { data: products } = useProducts({ query: searchQuery || undefined })
  const { data: allProducts } = useProducts()
  const { data: categories } = useCategories()
  const { data: productByBarcode } = useProductByBarcode(barcode)
  const createSale = useCreateSale()

  // Criar um mapa de produtos para acesso rápido
  const productsMap = new Map((allProducts?.data || []).map((p) => [p.id, p]))

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
  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )
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
      // Preparar items apenas com os campos que o validador aceita
      const itemsToSend = cart.map((item) => {
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: 0,
          discountAmount: 0,
        }
      })

      await createSale.mutateAsync({
        customerId: selectedCustomer?.id || undefined,
        items: itemsToSend,
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
      toast.error('Erro ao processar venda. Tente novamente.')
    }
  }

  // Buscar por código de barras
  const handleBarcodeSearch = (value: string) => {
    setBarcode(value)
  }

  // Quando produto é encontrado por código de barras
  useEffect(() => {
    if (productByBarcode && barcode && barcode.length >= 3) {
      const existing = cart.find(
        (item) => item.productId === productByBarcode.id
      )
      if (!existing) {
        addToCart(productByBarcode, 1)
      }
      setBarcode('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productByBarcode])

  return (
    <MainLayout>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        {/* Área de Produtos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">
              🛒 Ponto de Venda
            </h1>
            <p className="text-blue-100">
              Selecione produtos e finalize a venda rapidamente
            </p>
          </div>

          {/* Busca e Seleção de Cliente */}
          <Card className="shadow-md border-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-blue-500" />
                    Cliente{' '}
                    <span className="text-xs text-gray-500 font-normal">
                      (opcional)
                    </span>
                  </label>
                  <CustomerSelector
                    selectedCustomer={selectedCustomer}
                    onSelect={setSelectedCustomer}
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="🔍 Buscar produto por nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-2 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Input
                    placeholder="📷 Ou escaneie código de barras..."
                    value={barcode}
                    onChange={(e) => handleBarcodeSearch(e.target.value)}
                    className="h-12 text-base border-2 focus:border-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtro de Categoria */}
          {!searchQuery && categories && categories.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-md border-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                📂 Categorias
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    selectedCategoryId === undefined ? 'default' : 'outline'
                  }
                  size="lg"
                  onClick={() => setSelectedCategoryId(undefined)}
                  className={
                    selectedCategoryId === undefined
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : ''
                  }
                >
                  🏷️ Todas
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategoryId === category.id
                        ? 'default'
                        : 'outline'
                    }
                    size="lg"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={
                      selectedCategoryId === category.id
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'hover:bg-purple-50'
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Produtos ou Grid */}
          {searchQuery && products && products.length > 0 ? (
            <Card className="shadow-md border-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-xl font-bold text-gray-800">
                  🔍 Resultados da Busca ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.slice(0, 12).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="group p-4 border-2 rounded-xl hover:border-blue-400 hover:shadow-lg text-left transition-all duration-200 hover:scale-105 relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-blue-500 rounded-full p-1.5">
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="font-semibold text-sm mb-2 line-clamp-2">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                        <span>Estoque:</span>
                        <span className={`font-semibold ${
                          product.stockQuantity <= product.minStock
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {product.stockQuantity}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-emerald-600 mt-2 pt-2 border-t">
                        {product.salePrice.toFixed(2)} MT
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !searchQuery && allProducts && categories ? (
            <div className="bg-white rounded-xl p-6 shadow-md border-2">
              <ProductGrid
                products={allProducts}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onProductClick={addToCart}
              />
            </div>
          ) : null}
        </div>

        {/* Carrinho */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-xl border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-xl">Carrinho</span>
                </div>
                <div className="bg-white text-purple-600 rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
                  {cart.length}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Itens do Carrinho */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-medium">
                      Carrinho vazio
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Adicione produtos para começar
                    </p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const product = productsMap.get(item.productId)
                    return (
                      <div
                        key={item.productId}
                        className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-2 border-purple-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1 text-gray-800">
                              {item.productName}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <span className="font-medium">
                                {item.unitPrice.toFixed(2)} MT
                              </span>
                              <span className="text-gray-400">×</span>
                              <span className="font-bold text-purple-600">
                                {item.quantity}
                              </span>
                            </div>
                            {product && (
                              <div className="text-xs text-gray-500 mt-1">
                                Disponível: {product.stockQuantity}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-white border-2 border-purple-300 rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-3 text-base font-bold text-purple-700 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-lg font-bold text-emerald-600">
                            {(item.unitPrice * item.quantity).toFixed(2)} MT
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Totais */}
              {cart.length > 0 && (
                <>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 space-y-3 border-2">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-800">
                        {subtotal.toFixed(2)} MT
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">IVA (17%):</span>
                      <span className="font-semibold text-gray-800">
                        {tax.toFixed(2)} MT
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-2xl border-t-2 pt-3">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-emerald-600">
                        {total.toFixed(2)} MT
                      </span>
                    </div>
                  </div>

                  {/* Botão Finalizar */}
                  <Button
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={cart.length === 0}
                  >
                    💳 Finalizar Venda
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
