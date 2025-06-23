'use client'

import { GlobalStyles } from '@/styles/GlobalStyles'
import { SessionProvider } from 'next-auth/react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <GlobalStyles />
      {children}
    </SessionProvider>
  )
} 