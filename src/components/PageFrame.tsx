'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import './internal-pages.css'
export default function PageFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <main
      id="main-content"
      className={pathname !== '/' && !pathname.startsWith('/admin') ? 'z-internal-page' : undefined}
    >
      {children}
    </main>
  )
}
