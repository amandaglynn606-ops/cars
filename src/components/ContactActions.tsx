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

  if (!configured) {
    return (
      <div className="rounded-sm border border-amber-500/40 bg-amber-500/10 p-6 text-sm leading-relaxed text-amber-200">
        <strong className="mb-2 block font-display text-lg">WhatsApp not configured yet</strong>
        Add your number as <code className="text-amber-100">NEXT_PUBLIC_WHATSAPP_NUMBER</code> in{' '}
        <code className="text-amber-100">.env.local</code> (digits only, e.g.{' '}
        <code className="text-amber-100">971501234567</code>) and restart the dev server.
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-white/12 bg-ink-900 p-8">
      <p className="eyebrow mb-3">WhatsApp</p>
      <p className="font-display text-3xl">{prettyNumber(siteConfig.whatsappNumber)}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Message us with the car you want and your dates. We reply with availability and a final
        quote &mdash; no payment is taken online.
      </p>

      <a
        href={buildQuickChatUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-7 block rounded-full bg-[#25D366] py-4 text-center text-xs tracking-[0.18em] uppercase text-ink-950 transition-transform duration-300 hover:scale-[1.02]"
      >
        Open WhatsApp
      </a>

      <a
        href={`tel:+${siteConfig.whatsappNumber}`}
        className="mt-3 block rounded-full border border-white/20 py-4 text-center text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:border-gold-500 hover:text-gold-500"
      >
        Call instead
      </a>
    </div>
  )
}
