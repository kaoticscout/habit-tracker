'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { User, Lock, Mail, ArrowRight } from 'lucide-react'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing[4]};
`

const FormCard = styled(Card)`
  max-width: 400px;
  width: 100%;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`

const InputGroup = styled.div`
  position: relative;
`

const InputIcon = styled.div`
  position: absolute;
  left: ${theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.disabled};
  z-index: 1;
`

const StyledInput = styled(Input)`
  padding-left: ${theme.spacing[10]};
`

const ToggleText = styled.p`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  text-decoration: underline;
  
  &:hover {
    color: ${theme.colors.primary[700]};
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing[6]} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${theme.colors.gray[300]};
  }
  
  span {
    padding: 0 ${theme.spacing[4]};
    color: ${theme.colors.text.disabled};
    font-size: ${theme.typography.fontSize.sm};
  }
`

const ContinueWithoutAccount = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  text-decoration: underline;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  width: 100%;
  padding: ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
    color: ${theme.colors.text.primary};
  }
`

export default function GetStartedPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement authentication logic
    console.log('Form submitted:', { isLogin, formData })
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleContinueWithoutAccount = () => {
    router.push('/dashboard')
  }

  return (
    <Container>
      <FormCard>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: theme.spacing[6],
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary
        }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        
        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <InputGroup>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <StyledInput
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required={!isLogin}
              />
            </InputGroup>
          )}
          
          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <StyledInput
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <StyledInput
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
            />
          </InputGroup>
          
          <Button type="submit" $size="lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </Form>
        
        <ToggleText style={{ marginTop: theme.spacing[6] }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <ToggleButton 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </ToggleButton>
        </ToggleText>

        <Divider>
          <span>or</span>
        </Divider>

        <ContinueWithoutAccount 
          type="button" 
          onClick={handleContinueWithoutAccount}
        >
          Continue without account
          <ArrowRight size={16} />
        </ContinueWithoutAccount>
      </FormCard>
    </Container>
  )
} 