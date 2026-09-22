export type PartnershipType = 'consignment' | 'business'
export type PartnershipField = {
  name: string
  label: string
  section: string
  kind?: 'number' | 'select' | 'url'
  options?: readonly string[]
  max?: number
  min?: number
  optional?: boolean
  hint?: string
}
const emirates = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
]
export const partnershipFields: Record<PartnershipType, PartnershipField[]> = {
  consignment: [
    { name: 'brand', label: 'Car brand', section: 'Your vehicle', max: 80 },
    { name: 'model', label: 'Model / trim', section: 'Your vehicle', max: 120 },
    {
      name: 'year',
      label: 'Model year',
      section: 'Your vehicle',
      kind: 'number',
      min: 1980,
      max: new Date().getFullYear() + 1,
    },
    {
      name: 'mileage',
      label: 'Mileage (km)',
      section: 'Your vehicle',
      kind: 'number',
      min: 0,
      max: 2000000,
    },
    {
      name: 'specification',
      label: 'Regional specification',
      section: 'Your vehicle',
      kind: 'select',
      options: ['GCC', 'European', 'American', 'Japanese', 'Other', 'Not sure'],
    },
    {
      name: 'emirate',
      label: 'Car location',
      section: 'Your vehicle',
      kind: 'select',
      options: emirates,
    },
    {
      name: 'ownership',
      label: 'Your relationship to the car',
      section: 'Ownership & availability',
      kind: 'select',
      options: ['Registered owner', 'Authorised representative'],
    },
    {
      name: 'finance',
      label: 'Finance status',
      section: 'Ownership & availability',
      kind: 'select',
      options: ['Owned outright', 'Under finance', 'Under lease', 'Other / to discuss'],
    },
    {
      name: 'condition',
      label: 'Current condition',
      section: 'Ownership & availability',
      kind: 'select',
      options: [
        'Roadworthy, no known repairs needed',
        'Roadworthy, repairs or cosmetic work needed',
        'Not currently roadworthy',
      ],
    },
    {
      name: 'insurance',
      label: 'Current insurance',
      section: 'Ownership & availability',
      kind: 'select',
      options: ['Comprehensive', 'Third-party', 'No current cover', 'Not sure'],
    },
    {
      name: 'availability',
      label: 'When is the car available?',
      section: 'Ownership & availability',
      kind: 'select',
      options: ['Now', 'Within 30 days', 'Within 1–3 months', 'Exploring options'],
    },
    {
      name: 'duration',
      label: 'Preferred consignment period',
      section: 'Ownership & availability',
      kind: 'select',
      options: [
        'Less than 3 months',
        '3–6 months',
        '6–12 months',
        'More than 12 months',
        'Flexible / to discuss',
      ],
    },
  ],
  business: [
    { name: 'company', label: 'Registered agency name', section: 'Your agency', max: 160 },
    { name: 'role', label: 'Your role at the agency', section: 'Your agency', max: 100 },
    {
      name: 'emirate',
      label: 'Agency base',
      section: 'Your agency',
      kind: 'select',
      options: emirates,
    },
    { name: 'licence', label: 'Trade licence number', section: 'Your agency', max: 80 },
    {
      name: 'licensingAuthority',
      label: 'Licensing authority',
      section: 'Your agency',
      max: 120,
      hint: 'The authority that issued your trade licence.',
    },
    {
      name: 'website',
      label: 'Website or public business profile (optional)',
      section: 'Your agency',
      kind: 'url',
      optional: true,
      max: 300,
    },
    {
      name: 'fleetSize',
      label: 'Number of rental vehicles',
      section: 'Fleet & partnership',
      kind: 'number',
      min: 1,
      max: 100000,
    },
    {
      name: 'vehicleTypes',
      label: 'Vehicle categories / key brands',
      section: 'Fleet & partnership',
      max: 300,
      hint: 'For example: luxury SUVs, sports cars, Mercedes-Benz, Porsche.',
    },
    {
      name: 'coverage',
      label: 'Delivery and service areas',
      section: 'Fleet & partnership',
      max: 300,
      hint: 'List the emirates or areas your agency serves.',
    },
    {
      name: 'interest',
      label: 'How would you like to partner?',
      section: 'Fleet & partnership',
      kind: 'select',
      options: ['Monthly subscription to display cars', 'Receive rental leads from Zavi'],
    },
    {
      name: 'leadContact',
      label: 'Preferred contact channel',
      section: 'Fleet & partnership',
      kind: 'select',
      options: ['Email', 'Phone / WhatsApp', 'Email and phone / WhatsApp'],
      hint: 'We will use the contact details you provide below.',
    },
    {
      name: 'inventory',
      label: 'How do you manage fleet availability?',
      section: 'Fleet & partnership',
      kind: 'select',
      options: ['Fleet management software', 'Spreadsheet', 'Manually / by phone', 'Other'],
    },
  ],
}
export type Partnership = {
  id: string
  type: PartnershipType
  name: string
  email: string
  phone: string
  details: string
  application?: Record<string, string>
  consentVersion?: string
  createdAt: string
}
export function validatePartnership(value: unknown): Omit<Partnership, 'id' | 'createdAt'> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid enquiry.')
  const v = value as Record<string, unknown>
  if (v.type !== 'consignment' && v.type !== 'business')
    throw new Error('Choose a partnership type.')
  if (v.consent !== true) throw new Error('Please agree to be contacted about your enquiry.')
  const clean = (value: unknown, label: string, max: number, optional = false) => {
    if (optional && (value === undefined || value === '')) return ''
    if (
      typeof value !== 'string' ||
      (!optional && !value.trim()) ||
      value.length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
    )
      throw new Error('Enter a valid value for ' + label + '.')
    return value.trim()
  }
  const name = clean(v.name, 'your name', 120),
    email = clean(v.email, 'email', 200),
    phone = clean(v.phone, 'phone', 25)
  const details = clean(v.details, 'additional notes', 1500, true)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+[1-9](?:[ ()-]*[0-9]){7,14}$/.test(phone))
    throw new Error('Enter a valid email and a phone number with + and a country code.')
  if (!v.application || typeof v.application !== 'object' || Array.isArray(v.application))
    throw new Error('Complete the application details.')
  const source = v.application as Record<string, unknown>,
    application: Record<string, string> = {}
  for (const field of partnershipFields[v.type]) {
    const input = clean(
      source[field.name],
      field.label,
      field.kind === 'number' ? 10 : field.max || 120,
      field.optional,
    )
    if (field.kind === 'select' && !field.options?.includes(input))
      throw new Error('Choose a valid option for ' + field.label + '.')
    if (
      field.kind === 'number' &&
      (!/^\d+$/.test(input) ||
        Number(input) < (field.min ?? 0) ||
        Number(input) > (field.max ?? Infinity))
    )
      throw new Error('Enter a valid number for ' + field.label + '.')
    if (field.kind === 'url' && input) {
      let url: URL
      try {
        url = new URL(input)
      } catch {
        throw new Error('Enter a complete website address starting with https:// or http://.')
      }
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
        throw new Error('Enter a public website address without login details.')
    }
    application[field.name] = input
  }
  return {
    type: v.type,
    name,
    email,
    phone,
    details,
    application,
    consentVersion: 'partnership-2026-09',
  }
}
