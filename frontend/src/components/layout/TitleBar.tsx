import { useEffect, useState } from 'react'
import { Minus, Square, X, Maximize2 } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Verificar se está em ambiente Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Verificar estado inicial
      window.electronAPI.isMaximized().then(setIsMaximized)

      // Escutar mudanças de estado
      window.electronAPI.onWindowMaximized(setIsMaximized)
    }
  }, [])

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow()
    }
  }

  const handleMaximize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.maximizeWindow()
      const maximized = await window.electronAPI.isMaximized()
      setIsMaximized(maximized)
    }
  }

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow()
    }
  }

  // Só renderizar se estiver em ambiente Electron
  if (typeof window === 'undefined' || !window.electronAPI) {
    return null
  }

  return (
    <div
      className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-2 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 px-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sistema POS
        </span>
      </div>

      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="w-10 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Minimizar"
        >
          <Minus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={handleMaximize}
          className="w-10 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? (
            <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          ) : (
            <Square className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        <button
          onClick={handleClose}
          className="w-10 h-8 flex items-center justify-center hover:bg-red-500 transition-colors group"
          aria-label="Fechar"
        >
          <X className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  )
}

