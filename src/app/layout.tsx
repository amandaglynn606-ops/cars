import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'
import SmoothScroll from '@/components/SmoothScroll'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsappFab from '@/components/WhatsappFab'
import './globals.css'

// Fonts are self-hosted through @fontsource and imported in globals.css, so the
// build makes no network request and nothing depends on Google Fonts at runtime.

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
    <html lang="en">
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
