import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Routinely - Build Better Routines',
  description: 'A minimalist habit tracker that helps you create consistent daily routines. Transform your goals into lasting habits with simplicity and focus.',
  keywords: ['habits', 'routines', 'productivity', 'goals', 'tracker', 'minimalist'],
  authors: [{ name: 'Routinely' }],
  creator: 'Routinely',
  publisher: 'Routinely',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2366a3ff' opacity='0.8'/></svg>",
    shortcut: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2366a3ff' opacity='0.8'/></svg>",
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%2366a3ff' opacity='0.8'/></svg>",
  },
  robots: 'index, follow',
  themeColor: '#f0f9ff',
  colorScheme: 'light',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f0f9ff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Routinely" />
        {/* Minimal critical CSS for FOUC prevention only */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html {
              background-color: #f0f9ff;
              font-family: Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #f0f9ff;
              color: #1f2937;
              font-family: inherit;
            }
            .skip-link {
              position: absolute;
              top: -40px;
              left: 6px;
              background: #000;
              color: #fff;
              padding: 8px;
              text-decoration: none;
              border-radius: 4px;
              z-index: 1000;
              font-size: 14px;
            }
            .skip-link:focus {
              top: 6px;
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" style={{ paddingTop: '4rem' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
} 