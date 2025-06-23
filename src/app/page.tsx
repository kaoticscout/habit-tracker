'use client'

import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import { Plus, Sparkles, Check } from 'lucide-react'

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[25]} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[6]} ${theme.spacing[3]};
    min-height: 90vh;
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: ${theme.spacing[16]} ${theme.spacing[4]};
  }
`

const Container = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    max-width: 100%;
  }
`

const HeroContent = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    max-width: 100%;
  }
`

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 8vw, ${theme.typography.fontSize['5xl']});
  font-weight: ${theme.typography.fontWeight.light};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
  line-height: ${theme.typography.lineHeight.tight};
  letter-spacing: -0.03em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[4]};
    letter-spacing: -0.02em;
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[8]};
  }
`

const HeroSubtitle = styled.p`
  font-size: clamp(1.125rem, 4vw, ${theme.typography.fontSize.xl});
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[8]};
  line-height: ${theme.typography.lineHeight.loose};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[6]};
    line-height: ${theme.typography.lineHeight.relaxed};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[12]};
  }
`

const ZenFeatures = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing[8]};
  margin-bottom: ${theme.spacing[8]};
  flex-wrap: wrap;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[6]};
    flex-direction: column;
    align-items: center;
  }
  
  @media (min-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing[10]};
    margin-bottom: ${theme.spacing[10]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    gap: ${theme.spacing[12]};
    margin-bottom: ${theme.spacing[12]};
  }
`

const ZenFeature = styled.div`
  text-align: center;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    min-width: 100px;
    padding: ${theme.spacing[2]} 0;
  }
`

const FeatureIcon = styled.div`
  color: ${theme.colors.primary[500]};
  margin-bottom: ${theme.spacing[3]};
  opacity: 0.7;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[2]};
  }
`

const FeatureText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
  font-weight: ${theme.typography.fontWeight.normal};
  letter-spacing: 0.01em;
  white-space: nowrap;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.text.secondary};
  }
`

const CTAButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[3]};
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  @media (min-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing[6]};
  }
`

const ZenButton = styled(Button)`
  transition: all ${theme.transitions.zen};
  font-weight: ${theme.typography.fontWeight.medium};
  min-height: 48px;
  min-width: 160px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    max-width: 280px;
    min-height: 52px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
  
  &:active {
    transform: translateY(0);
  }
`

const SecondaryButton = styled(Button)`
  background-color: transparent;
  border: 1px solid ${theme.colors.gray[200]};
  color: ${theme.colors.text.secondary};
  transition: all ${theme.transitions.zen};
  font-weight: ${theme.typography.fontWeight.normal};
  min-height: 48px;
  min-width: 120px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    max-width: 280px;
    min-height: 52px;
  }
  
  &:hover {
    background-color: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[300]};
    color: ${theme.colors.text.primary};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  return (
    <>
      <HeroSection>
        <Container>
          <HeroContent>
            <HeroTitle>Build Better Routines</HeroTitle>
            <HeroSubtitle>
              A minimalist habit tracker that helps you create consistent daily 
              routines. Transform your goals into lasting habits with simplicity 
              and focus.
            </HeroSubtitle>
            
            <ZenFeatures>
              <ZenFeature>
                <FeatureIcon>
                  <Sparkles size={28} />
                </FeatureIcon>
                <FeatureText>Focused</FeatureText>
              </ZenFeature>
              <ZenFeature>
                <FeatureIcon>
                  <Plus size={28} />
                </FeatureIcon>
                <FeatureText>Simple</FeatureText>
              </ZenFeature>
              <ZenFeature>
                <FeatureIcon>
                  <Check size={28} />
                </FeatureIcon>
                <FeatureText>Consistent</FeatureText>
              </ZenFeature>
            </ZenFeatures>
            
            <CTAButtons>
              <ZenButton onClick={handleGetStarted}>
                Start Building Habits
              </ZenButton>
            </CTAButtons>
          </HeroContent>
        </Container>
      </HeroSection>
    </>
  )
} 