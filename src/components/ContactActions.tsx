'use client'

import { siteConfig, hasWhatsapp } from '@/lib/config'
import { buildQuickChatUrl } from '@/lib/whatsapp'

/** Formats 971501234567 as +971 50 123 4567 for display. */
const prettyNumber = (digits: string) => {
  if (!/^\d{8,15}$/.test(digits)) return ''
  const country = digits.slice(0, 3)
  const rest = digits.slice(3)
  return `+${country} ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`.trim()
}

export default function ContactActions() {
  const configured = hasWhatsapp()

  if (!configured) return null

  return (
    <div className="rounded-sm border border-white/12 bg-ink-900 p-8">
      <p className="eyebrow mb-3">
        <T>WhatsApp</T>
      </p>
      <p className="font-display text-3xl">
        <T>{prettyNumber(siteConfig.whatsappNumber)}</T>
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        <T>
          Message us with the car you want and your dates. We reply with availability and a final
          quote &mdash; no payment is taken online.
        </T>
      </p>

      <a
        href={buildQuickChatUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="z-car-whatsapp mt-7"
      >
        <T>Open WhatsApp</T>
      </a>

      <a
        href={`tel:+${siteConfig.whatsappNumber}`}
        className="mt-3 block rounded-full border border-white/20 py-4 text-center text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
      >
        <T>Call instead</T>
      </a>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
