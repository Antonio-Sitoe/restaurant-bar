'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

const MENUITEMS = [
  { label: 'Principal', href: '/' },
  { label: 'Novidades', href: '/news' },
  { label: 'Em Alta', href: '/on-the-rise' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleShow = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <nav
      className={cn(
        'w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50',
        'shadow-sm'
      )}
    >
      <div
        className={cn(
          'px-16 py-4 container mx-auto w-full flex items-center justify-between'
        )}
      >
        <Link
          href="/"
          className={cn('text-2xl font-extrabold', 'text-purple-800')}
        >
          Gifts
        </Link>

        <div
          className={cn(
            'hidden md:flex items-center gap-8',
            'flex-1 justify-end',
            'mr-4'
          )}
        >
          {MENUITEMS.map((item, id) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={id.toString()}
                href={item.href}
                className={cn(
                  'text-sm font-medium',
                  'relative pb-1',
                  'transition-all duration-300',
                  'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-purple-600',
                  'after:transition-all after:duration-300',
                  isActive
                    ? 'text-purple-600 after:w-full'
                    : 'text-gray-600 hover:text-gray-600 after:w-0 hover:after:w-full'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className={cn('hidden md:flex items-center gap-6', 'ml-auto')}>
          <Link href="/become-a-seller" passHref>
            <Button
              className={cn(
                'bg-purple-800 hover:bg-purple-700',
                'text-white font-medium rounded-full',
                'px-6 py-2',
                'transition-all duration-300',
                'hover:shadow-lg hover:scale-105',
                'active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2'
              )}
            >
              Torna-te um Vendedor
            </Button>
          </Link>
          <Link
            href="/sign-in"
            className={cn(
              'text-sm font-extrabold',
              'text-primary',
              'relative pb-1',
              'transition-all duration-300',
              'hover:text-gray-600',
              'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-purple-600',
              'after:transition-all after:duration-300',
              'hover:after:w-full'
            )}
          >
            Entrar
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleShow}
          className={cn(
            'md:hidden',
            'p-2',
            'text-gray-900',
            'hover:text-purple-600',
            'transition-colors duration-300',
            'focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-md',
            'relative w-10 h-10'
          )}
          aria-label="Toggle menu"
        >
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'transition-all duration-300 ease-in-out',
              isOpen
                ? 'opacity-0 rotate-90 scale-75'
                : 'opacity-100 rotate-0 scale-100'
            )}
          >
            <Menu size={24} />
          </span>
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'transition-all duration-300 ease-in-out',
              isOpen
                ? 'opacity-100 rotate-0 scale-100'
                : 'opacity-0 -rotate-90 scale-75'
            )}
          >
            <X size={24} />
          </span>
        </button>

        {isOpen && (
          <button
            type="button"
            className={cn(
              'absolute top-full left-0 right-0 h-screen',
              'bg-black/20',
              'border-b border-gray-200',
              'md:hidden',
              'flex flex-col',
              'animate-in fade-in slide-in-from-top-2 duration-200'
            )}
            onClick={toggleShow}
          >
            <div className="bg-white shadow-lg">
              <div className="px-4 py-4 flex flex-col gap-3">
                {MENUITEMS.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'text-sm font-medium py-2 px-3 rounded-md',
                        'transition-all duration-300',
                        'relative',
                        'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-purple-600',
                        'after:transition-all after:duration-300',
                        isActive
                          ? 'text-purple-600 bg-purple-50 after:w-full'
                          : 'text-gray-600 hover:bg-purple-50 hover:text-gray-600 after:w-0'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="border-t border-gray-200 px-4 py-3 flex flex-col gap-2 shadow-lg">
                <Button
                  className={cn(
                    'w-full',
                    'bg-purple-600 hover:bg-purple-700',
                    'text-white font-medium rounded-full',
                    'px-4 py-2',
                    'transition-all duration-300',
                    'hover:shadow-lg',
                    'active:scale-95'
                  )}
                >
                  Torna-te um Vendedor
                </Button>
                <Link
                  href="/entrar"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-center',
                    'text-sm font-medium py-2',
                    'text-gray-600',
                    'transition-all duration-300',
                    'hover:text-gray-600 hover:bg-purple-50',
                    'rounded-md'
                  )}
                >
                  Entrar
                </Link>
              </div>
            </div>
          </button>
        )}
      </div>
    </nav>
  )
}
