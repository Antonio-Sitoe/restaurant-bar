import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { TitleBar } from './TitleBar'
import { MenuBar } from './MenuBar'
import { ShoppingCart, Package, Users, BarChart3, Settings, LogOut, Home, Folder, Database } from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const navItems = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/pos', label: 'POS', icon: ShoppingCart },
    { to: '/products', label: 'Produtos', icon: Package },
    { to: '/categories', label: 'Categorias', icon: Folder },
    { to: '/stock', label: 'Stock', icon: Package },
    { to: '/customers', label: 'Clientes', icon: Users },
    { to: '/sales', label: 'Vendas', icon: BarChart3 },
    { to: '/reports', label: 'Relatórios', icon: BarChart3 },
    { to: '/users', label: 'Usuários', icon: Users },
    { to: '/system', label: 'Sistema', icon: Database },
    { to: '/settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Title Bar (Electron) */}
      <TitleBar />
      
      {/* Menu Bar */}
      <MenuBar />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Sistema POS</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.fullName || user?.username}
              </span>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  activeProps={{
                    className: 'bg-blue-50 text-blue-700',
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

