import { Product, Category } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'

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
    <div className="space-y-6">
      {Object.values(groupedByCategory).map(({ category, products: categoryProducts }) => (
        <div key={category.id}>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">{category.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {categoryProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onProductClick(product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-center mb-2">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-center mb-1 line-clamp-2">{product.name}</p>
                  <p className="text-xs font-bold text-blue-600 text-center">{product.salePrice.toFixed(2)} MT</p>
                  {product.stockQuantity <= product.minStock && (
                    <Badge variant="destructive" className="text-xs mt-1 w-full justify-center">
                      Stock Baixo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {uncategorizedProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Sem Categoria</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {uncategorizedProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onProductClick(product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-center mb-2">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-center mb-1 line-clamp-2">{product.name}</p>
                  <p className="text-xs font-bold text-blue-600 text-center">{product.salePrice.toFixed(2)} MT</p>
                  {product.stockQuantity <= product.minStock && (
                    <Badge variant="destructive" className="text-xs mt-1 w-full justify-center">
                      Stock Baixo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  )
}

