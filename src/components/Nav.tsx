'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config'
import { buildQuickChatUrl } from '@/lib/whatsapp'

const links = [
  { href: '/fleet', label: 'Fleet' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Never leave the mobile drawer open across a navigation.
  useEffect(() => setOpen(false), [pathname])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-lux)] ${
        scrolled || open
          ? 'bg-ink-950/85 backdrop-blur-xl border-b border-white/10 py-4'
          : 'bg-transparent py-7'
      }`}
    >
      <nav className="container-lux flex items-center justify-between gap-6">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-xl tracking-[0.18em] uppercase">
            {siteConfig.name.split(' ')[0]}
          </span>
          <span className="eyebrow mt-1 transition-colors group-hover:text-gold-400">Dubai</span>
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm tracking-wide transition-colors ${
                    active ? 'text-gold-500' : 'text-bone/75 hover:text-bone'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-gold-500 transition-all duration-400 ease-[var(--ease-lux)] ${
                      active ? 'w-full' : 'w-0'
                    }`}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={buildQuickChatUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-gold-500/45 px-6 py-2.5 text-xs tracking-[0.16em] uppercase text-gold-500 transition-all duration-300 hover:bg-gold-500 hover:text-ink-950 sm:block"
          >
            Book Now
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-px w-6 bg-bone transition-all duration-300 ${open ? 'translate-y-[3px] rotate-45' : ''}`}
            />
            <span
              className={`h-px w-6 bg-bone transition-all duration-300 ${open ? '-translate-y-[3px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-x-0 top-full h-screen bg-ink-950/97 backdrop-blur-xl md:hidden">
          <ul className="container-lux flex flex-col gap-2 py-10">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block border-b border-white/8 py-5 font-display text-3xl"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-6">
              <a
                href={buildQuickChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-full bg-gold-500 py-4 text-center text-xs tracking-[0.2em] uppercase text-ink-950"
              >
                Book on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
