'use client'

import { GlobalStyles } from '@/styles/GlobalStyles'
import { SessionProvider } from 'next-auth/react'
import { StyleSheetManager } from 'styled-components'

interface ProvidersProps {
  children: React.ReactNode
}

// Prevent flash of unstyled content and prop warnings
const shouldForwardProp = (prop: string) => {
  return !prop.startsWith('$')
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StyleSheetManager 
      shouldForwardProp={shouldForwardProp}
      enableVendorPrefixes={false}
      disableCSSOMInjection={false}
    >
      <SessionProvider>
        <GlobalStyles />
        {children}
      </SessionProvider>
    </StyleSheetManager>
  )
} 