import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  FileText,
  HelpCircle,
  Save,
  FolderOpen,
  Printer,
  Settings,
  Search,
  Copy,
  Scissors,
  Clipboard,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react'

interface MenuItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  action?: () => void
  shortcut?: string
  divider?: boolean
}

interface Menu {
  label: string
  items: MenuItem[]
}

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fechar menu ao pressionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N - Nova Venda
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        navigate({ to: '/pos' })
      }
      // Ctrl+S - Salvar (prevenir comportamento padrão)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        // Implementar lógica de salvar se necessário
      }
      // Ctrl+P - Imprimir
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        window.print()
      }
      // F5 - Atualizar
      if (e.key === 'F5') {
        e.preventDefault()
        window.location.reload()
      }
      // Ctrl+, - Configurações
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault()
        navigate({ to: '/settings' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const menus: Menu[] = [
    {
      label: 'Arquivo',
      items: [
        {
          label: 'Nova Venda',
          icon: FileText,
          action: () => {
            navigate({ to: '/pos' })
          },
          shortcut: 'Ctrl+N',
        },
        {
          label: 'Abrir...',
          icon: FolderOpen,
          action: () => {
            console.log('Abrir')
          },
          shortcut: 'Ctrl+O',
        },
        { divider: true },
        {
          label: 'Salvar',
          icon: Save,
          action: () => {
            console.log('Salvar')
          },
          shortcut: 'Ctrl+S',
        },
        {
          label: 'Imprimir',
          icon: Printer,
          action: () => {
            console.log('Imprimir')
          },
          shortcut: 'Ctrl+P',
        },
        { divider: true },
        {
          label: 'Configurações',
          icon: Settings,
          action: () => {
            navigate({ to: '/settings' })
          },
          shortcut: 'Ctrl+,',
        },
      ],
    },
    {
      label: 'Editar',
      items: [
        {
          label: 'Desfazer',
          action: () => {
            console.log('Desfazer')
          },
          shortcut: 'Ctrl+Z',
        },
        {
          label: 'Refazer',
          action: () => {
            console.log('Refazer')
          },
          shortcut: 'Ctrl+Y',
        },
        { divider: true },
        {
          label: 'Cortar',
          icon: Scissors,
          action: () => {
            document.execCommand('cut')
          },
          shortcut: 'Ctrl+X',
        },
        {
          label: 'Copiar',
          icon: Copy,
          action: () => {
            document.execCommand('copy')
          },
          shortcut: 'Ctrl+C',
        },
        {
          label: 'Colar',
          icon: Clipboard,
          action: () => {
            document.execCommand('paste')
          },
          shortcut: 'Ctrl+V',
        },
        { divider: true },
        {
          label: 'Buscar',
          icon: Search,
          action: () => {
            console.log('Buscar')
          },
          shortcut: 'Ctrl+F',
        },
      ],
    },
    {
      label: 'Visualizar',
      items: [
        {
          label: 'Atualizar',
          icon: RefreshCw,
          action: () => {
            window.location.reload()
          },
          shortcut: 'F5',
        },
        { divider: true },
        {
          label: 'Zoom In',
          icon: ZoomIn,
          action: () => {
            console.log('Zoom In')
          },
          shortcut: 'Ctrl++',
        },
        {
          label: 'Zoom Out',
          icon: ZoomOut,
          action: () => {
            console.log('Zoom Out')
          },
          shortcut: 'Ctrl+-',
        },
        {
          label: 'Resetar Zoom',
          action: () => {
            console.log('Resetar Zoom')
          },
          shortcut: 'Ctrl+0',
        },
      ],
    },
    {
      label: 'Ajuda',
      items: [
        {
          label: 'Sobre',
          icon: HelpCircle,
          action: () => {
            alert('Sistema POS v1.0.0\nDesenvolvido para gestão de restaurante')
          },
        },
        {
          label: 'Atalhos de Teclado',
          action: () => {
            alert(
              'Atalhos disponíveis:\n\nCtrl+N - Nova Venda\nCtrl+S - Salvar\nCtrl+P - Imprimir\nF5 - Atualizar'
            )
          },
        },
      ],
    },
  ]

  const handleMenuClick = (menuLabel: string) => {
    setActiveMenu(activeMenu === menuLabel ? null : menuLabel)
  }

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action()
    }
    setActiveMenu(null)
  }

  // Fechar menu ao clicar fora
  const handleClickOutside = () => {
    setActiveMenu(null)
  }

  return (
    <div className="h-7 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 select-none">
      {menus.map((menu) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => handleMenuClick(menu.label)}
            className={`px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              activeMenu === menu.label ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            {menu.label}
          </button>

          {activeMenu === menu.label && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={handleClickOutside}
              />
              <div className="absolute top-full left-0 mt-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm shadow-xl z-20 min-w-[220px] py-1">
                {menu.items.map((item, index) => {
                  if (item.divider) {
                    return (
                      <div
                        key={`divider-${index}`}
                        className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-1"
                      />
                    )
                  }

                  const Icon = item.icon

                  return (
                    <button
                      key={item.label}
                      onClick={() => handleMenuItemClick(item)}
                      className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      {Icon ? (
                        <Icon className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <span className="w-4" />
                      )}
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
