import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Habit Tracker - Minimal & Effective',
  description: 'A minimalist habit tracking application to help you build better habits and achieve your goals.',
  keywords: ['habit tracker', 'productivity', 'goals', 'minimalist'],
  authors: [{ name: 'Habit Tracker Team' }],
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <main id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
} 