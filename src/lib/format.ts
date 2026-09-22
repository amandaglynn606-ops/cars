/** Formats an AED amount with thousands separators and no decimals. */
export const formatPrice = (amount: number, currency = 'AED') =>
  `${currency} ${new Intl.NumberFormat('en-AE', { maximumFractionDigits: 2 }).format(amount)}`

export const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Inclusive day count between two ISO dates; returns 0 when either is missing or invalid. */
export const daysBetween = (fromIso: string, toIso: string) => {
  if (!fromIso || !toIso) return 0
  const from = new Date(fromIso + 'T00:00:00').getTime()
  const to = new Date(toIso + 'T00:00:00').getTime()
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return 0
  return Math.round((to - from) / 86_400_000) + 1
}
