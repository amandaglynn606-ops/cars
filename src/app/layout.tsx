import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { siteConfig } from '@/lib/config'
import SmoothScroll from '@/components/SmoothScroll'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsappFab from '@/components/WhatsappFab'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

// Licensed display faces - see src/fonts/*-eula.txt before going live.
const haymila = localFont({
  src: './../fonts/Haymila-Regular.woff2',
  variable: '--font-haymila',
  display: 'swap',
  weight: '400',
})
const qiswah = localFont({
  src: './../fonts/Qiswah.woff2',
  variable: '--font-qiswah',
  display: 'swap',
  weight: '400',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Supercar & Luxury Car Hire`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${haymila.variable} ${qiswah.variable}`}>
      <body className="bg-ink-950 text-bone antialiased">
        <SmoothScroll />
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsappFab />
      </body>
    </html>
  )
}
