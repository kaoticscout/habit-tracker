import styled from 'styled-components'
import { theme } from '@/styles/theme'

interface CardProps {
  padding?: 'sm' | 'md' | 'lg'
  elevation?: 'sm' | 'md' | 'lg'
}

const getPadding = (padding: CardProps['padding'] = 'md') => {
  switch (padding) {
    case 'sm':
      return theme.spacing[4]
    case 'lg':
      return theme.spacing[8]
    default:
      return theme.spacing[6]
  }
}

const getElevation = (elevation: CardProps['elevation'] = 'md') => {
  switch (elevation) {
    case 'sm':
      return theme.shadows.sm
    case 'lg':
      return theme.shadows.lg
    default:
      return theme.shadows.md
  }
}

export const Card = styled.div<CardProps>`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${({ elevation }) => getElevation(elevation)};
  padding: ${({ padding }) => getPadding(padding)};
  border: 1px solid ${theme.colors.gray[200]};
  transition: box-shadow ${theme.transitions.fast};
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
  }
`

export const CardHeader = styled.div`
  margin-bottom: ${theme.spacing[4]};
  padding-bottom: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`

export const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`

export const CardContent = styled.div`
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`

export const CardFooter = styled.div`
  margin-top: ${theme.spacing[4]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.gray[200]};
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing[3]};
`

export default Card 