'use client'

import { createGlobalStyle } from 'styled-components'
import { theme } from './theme'

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html {
    visibility: visible !important;
    opacity: 1 !important;
    transition: opacity 0.5s ease-in-out;
  }

  html,
  body {
    max-width: 100vw;
    overflow-x: hidden;
    font-family: ${theme.typography.fontFamily.sans.join(', ')};
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.relaxed};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Zen-like smooth scrolling */
    scroll-behavior: smooth;
    /* Subtle background texture */
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.003) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.003) 0%, transparent 50%);
    /* Mobile touch improvements */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    outline: none !important;
    border: none !important;
  }

  /* Ensure no unwanted elements at the top of the page */
  html::before,
  html::after,
  body::before,
  body::after {
    display: none !important;
  }

  /* Prevent any focus outlines on html/body */
  html:focus,
  body:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  /* Zen-like selection colors */
  ::selection {
    background-color: ${theme.colors.primary[100]};
    color: ${theme.colors.text.primary};
  }

  ::-moz-selection {
    background-color: ${theme.colors.primary[100]};
    color: ${theme.colors.text.primary};
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: color ${theme.transitions.normal};
    /* Mobile touch improvements */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  a:hover {
    color: ${theme.colors.primary[600]};
  }

  button, 
  [role="button"] {
    min-height: 44px;
    min-width: 44px;
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    transition: all ${theme.transitions.normal};
    /* Mobile touch improvements */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  input,
  textarea,
  select {
    font-family: inherit;
    font-size: 16px; /* Prevents zoom on iOS */
    line-height: inherit;
    transition: all ${theme.transitions.normal};
    /* Mobile touch improvements */
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.light};
    line-height: ${theme.typography.lineHeight.tight};
    margin: 0;
    /* Zen-like text rendering */
    text-rendering: optimizeLegibility;
    letter-spacing: -0.02em;
  }

  h1 {
    font-size: clamp(2rem, 5vw, ${theme.typography.fontSize['4xl']});
  }

  h2 {
    font-size: clamp(1.5rem, 4vw, ${theme.typography.fontSize['3xl']});
  }

  h3 {
    font-size: clamp(1.25rem, 3vw, ${theme.typography.fontSize['2xl']});
  }

  h4 {
    font-size: clamp(1.125rem, 2.5vw, ${theme.typography.fontSize.xl});
  }

  h5 {
    font-size: clamp(1rem, 2vw, ${theme.typography.fontSize.lg});
  }

  h6 {
    font-size: clamp(0.875rem, 1.5vw, ${theme.typography.fontSize.base});
  }

  p {
    margin: 0;
    line-height: ${theme.typography.lineHeight.relaxed};
    font-weight: ${theme.typography.fontWeight.normal};
  }

  ul, ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  img {
    max-width: 100%;
    height: auto;
    /* Zen-like image rendering */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }

  /* Zen-like focus styles */
  *:focus {
    outline: 2px solid ${theme.colors.primary[300]};
    outline-offset: 2px;
    transition: outline ${theme.transitions.fast};
  }

  /* Prevent unwanted focus outlines and visual artifacts */
  *:focus:not(:focus-visible) {
    outline: none !important;
    box-shadow: none !important;
  }

  /* Hide scrollbars for a cleaner look */
  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: transparent;
  }

  /* Ensure no unwanted browser elements */
  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Zen-like scrollbar */
  @media (min-width: ${theme.breakpoints.md}) {
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: ${theme.colors.gray[100]};
    }
    
    ::-webkit-scrollbar-thumb {
      background: ${theme.colors.gray[300]};
      border-radius: ${theme.borderRadius.full};
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: ${theme.colors.gray[400]};
    }
  }

  /* Skip to content link for accessibility */
  .skip-link {
    position: absolute;
    top: -100px;
    left: -100px;
    background: ${theme.colors.primary[600]};
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: ${theme.borderRadius.base};
    z-index: 1000;
    transition: all ${theme.transitions.normal};
    opacity: 0;
    border: none;
    outline: none;
    box-shadow: none;
  }

  .skip-link:focus {
    top: 6px;
    left: 6px;
    opacity: 1;
  }

  /* Zen-like loading states */
  .zen-loading {
    opacity: 0.6;
    transition: opacity ${theme.transitions.normal};
  }

  .zen-loading.loaded {
    opacity: 1;
  }

  /* Zen-like hover effects */
  .zen-hover {
    transition: all ${theme.transitions.normal};
  }

  .zen-hover:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }

  /* Zen-like fade in animation */
  @keyframes zenFadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .zen-fade-in {
    animation: zenFadeIn ${theme.transitions.slow} ease-out;
  }

  /* Zen-like overlay fade in animation (no movement) */
  @keyframes zenOverlayFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .zen-overlay-fade-in {
    animation: zenOverlayFadeIn 0.3s ease-out;
  }

  /* Zen-like slide in animation */
  @keyframes zenSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .zen-slide-in {
    animation: zenSlideIn 0.4s ease-out;
  }

  /* Zen-like float animation */
  @keyframes zenFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-15px) rotate(180deg);
      opacity: 0.5;
    }
  }

  .zen-float {
    animation: zenFloat 8s ease-in-out infinite;
  }

  /* Zen-like breathe animation */
  @keyframes zenBreathe {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
  }

  .zen-breathe {
    animation: zenBreathe 4s ease-in-out infinite;
  }

  /* Zen-like pulse animation */
  @keyframes zenPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .zen-pulse {
    animation: zenPulse 3s ease-in-out infinite;
  }

  /* Zen-like shimmer animation */
  @keyframes zenShimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  .zen-shimmer {
    background: linear-gradient(
      90deg,
      ${theme.colors.gray[100]} 0px,
      ${theme.colors.gray[50]} 40px,
      ${theme.colors.gray[100]} 80px
    );
    background-size: 200px 100%;
    animation: zenShimmer 2s infinite;
  }

  /* Reduced motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      border-color: currentColor !important;
    }
  }

  /* Print styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
  }

  /* Zen-like dark mode support */
  @media (prefers-color-scheme: dark) {
    html,
    body {
      background-color: #0a0a0a;
      color: #f5f5f5;
    }
  }

  /* Mobile-specific styles */
  @media (max-width: ${theme.breakpoints.sm}) {
    html,
    body {
      font-size: 14px;
    }
    
    /* Reduce padding on mobile */
    .mobile-container {
      padding: ${theme.spacing[4]};
    }
    
    /* Stack elements vertically on mobile */
    .mobile-stack {
      flex-direction: column;
      gap: ${theme.spacing[4]};
    }
    
    /* Full width on mobile */
    .mobile-full {
      width: 100%;
    }
  }

  /* Tablet styles */
  @media (min-width: ${theme.breakpoints.sm}) and (max-width: ${theme.breakpoints.lg}) {
    .tablet-container {
      padding: ${theme.spacing[6]};
    }
  }

  /* Desktop styles */
  @media (min-width: ${theme.breakpoints.lg}) {
    .desktop-container {
      padding: ${theme.spacing[8]};
    }
  }
` 