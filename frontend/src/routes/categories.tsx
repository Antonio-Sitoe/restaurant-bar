import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  useCategories,
  useDeleteCategory,
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/useCategories'
import { Category } from '@/types'
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
import { Plus, Search, Edit, Trash2, Folder, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().or(z.literal('')),
  displayOrder: z.coerce.number().min(0).default(0),
})

type CategoryFormData = z.infer<typeof categorySchema>

export const Route = createFileRoute('/categories')({
  component: CategoriesPage,
})

function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: {
  category?: Category
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || '',
          displayOrder: category.displayOrder,
        }
      : {
          displayOrder: 0,
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome da Categoria *</label>
          <Input
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Descrição</label>
          <Input
            {...register('description')}
            placeholder="Descrição opcional"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ordem de Exibição</label>
          <Input
            type="number"
            {...register('displayOrder', { valueAsNumber: true })}
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Números menores aparecem primeiro na lista
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const { data: categories, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  // Filtrar categorias por busca
  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      await deleteCategory.mutateAsync(id)
      toast.success('Categoria excluída com sucesso!')
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingCategory(undefined)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data })
        toast.success('Categoria atualizada com sucesso!')
      } else {
        await createCategory.mutateAsync(data)
        toast.success('Categoria criada com sucesso!')
      }
      setIsFormOpen(false)
      setEditingCategory(undefined)
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  return (
    <MainLayout>
      <div className="container space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="text-gray-600 mt-1">
              Gerencie as categorias de produtos
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando categorias...</p>
              </div>
            ) : !filteredCategories || filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Nenhuma categoria encontrada'
                    : 'Nenhuma categoria cadastrada'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories
                    .sort(
                      (a: Category, b: Category) =>
                        a.displayOrder - b.displayOrder
                    )
                    .map((category: Category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-purple-500" />
                          {category.name}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {category.displayOrder}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              category.isActive ? 'success' : 'secondary'
                            }
                          >
                            {category.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Formulário */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogClose onClose={() => setIsFormOpen(false)} />
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingCategory(undefined)
              }}
              isLoading={createCategory.isPending || updateCategory.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
