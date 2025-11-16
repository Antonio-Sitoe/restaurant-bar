import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Product, Category } from '@/types'
import { useCategories } from '@/hooks/useCategories'

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.number().optional(),
  salePrice: z.number().min(0, 'Preço de venda deve ser maior ou igual a 0'),
  costPrice: z.number().min(0, 'Preço de custo deve ser maior ou igual a 0'),
  stockQuantity: z.number().min(0, 'Estoque deve ser maior ou igual a 0'),
  minStock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
  trackStock: z.coerce.boolean(),
  allowNegativeStock: z.coerce.boolean(),
})

type ProductFormData = {
  name: string
  barcode?: string
  sku?: string
  categoryId?: number
  salePrice: number
  costPrice: number
  stockQuantity: number
  minStock: number
  trackStock: boolean
  allowNegativeStock: boolean
}

interface ProductFormProps {
  product?: Product
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isLoading,
}: ProductFormProps) {
  const { data: categories } = useCategories()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          barcode: product.barcode || '',
          sku: product.sku || '',
          categoryId: product.categoryId,
          salePrice: product.salePrice,
          costPrice: product.costPrice,
          stockQuantity: product.stockQuantity,
          minStock: product.minStock,
          trackStock: product.trackStock ?? true,
          allowNegativeStock: product.allowNegativeStock ?? false,
        }
      : {
          name: '',
          barcode: '',
          sku: '',
          salePrice: 0,
          costPrice: 0,
          stockQuantity: 0,
          minStock: 0,
          trackStock: true,
          allowNegativeStock: false,
        },
  })

  const salePrice = watch('salePrice') || 0
  const costPrice = watch('costPrice') || 0
  const profitMargin =
    salePrice > 0 ? ((salePrice - costPrice) / salePrice) * 100 : 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Nome do Produto *</label>
          <Input
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Código de Barras</label>
          <Input {...register('barcode')} />
        </div>

        <div>
          <label className="text-sm font-medium">SKU</label>
          <Input {...register('sku')} />
        </div>

        <div>
          <label className="text-sm font-medium">Categoria</label>
          <Select {...register('categoryId', { valueAsNumber: true })}>
            <option value="">Selecione uma categoria</option>
            {categories?.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Preço de Venda (MT) *</label>
          <Input
            type="number"
            step="0.01"
            {...register('salePrice', { valueAsNumber: true })}
            className={errors.salePrice ? 'border-red-500' : ''}
          />
          {errors.salePrice && (
            <p className="text-sm text-red-500 mt-1">
              {errors.salePrice.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Preço de Custo (MT) *</label>
          <Input
            type="number"
            step="0.01"
            {...register('costPrice', { valueAsNumber: true })}
            className={errors.costPrice ? 'border-red-500' : ''}
          />
          {errors.costPrice && (
            <p className="text-sm text-red-500 mt-1">
              {errors.costPrice.message}
            </p>
          )}
          {profitMargin > 0 && (
            <p className="text-sm text-green-600 mt-1">
              Margem de lucro: {profitMargin.toFixed(2)}%
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Estoque Atual *</label>
          <Input
            type="number"
            {...register('stockQuantity', { valueAsNumber: true })}
            className={errors.stockQuantity ? 'border-red-500' : ''}
          />
          {errors.stockQuantity && (
            <p className="text-sm text-red-500 mt-1">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Estoque Mínimo *</label>
          <Input
            type="number"
            {...register('minStock', { valueAsNumber: true })}
            className={errors.minStock ? 'border-red-500' : ''}
          />
          {errors.minStock && (
            <p className="text-sm text-red-500 mt-1">
              {errors.minStock.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('trackStock')} />
            <span className="text-sm font-medium">Controlar estoque</span>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('allowNegativeStock')} />
            <span className="text-sm font-medium">
              Permitir estoque negativo
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}
