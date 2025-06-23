import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const htmlAttributes = {
  lang: 'en',
  className: `no-fouc ${inter.variable}`,
}

export const metadata: Metadata = {
  title: 'Zen Habit Tracker - Peaceful & Mindful',
  description: 'A zen-inspired, minimalist habit tracking application to help you build better habits with peace and mindfulness.',
  keywords: ['habit tracker', 'zen', 'mindfulness', 'peaceful', 'minimalist', 'meditation', 'wellness'],
  authors: [{ name: 'Zen Habit Tracker Team' }],
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
    <html {...htmlAttributes}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zen Habit Tracker" />
        {/* FOUC prevention CSS */}
        <style>{`
          html.no-fouc { opacity: 0; visibility: hidden; transition: opacity 0.3s ease-in-out; }
          html { transition: opacity 0.3s ease-in-out; }
        `}</style>
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
        {/* Remove no-fouc class after DOM is ready */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function showContent() {
                  document.documentElement.classList.remove('no-fouc');
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', showContent);
                } else {
                  showContent();
                }
                setTimeout(showContent, 100);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
} 