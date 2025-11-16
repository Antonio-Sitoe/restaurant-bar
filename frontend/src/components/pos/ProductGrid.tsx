import { Product, Category } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  categories: Category[]
  selectedCategoryId?: number
  onProductClick: (product: Product) => void
}

export function ProductGrid({ products, categories, selectedCategoryId, onProductClick }: ProductGridProps) {
  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.categoryId === selectedCategoryId)
    : products

  const groupedByCategory = categories.reduce((acc, category) => {
    const categoryProducts = filteredProducts.filter((p) => p.categoryId === category.id)
    if (categoryProducts.length > 0) {
      acc[category.id] = { category, products: categoryProducts }
    }
    return acc
  }, {} as Record<number, { category: Category; products: Product[] }>)

  const uncategorizedProducts = filteredProducts.filter((p) => !p.categoryId)

  return (
    <div className="space-y-8">
      {Object.values(groupedByCategory).map(({ category, products: categoryProducts }) => (
        <div key={category.id}>
          <h3 className="text-xl font-bold mb-4 text-gray-800">{category.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categoryProducts.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-blue-400 relative overflow-hidden"
                onClick={() => onProductClick(product)}
              >
                <CardContent className="p-4">
                  {/* Plus button overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg">
                      <Plus className="h-4 w-4 text-white" />
                    </Button>
                  </div>

                  {/* Product image */}
                  <div className="flex items-center justify-center mb-3 aspect-square">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover rounded-lg" 
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </p>
                    
                    {/* Stock info */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Estoque:</span>
                      <span className={`font-semibold ${
                        product.stockQuantity <= product.minStock 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {product.stockQuantity} {product.unit || 'un'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t">
                      <p className="text-xl font-bold text-emerald-600 text-center">
                        {product.salePrice.toFixed(2)} MT
                      </p>
                    </div>

                    {/* Low stock badge */}
                    {product.stockQuantity <= product.minStock && (
                      <Badge variant="destructive" className="text-xs w-full justify-center py-1">
                        Stock Baixo!
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {uncategorizedProducts.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Sem Categoria</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {uncategorizedProducts.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 border-2 hover:border-blue-400 relative overflow-hidden"
                onClick={() => onProductClick(product)}
              >
                <CardContent className="p-4">
                  {/* Plus button overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg">
                      <Plus className="h-4 w-4 text-white" />
                    </Button>
                  </div>

                  {/* Product image */}
                  <div className="flex items-center justify-center mb-3 aspect-square">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover rounded-lg" 
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </p>
                    
                    {/* Stock info */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Estoque:</span>
                      <span className={`font-semibold ${
                        product.stockQuantity <= product.minStock 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {product.stockQuantity} {product.unit || 'un'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t">
                      <p className="text-xl font-bold text-emerald-600 text-center">
                        {product.salePrice.toFixed(2)} MT
                      </p>
                    </div>

                    {/* Low stock badge */}
                    {product.stockQuantity <= product.minStock && (
                      <Badge variant="destructive" className="text-xs w-full justify-center py-1">
                        Stock Baixo!
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm">Selecione outra categoria ou ajuste sua busca</p>
        </div>
      )}
    </div>
  )
}

