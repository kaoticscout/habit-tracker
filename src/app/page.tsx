'use client'

import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import { Plus, LogIn } from 'lucide-react'

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
`

const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`

const HeroContent = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`

const HeroTitle = styled.h1`
  font-size: ${theme.typography.fontSize['5xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
  line-height: 1.1;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['4xl']};
  }
`

const HeroSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[8]};
  line-height: 1.6;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`

const CTAButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  justify-content: center;
  flex-wrap: wrap;
`

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  const handleLogin = () => {
    router.push('/get-started')
  }

  return (
    <HeroSection>
      <Container>
        <HeroContent>
          <HeroTitle>Track Your Habits, Transform Your Life</HeroTitle>
          <HeroSubtitle>
            A minimalist habit tracking app designed to help you build lasting habits 
            and achieve your goals with simplicity and focus.
          </HeroSubtitle>
          <CTAButtons>
            <Button $size="lg" onClick={handleGetStarted}>
              <Plus size={20} />
              Get Started
            </Button>
            <Button $variant="secondary" $size="lg" onClick={handleLogin}>
              <LogIn size={20} />
              Sign In
            </Button>
          </CTAButtons>
        </HeroContent>
      </Container>
    </HeroSection>
  )
} 