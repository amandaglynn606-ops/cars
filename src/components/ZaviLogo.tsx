export default function ZaviLogo({ large = false }: { large?: boolean }) {
  return (
    <span className={large ? 'zavi-logo zavi-logo-large' : 'zavi-logo'} aria-label="Zavi">
      <T>Zavi</T>
    </span>
  )
}

import { T } from '@/components/RegionalProvider'
