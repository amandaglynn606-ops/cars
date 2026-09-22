'use client'

import { usePathname } from 'next/navigation'
import { hasWhatsapp } from '@/lib/config'
import { buildQuickChatUrl } from '@/lib/whatsapp'
import WhatsappIcon from './WhatsappIcon'
import { T, useRegional } from './RegionalProvider'

export default function WhatsappFab() {
  const pathname = usePathname()
  const { t } = useRegional()
  if (!hasWhatsapp() || pathname === '/admin' || pathname.startsWith('/admin/')) return null
  return (
    <a
      href={buildQuickChatUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('Chat with Zavi on WhatsApp') + ' +971 54 597 4005'}
      className="z-whatsapp-fab"
    >
      <WhatsappIcon size={29} />
      <span>
        <small>
          <T>Chat with Zavi</T>
        </small>
        <strong>WhatsApp</strong>
      </span>
    </a>
  )
}
