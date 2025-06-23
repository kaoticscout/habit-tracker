import styled from 'styled-components'
import { theme } from '@/styles/theme'

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'ghost'
  $size?: 'sm' | 'md' | 'lg'
}

const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  font-family: inherit;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm': return theme.typography.fontSize.sm
      case 'lg': return theme.typography.fontSize.lg
      default: return theme.typography.fontSize.base
    }
  }};
  font-weight: ${theme.typography.fontWeight.medium};
  line-height: 1;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.zen};
  text-decoration: none;
  
  /* Size variants */
  padding: ${props => {
    switch (props.$size) {
      case 'sm': return `${theme.spacing[2]} ${theme.spacing[4]}`
      case 'lg': return `${theme.spacing[5]} ${theme.spacing[8]}`
      default: return `${theme.spacing[4]} ${theme.spacing[6]}`
    }
  }};
  
  /* Primary variant */
  ${props => props.$variant === 'primary' && `
    background-color: ${theme.colors.primary[500]};
    color: white;
    
    &:hover {
      background-color: ${theme.colors.primary[600]};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px ${theme.colors.primary[200]};
    }
    
    &:active {
      background-color: ${theme.colors.primary[700]};
      transform: translateY(0);
    }
    
    &:disabled {
      background-color: ${theme.colors.gray[200]};
      color: ${theme.colors.text.disabled};
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}
  
  /* Secondary variant */
  ${props => props.$variant === 'secondary' && `
    background-color: transparent;
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.gray[200]};
    
    &:hover {
      background-color: ${theme.colors.gray[50]};
      border-color: ${theme.colors.gray[300]};
      color: ${theme.colors.text.primary};
      transform: translateY(-1px);
      box-shadow: ${theme.shadows.sm};
    }
    
    &:active {
      background-color: ${theme.colors.gray[100]};
      transform: translateY(0);
    }
    
    &:disabled {
      background-color: transparent;
      color: ${theme.colors.text.disabled};
      border-color: ${theme.colors.gray[100]};
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}
  
  /* Ghost variant */
  ${props => props.$variant === 'ghost' && `
    background-color: transparent;
    color: ${theme.colors.text.secondary};
    
    &:hover {
      background-color: ${theme.colors.gray[50]};
      color: ${theme.colors.text.primary};
      transform: translateY(-1px);
    }
    
    &:active {
      background-color: ${theme.colors.gray[100]};
      transform: translateY(0);
    }
    
    &:disabled {
      color: ${theme.colors.text.disabled};
      cursor: not-allowed;
      transform: none;
    }
  `}
  
  /* Default variant (primary) */
  ${props => !props.$variant && `
    background-color: ${theme.colors.primary[500]};
    color: white;
    
    &:hover {
      background-color: ${theme.colors.primary[600]};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px ${theme.colors.primary[200]};
    }
    
    &:active {
      background-color: ${theme.colors.primary[700]};
      transform: translateY(0);
    }
    
    &:disabled {
      background-color: ${theme.colors.gray[200]};
      color: ${theme.colors.text.disabled};
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `}
  
  /* Focus styles */
  &:focus {
    outline: 2px solid ${theme.colors.primary[300]};
    outline-offset: 2px;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
`

export default Button 