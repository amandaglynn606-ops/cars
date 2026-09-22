export const siteConfig = {
  name: 'Zavi',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:43117',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971545974005',
  description:
    'Compare luxury car rental options in Dubai by brand, category and daily rate. View photos and send Zavi a reservation request for your dates.',
  locations: ['Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Dubai International Airport'],
} as const
export const hasWhatsapp = () =>
  /^\d{8,15}$/.test(siteConfig.whatsappNumber) && !/0{6,}/.test(siteConfig.whatsappNumber)
