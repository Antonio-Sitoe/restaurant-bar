import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { isAuthenticated } from '../utils/auth'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const navigate = useNavigate()
  const pathname = window.location.pathname
  const hasCheckedAuth = useRef(false)

  useEffect(() => {
    // Evita múltiplas verificações
    if (hasCheckedAuth.current) return

    // Proteger rotas (exceto login)
    if (pathname !== '/login' && !isAuthenticated()) {
      hasCheckedAuth.current = true
      navigate({ to: '/login' })
    } else if (pathname === '/login' && isAuthenticated()) {
      // Se já está autenticado e está na página de login, redireciona para home
      hasCheckedAuth.current = true
      navigate({ to: '/' })
    } else {
      hasCheckedAuth.current = true
    }
  }, [pathname, navigate])

  return <Outlet />
}
