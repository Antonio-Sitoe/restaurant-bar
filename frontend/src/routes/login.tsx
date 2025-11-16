import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import apiService from '@/services/api.service'
import { AuthResponse } from '@/types'
import toast from 'react-hot-toast'
import { Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.post<AuthResponse>(
        '/api/auth/login',
        data
      )

      // Salvar token e usuário
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      toast.success('Login realizado com sucesso!')
      navigate({ to: '/' })
    } catch (error) {
      // Erro já tratado no interceptor
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar - Purple */}
      <div className="w-1/3 bg-purple-600 flex items-center justify-center">
        <h1 className="text-white text-7xl font-bold uppercase tracking-wider">
          POS
        </h1>
      </div>

      {/* Right Content - White */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-gray-800 mb-2">Olá</h2>
            <p className="text-xl text-gray-600">
              Bem-vindo ao <span className="font-bold">LUNA POS</span>
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Endereço de Email"
                  {...register('username')}
                  className={`pl-10 h-12 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 ml-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  {...register('password')}
                  className={`pl-10 h-12 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implementar funcionalidade de recuperação de senha
                }}
              >
                Esqueceu a Senha?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
