/** Site-wide settings sourced from the environment, with safe fallbacks. */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Luxury Car Rental Dubai',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  description:
    'Rent Lamborghini, Ferrari, Rolls-Royce and Range Rover in Dubai. Daily and monthly rates, delivered to your door.',
  locations: ['Dubai Marina', 'Downtown Dubai', 'DXB Airport', 'Palm Jumeirah', 'Business Bay'],
} as const

/** True when a real WhatsApp number has been configured. */
export const hasWhatsapp = () => /^\d{8,15}$/.test(siteConfig.whatsappNumber)
