import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

interface IconCardRootProps {
  href: string
  children: React.ReactNode
  className?: string
}

function IconCardRoot({ children, className, href }: IconCardRootProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center justify-center gap-2 cursor-pointer select-none transition-transform duration-200 ease-out transform hover:scale-105',
        className
      )}
    >
      {children}
    </Link>
  )
}

interface IconCardIconProps {
  children: React.ReactNode
  className?: string
}

function IconCardIcon({ children, className }: IconCardIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-purple-400 text-white transition-transform duration-200 ease-out transform group-hover:scale-110',
        'w-24 h-24 sm:w-28 sm:h-28 md:w-14 md:h-14 lg:w-20 lg:h-20 xl:w-24 xl:h-24',
        className
      )}
    >
      {children}
    </div>
  )
}

interface IconCardLabelProps {
  children: React.ReactNode
  className?: string
}

function IconCardLabel({ children, className }: IconCardLabelProps) {
  return (
    <span
      className={cn(
        'text-sm sm:text-base md:text-[9px] lg:text-xs xl:text-sm font-semibold text-black uppercase tracking-wide',
        className
      )}
    >
      {children}
    </span>
  )
}

export const IconCard = {
  Root: IconCardRoot,
  Icon: IconCardIcon,
  Label: IconCardLabel,
}
