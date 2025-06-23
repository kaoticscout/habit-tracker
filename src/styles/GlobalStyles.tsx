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
    transition: opacity 0.3s ease-in-out;
  }

  html,
  body {
    max-width: 100vw;
    overflow-x: hidden;
    font-family: ${theme.typography.fontFamily.sans.join(', ')};
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Zen-like smooth scrolling */
    scroll-behavior: smooth;
    /* Subtle background texture */
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.005) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.005) 0%, transparent 50%);
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
    transition: color ${theme.transitions.fast};
  }

  a:hover {
    color: ${theme.colors.primary[600]};
  }

  button {
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    transition: all ${theme.transitions.fast};
  }

  input,
  textarea,
  select {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    transition: all ${theme.transitions.fast};
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    margin: 0;
    /* Zen-like text rendering */
    text-rendering: optimizeLegibility;
  }

  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
  }

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
  }

  p {
    margin: 0;
    line-height: ${theme.typography.lineHeight.relaxed};
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

  *:focus:not(:focus-visible) {
    outline: none;
  }

  /* Zen-like scrollbar */
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

  /* Skip to content link for accessibility */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: ${theme.colors.primary[600]};
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: ${theme.borderRadius.base};
    z-index: 1000;
    transition: top ${theme.transitions.normal};
  }

  .skip-link:focus {
    top: 6px;
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
    animation: zenPulse 2s ease-in-out infinite;
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
` 