import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TitleBar } from './TitleBar'
import { MenuBar } from './MenuBar'
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Home,
  Folder,
  Database,
  Search,
  Bell,
  User,
  Plus,
  ChevronDown,
  Warehouse,
  LogOut,
  UserCircle,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const navSections: NavSection[] = [
    {
      title: 'Principal',
      items: [{ to: '/', label: 'Dashboard', icon: Home }],
    },
    {
      title: 'Inventário',
      items: [
        { to: '/products', label: 'Produtos', icon: Package },
        { to: '/categories', label: 'Categorias', icon: Folder },
      ],
    },
    {
      title: 'Stock',
      items: [{ to: '/stock', label: 'Gerir Stock', icon: Warehouse }],
    },
    {
      title: 'Vendas',
      items: [
        { to: '/pos', label: 'POS', icon: ShoppingCart },
        { to: '/sales', label: 'Vendas', icon: BarChart3 },
      ],
    },
    {
      title: 'Pessoas',
      items: [
        { to: '/customers', label: 'Clientes', icon: UserCircle },
        { to: '/users', label: 'Usuários', icon: Users },
      ],
    },
    {
      title: 'Relatórios',
      items: [{ to: '/reports', label: 'Relatórios', icon: TrendingUp }],
    },
    {
      title: 'Sistema',
      items: [
        { to: '/system', label: 'Sistema', icon: Database },
        { to: '/settings', label: 'Configurações', icon: Settings },
      ],
    },
  ]

  const isActive = (path: string) => {
    const currentPath = location.pathname
    if (path === '/') {
      return currentPath === '/'
    }
    // Para rotas que compartilham o mesmo path, ambos ficam ativos quando na rota
    return currentPath.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Title Bar (Electron) */}
      <TitleBar />

      {/* Menu Bar */}
      <MenuBar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="p-4">
            {navSections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className={sectionIndex > 0 ? 'mt-6' : ''}
              >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.to)
                    return (
                      <Link
                        key={`${item.to}-${item.label}`}
                        to={item.to}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          active
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${active ? 'text-purple-600' : 'text-gray-500'}`}
                        />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gray-800 h-16 flex items-center justify-between px-6 border-b border-gray-700 shadow-sm">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">LUNA</span>
                <span className="text-xl font-bold text-purple-400">POS</span>
              </div>

              {/* Search Bar */}
              <div className="relative ml-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate({ to: '/pos' })}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo
              </Button>

              <Button
                onClick={() => navigate({ to: '/pos' })}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                POS
              </Button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate({ to: '/settings' })}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {user?.fullName || user?.username}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </div>
  )
}
