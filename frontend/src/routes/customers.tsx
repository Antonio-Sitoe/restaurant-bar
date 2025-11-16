import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  useCustomers,
  useDeleteCustomer,
  useCreateCustomer,
  useUpdateCustomer,
} from '@/hooks/useCustomers'
import { useCustomerHistory } from '@/hooks/useCustomerHistory'
import { Customer } from '@/types'
import { CustomerHistory } from '@/components/reports/CustomerHistory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Plus, Search, Edit, Trash2, User, ShoppingBag, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  nuit: z.string().optional(),
  address: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
})

function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}: {
  customer?: Customer
  onSubmit: (data: CustomerFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone || '',
          nuit: customer.nuit || '',
          address: customer.address || '',
        }
      : {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome *</label>
          <Input {...register('name')} className={errors.name ? 'border-red-500' : ''} />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Telefone</label>
            <Input {...register('phone')} placeholder="+258 XX XXX XXXX" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">NUIT</label>
            <Input {...register('nuit')} placeholder="Número de identificação fiscal" />
          </div>

          <div>
            <label className="text-sm font-medium">Endereço</label>
            <Input {...register('address')} placeholder="Endereço completo" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : customer ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const { data: customers, isLoading } = useCustomers({ query: searchQuery })
  const { data: customerSales } = useCustomerHistory(viewingCustomer?.id || 0)
  const deleteCustomer = useDeleteCustomer()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      await deleteCustomer.mutateAsync(id)
      toast.success('Cliente excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingCustomer(undefined)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      const submitData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        nuit: data.nuit || undefined,
        address: data.address || undefined,
      }

      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, data: submitData })
        toast.success('Cliente atualizado com sucesso!')
      } else {
        await createCustomer.mutateAsync(submitData)
        toast.success('Cliente criado com sucesso!')
      }
      setIsFormOpen(false)
      setEditingCustomer(undefined)
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gerencie seus clientes</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando clientes...</p>
              </div>
            ) : !customers || customers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>NUIT</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.email && <div>{customer.email}</div>}
                          {customer.phone && <div className="text-gray-500">{customer.phone}</div>}
                          {!customer.email && !customer.phone && <span className="text-gray-400">-</span>}
                        </div>
                      </TableCell>
                      <TableCell>{customer.nuit || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          {customer.totalOrders}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {customer.totalPurchases.toFixed(2)} MT
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingCustomer(customer)}
                            title="Ver histórico"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(customer.id)}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              <DialogClose onClose={() => setIsFormOpen(false)} />
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingCustomer(undefined)
              }}
              isLoading={createCustomer.isPending || updateCustomer.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog de Histórico */}
        {viewingCustomer && (
          <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Histórico de Compras - {viewingCustomer.name}</DialogTitle>
                <DialogClose onClose={() => setViewingCustomer(null)} />
              </DialogHeader>
              <CustomerHistory customer={viewingCustomer} sales={customerSales || []} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  )
}
