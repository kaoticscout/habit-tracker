export const theme = {
  colors: {
    // Zen-inspired color palette - even softer, more calming, natural
    primary: {
      25: '#f8fcff',
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    // Softer, warmer grays inspired by natural materials
    gray: {
      25: '#fcfcfc',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Muted, zen-like semantic colors
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    // Zen background colors - even warmer whites and soft creams
    background: '#fefefe',
    surface: '#fafafa',
    // Softer, more readable text colors
    text: {
      primary: '#1c1917',
      secondary: '#57534e',
      disabled: '#a8a29e',
      muted: '#78716c',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.6,
      relaxed: 1.8,
      loose: 2,
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  // Zen-like shadows - even more subtle and soft
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.04), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
  },
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  // Zen-like transitions - even smoother and gentler
  transitions: {
    fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '600ms cubic-bezier(0.4, 0, 0.2, 1)',
    zen: '800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  // Responsive spacing for mobile-first design
  responsiveSpacing: {
    xs: {
      padding: '1rem',
      gap: '0.75rem',
      margin: '1rem',
    },
    sm: {
      padding: '1.5rem',
      gap: '1rem',
      margin: '1.5rem',
    },
    md: {
      padding: '2rem',
      gap: '1.5rem',
      margin: '2rem',
    },
    lg: {
      padding: '3rem',
      gap: '2rem',
      margin: '3rem',
    },
  },
} as const

export type Theme = typeof theme 