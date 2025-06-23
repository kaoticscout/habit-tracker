import styled from 'styled-components'
import { theme } from '@/styles/theme'

interface InputProps {
  error?: boolean
  fullWidth?: boolean
}

export const Input = styled.input<InputProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.base};
  border: 1px solid ${({ error }) => error ? theme.colors.error : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.fast};
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[100]};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }
  
  ${({ error }) => error && `
    &:focus {
      border-color: ${theme.colors.error};
      box-shadow: 0 0 0 3px ${theme.colors.error}20;
    }
  `}
`

export const TextArea = styled.textarea<InputProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.base};
  border: 1px solid ${({ error }) => error ? theme.colors.error : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.fast};
  resize: vertical;
  min-height: 100px;
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[100]};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }
  
  ${({ error }) => error && `
    &:focus {
      border-color: ${theme.colors.error};
      box-shadow: 0 0 0 3px ${theme.colors.error}20;
    }
  `}
`

export default Input 