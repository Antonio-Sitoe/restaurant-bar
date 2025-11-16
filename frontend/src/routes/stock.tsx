import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useProducts } from '@/hooks/useProducts'
import {
  useStockHistory,
  useAddStockMovement,
  useAdjustStock,
} from '@/hooks/useStock'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import {
  AlertTriangle,
  Plus,
  TrendingUp,
  TrendingDown,
  Edit,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const movementSchema = z.object({
  productId: z.number().min(1, 'Produto é obrigatório'),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  notes: z.string().optional(),
})

const adjustSchema = z.object({
  productId: z.number().min(1, 'Produto é obrigatório'),
  newQuantity: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
  reason: z.string().min(1, 'Justificativa é obrigatória'),
})

type MovementFormData = z.infer<typeof movementSchema>
type AdjustFormData = z.infer<typeof adjustSchema>

export const Route = createFileRoute('/stock')({
  component: StockPage,
})

function StockPage() {
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const { data: products } = useProducts()
  const { data: history } = useStockHistory({ limit: 50 })
  const addMovement = useAddStockMovement()
  const adjustStock = useAdjustStock()

  const lowStock = products?.filter((p) => p.stockQuantity <= p.minStock) || []

  const MovementForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<MovementFormData>({
      resolver: zodResolver(movementSchema),
    })

    const onSubmit = async (data: MovementFormData) => {
      try {
        await addMovement.mutateAsync(data)
        toast.success('Movimentação registrada com sucesso!')
        reset()
        setIsMovementModalOpen(false)
      } catch (error) {
        console.error('Error adding movement:', error)
      }
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Produto *</label>
          <Select {...register('productId', { valueAsNumber: true })}>
            <option value="">Selecione um produto</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Estoque: {p.stockQuantity})
              </option>
            ))}
          </Select>
          {errors.productId && (
            <p className="text-sm text-red-500 mt-1">
              {errors.productId.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Tipo de Movimentação *</label>
          <Select {...register('type')}>
            <option value="">Selecione o tipo</option>
            <option value="in">Entrada</option>
            <option value="out">Saída</option>
            <option value="adjustment">Ajuste</option>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Quantidade *</label>
          <Input
            type="number"
            step="0.01"
            {...register('quantity', { valueAsNumber: true })}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500 mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Observações</label>
          <Input {...register('notes')} placeholder="Observações opcionais" />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsMovementModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={addMovement.isPending}>
            {addMovement.isPending ? 'Salvando...' : 'Registrar'}
          </Button>
        </div>
      </form>
    )
  }

  const AdjustForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<AdjustFormData>({
      resolver: zodResolver(adjustSchema),
    })

    const onSubmit = async (data: AdjustFormData) => {
      try {
        await adjustStock.mutateAsync(data)
        toast.success('Ajuste de stock realizado com sucesso!')
        reset()
        setIsAdjustModalOpen(false)
      } catch (error) {
        console.error('Error adjusting stock:', error)
      }
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Produto *</label>
          <Select {...register('productId', { valueAsNumber: true })}>
            <option value="">Selecione um produto</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Atual: {p.stockQuantity})
              </option>
            ))}
          </Select>
          {errors.productId && (
            <p className="text-sm text-red-500 mt-1">
              {errors.productId.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Nova Quantidade *</label>
          <Input
            type="number"
            step="0.01"
            {...register('newQuantity', { valueAsNumber: true })}
          />
          {errors.newQuantity && (
            <p className="text-sm text-red-500 mt-1">
              {errors.newQuantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Justificativa *</label>
          <Input {...register('reason')} placeholder="Motivo do ajuste" />
          {errors.reason && (
            <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdjustModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={adjustStock.isPending}>
            {adjustStock.isPending ? 'Salvando...' : 'Ajustar'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestão de Stock
            </h1>
            <p className="text-gray-600 mt-1">
              Controle de estoque e movimentações
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAdjustModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Ajuste Manual
            </Button>
            <Button onClick={() => setIsMovementModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
          </div>
        </div>

        {/* Alertas de Stock Baixo */}
        {lowStock.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Produtos com Stock Baixo ({lowStock.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 bg-white rounded border border-red-200"
                  >
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">
                      Estoque: {product.stockQuantity} | Mínimo:{' '}
                      {product.minStock}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Movimentações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Estoque Anterior</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((movement) => {
                    const typeLabels = {
                      in: {
                        label: 'Entrada',
                        icon: TrendingUp,
                        variant: 'success' as const,
                      },
                      out: {
                        label: 'Saída',
                        icon: TrendingDown,
                        variant: 'destructive' as const,
                      },
                      adjustment: {
                        label: 'Ajuste',
                        icon: Edit,
                        variant: 'secondary' as const,
                      },
                    }
                    const typeInfo = typeLabels[movement.type]

                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">
                          {new Date(movement.createdAt).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          {movement.product?.name || 'Produto removido'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeInfo.variant}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.quantity}
                        </TableCell>
                        <TableCell>{movement.previousQuantity}</TableCell>
                        <TableCell className="font-semibold">
                          {movement.newQuantity}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {movement.notes || '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma movimentação registrada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <Dialog
          open={isMovementModalOpen}
          onOpenChange={setIsMovementModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
              <DialogClose onClose={() => setIsMovementModalOpen(false)} />
            </DialogHeader>
            <MovementForm />
          </DialogContent>
        </Dialog>

        <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajuste Manual de Stock</DialogTitle>
              <DialogClose onClose={() => setIsAdjustModalOpen(false)} />
            </DialogHeader>
            <AdjustForm />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
