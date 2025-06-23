import styled, { css } from 'styled-components'
import { theme } from '@/styles/theme'

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  $size?: 'sm' | 'md' | 'lg'
  $fullWidth?: boolean
  disabled?: boolean
}

const getVariantStyles = (variant: ButtonProps['$variant'] = 'primary') => {
  switch (variant) {
    case 'secondary':
      return css`
        background-color: ${theme.colors.gray[100]};
        color: ${theme.colors.text.primary};
        border: 1px solid ${theme.colors.gray[300]};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.gray[200]};
          border-color: ${theme.colors.gray[400]};
        }
      `
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme.colors.text.secondary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.gray[100]};
          color: ${theme.colors.text.primary};
        }
      `
    case 'danger':
      return css`
        background-color: ${theme.colors.error};
        color: white;
        
        &:hover:not(:disabled) {
          background-color: #dc2626;
        }
      `
    default:
      return css`
        background-color: ${theme.colors.primary[600]};
        color: white;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary[700]};
        }
      `
  }
}

const getSizeStyles = (size: ButtonProps['$size'] = 'md') => {
  switch (size) {
    case 'sm':
      return css`
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
        font-size: ${theme.typography.fontSize.sm};
        border-radius: ${theme.borderRadius.base};
      `
    case 'lg':
      return css`
        padding: ${theme.spacing[4]} ${theme.spacing[6]};
        font-size: ${theme.typography.fontSize.lg};
        border-radius: ${theme.borderRadius.lg};
      `
    default:
      return css`
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
        font-size: ${theme.typography.fontSize.base};
        border-radius: ${theme.borderRadius.md};
      `
  }
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.medium};
  border: none;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-decoration: none;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.primary[500]};
    outline-offset: 2px;
  }
  
  /* Loading state */
  &:has(svg) {
    gap: ${theme.spacing[2]};
  }
`

export default Button 