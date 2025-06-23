'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import { Plus, LogIn, Sparkles } from 'lucide-react'
import SignInModal from '@/components/SignInModal'
import SignUpModal from '@/components/SignUpModal'

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  position: relative;
  overflow: hidden;
  
  /* Zen-like floating elements */
  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 10%;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, ${theme.colors.primary[100]} 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.3;
    animation: zenFloat 6s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 30%;
    right: 15%;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, ${theme.colors.primary[100]} 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.2;
    animation: zenFloat 8s ease-in-out infinite reverse;
  }
  
  @keyframes zenFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }
`

const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`

const HeroContent = styled.div`
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  animation: zenFadeIn 1.5s ease-out;
`

const HeroTitle = styled.h1`
  font-size: ${theme.typography.fontSize['5xl']};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
  line-height: 1.2;
  letter-spacing: -0.02em;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['4xl']};
  }
`

const HeroSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[8]};
  line-height: 1.7;
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`

const ZenFeatures = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing[8]};
  margin-bottom: ${theme.spacing[8]};
  flex-wrap: wrap;
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing[4]};
  }
`

const ZenFeature = styled.div`
  text-align: center;
  opacity: 0;
  animation: zenFadeIn 1.5s ease-out forwards;
  
  &:nth-child(1) { animation-delay: 0.2s; }
  &:nth-child(2) { animation-delay: 0.4s; }
  &:nth-child(3) { animation-delay: 0.6s; }
`

const FeatureIcon = styled.div`
  color: ${theme.colors.primary[500]};
  margin-bottom: ${theme.spacing[2]};
  opacity: 0.8;
`

const FeatureText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`

const CTAButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  justify-content: center;
  flex-wrap: wrap;
  opacity: 0;
  animation: zenFadeIn 1.5s ease-out 0.8s forwards;
`

const ZenButton = styled(Button)`
  transition: all ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`

export default function HomePage() {
  const router = useRouter()
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  const handleSignIn = () => {
    setIsSignInModalOpen(true)
  }

  const handleCloseSignInModal = () => {
    setIsSignInModalOpen(false)
  }

  const handleCloseSignUpModal = () => {
    setIsSignUpModalOpen(false)
  }

  const handleSwitchToSignUp = () => {
    setIsSignInModalOpen(false)
    setIsSignUpModalOpen(true)
  }

  const handleSwitchToSignIn = () => {
    setIsSignUpModalOpen(false)
    setIsSignInModalOpen(true)
  }

  return (
    <>
      <HeroSection>
        <Container>
          <HeroContent>
            <HeroTitle>Find Peace in Your Habits</HeroTitle>
            <HeroSubtitle>
              A zen-inspired habit tracker that helps you build mindful routines 
              with simplicity and inner calm. Transform your daily actions into 
              peaceful moments of growth.
            </HeroSubtitle>
            
            <ZenFeatures>
              <ZenFeature>
                <FeatureIcon>
                  <Sparkles size={24} />
                </FeatureIcon>
                <FeatureText>Mindful</FeatureText>
              </ZenFeature>
              <ZenFeature>
                <FeatureIcon>
                  <Sparkles size={24} />
                </FeatureIcon>
                <FeatureText>Peaceful</FeatureText>
              </ZenFeature>
              <ZenFeature>
                <FeatureIcon>
                  <Sparkles size={24} />
                </FeatureIcon>
                <FeatureText>Simple</FeatureText>
              </ZenFeature>
            </ZenFeatures>
            
            <CTAButtons>
              <ZenButton $size="lg" onClick={handleGetStarted}>
                <Plus size={20} />
                Begin Your Journey
              </ZenButton>
              <ZenButton $variant="secondary" $size="lg" onClick={handleSignIn}>
                <LogIn size={20} />
                Sign In
              </ZenButton>
            </CTAButtons>
          </HeroContent>
        </Container>
      </HeroSection>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleCloseSignInModal}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={handleCloseSignUpModal}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </>
  )
} 