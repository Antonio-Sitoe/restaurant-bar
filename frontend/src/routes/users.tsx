import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  useUsers,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
  useChangePassword,
} from '@/hooks/useUsers'
import { User } from '@/types'
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
import { Plus, Edit, Trash2, User as UserIcon, Key, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional(),
  fullName: z.string().optional(),
  role: z.enum(['admin', 'manager', 'cashier']),
})

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

type UserFormData = z.infer<typeof userSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export const Route = createFileRoute('/users')({
  component: UsersPage,
})

function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: {
  user?: User
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          username: user.username,
          email: user.email,
          fullName: user.fullName || '',
          role: user.role,
        }
      : {
          role: 'cashier',
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Usuário *</label>
          <Input
            {...register('username')}
            disabled={!!user}
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Email *</label>
          <Input
            type="email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Nome Completo</label>
          <Input {...register('fullName')} />
        </div>

        <div>
          <label className="text-sm font-medium">Função *</label>
          <Select {...register('role')}>
            <option value="cashier">Operador</option>
            <option value="manager">Gerente</option>
            <option value="admin">Administrador</option>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
          )}
        </div>

        {!user && (
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Senha *</label>
            <Input
              type="password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

function PasswordForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  userId?: number
  onSubmit: (data: PasswordFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Senha Atual *</label>
        <Input
          type="password"
          {...register('oldPassword')}
          className={errors.oldPassword ? 'border-red-500' : ''}
        />
        {errors.oldPassword && (
          <p className="text-sm text-red-500 mt-1">
            {errors.oldPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Nova Senha *</label>
        <Input
          type="password"
          {...register('newPassword')}
          className={errors.newPassword ? 'border-red-500' : ''}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-500 mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Confirmar Nova Senha *</label>
        <Input
          type="password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Alterando...' : 'Alterar Senha'}
        </Button>
      </div>
    </form>
  )
}

function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null)
  const { data: users, isLoading } = useUsers()
  const deleteUser = useDeleteUser()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const changePassword = useChangePassword()

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await deleteUser.mutateAsync(id)
      toast.success('Usuário excluído com sucesso!')
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(undefined)
    setIsFormOpen(true)
  }

  const handlePasswordChange = (userId: number) => {
    setPasswordUserId(userId)
    setIsPasswordModalOpen(true)
  }

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        const { password, ...updateData } = data
        console.log(password)
        await updateUser.mutateAsync({ id: editingUser.id, data: updateData })
        toast.success('Usuário atualizado com sucesso!')
      } else {
        if (!data.password) {
          toast.error('Senha é obrigatória para novos usuários')
          return
        }
        await createUser.mutateAsync({
          username: data.username,
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          role: data.role,
        })
        toast.success('Usuário criado com sucesso!')
      }
      setIsFormOpen(false)
      setEditingUser(undefined)
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    if (!passwordUserId) return

    try {
      await changePassword.mutateAsync({
        id: passwordUserId,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
      toast.success('Senha alterada com sucesso!')
      setIsPasswordModalOpen(false)
      setPasswordUserId(null)
    } catch (error) {
      console.error('Error changing password:', error)
    }
  }

  const roleLabels: Record<'admin' | 'manager' | 'cashier', string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    cashier: 'Operador',
  }

  const roleColors: Record<
    'admin' | 'manager' | 'cashier',
    'destructive' | 'default' | 'secondary'
  > = {
    admin: 'destructive',
    manager: 'default',
    cashier: 'secondary',
  }

  return (
    <MainLayout>
      <div className="container space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando usuários...</p>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-500" />
                        {user.username}
                      </TableCell>
                      <TableCell>{user.fullName || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? 'success' : 'secondary'}
                        >
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePasswordChange(user.id)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
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

        {/* Modals */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogClose onClose={() => setIsFormOpen(false)} />
            </DialogHeader>
            <UserForm
              user={editingUser}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingUser(undefined)
              }}
              isLoading={createUser.isPending || updateUser.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={isPasswordModalOpen}
          onOpenChange={setIsPasswordModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogClose onClose={() => setIsPasswordModalOpen(false)} />
            </DialogHeader>
            {passwordUserId && (
              <PasswordForm
                userId={passwordUserId}
                onSubmit={handlePasswordSubmit}
                onCancel={() => {
                  setIsPasswordModalOpen(false)
                  setPasswordUserId(null)
                }}
                isLoading={changePassword.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
