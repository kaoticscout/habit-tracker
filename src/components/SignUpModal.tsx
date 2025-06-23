'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { X } from 'lucide-react'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignIn: () => void
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing[4]};
  backdrop-filter: blur(2px);
  animation: zenOverlayFadeIn 0.3s ease-out;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]};
  }
`

const Modal = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[10]};
  max-width: 380px;
  width: 100%;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  animation: zenSlideIn 0.4s ease-out;
  position: relative;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[8]};
    max-width: 100%;
    border-radius: ${theme.borderRadius.lg};
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  background: none;
  border: none;
  color: ${theme.colors.text.disabled};
  cursor: pointer;
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  transition: all ${theme.transitions.normal};
  min-height: 44px;
  min-width: 44px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    top: ${theme.spacing[3]};
    right: ${theme.spacing[3]};
  }
  
  &:hover {
    color: ${theme.colors.text.secondary};
    background-color: ${theme.colors.gray[50]};
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  margin-top: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[5]};
    margin-top: ${theme.spacing[3]};
  }
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[1]};
  }
`

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.normal};
  letter-spacing: 0.01em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
  }
`

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border: none;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background-color: transparent;
  transition: all ${theme.transitions.normal};
  min-height: 48px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 52px;
  }
  
  &:focus {
    outline: none;
    border-bottom-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[50]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
    font-weight: ${theme.typography.fontWeight.normal};
  }
`

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing[3]};
  background-color: ${theme.colors.error}08;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
    padding: ${theme.spacing[2]};
  }
`

const SuccessMessage = styled.div`
  color: ${theme.colors.success};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing[3]};
  background-color: ${theme.colors.success}08;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
    padding: ${theme.spacing[2]};
  }
`

const SignUpButton = styled.button`
  width: 100%;
  background-color: ${theme.colors.primary[500]};
  border: none;
  color: white;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.normal};
  margin-top: ${theme.spacing[4]};
  min-height: 48px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]};
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 52px;
    margin-top: ${theme.spacing[3]};
  }
  
  &:hover {
    background-color: ${theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: 0 4px 16px ${theme.colors.primary[200]};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[200]};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing[6]} 0;
  color: ${theme.colors.text.disabled};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin: ${theme.spacing[4]} 0;
    font-size: ${theme.typography.fontSize.xs};
  }
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${theme.colors.gray[100]};
  }
  
  &::before {
    margin-right: ${theme.spacing[4]};
  }
  
  &::after {
    margin-left: ${theme.spacing[4]};
  }
`

const SwitchPrompt = styled.div`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
  }
`

const SwitchLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  margin-left: ${theme.spacing[1]};
  transition: color ${theme.transitions.fast};
  min-height: 44px;
  min-width: 44px;
  
  &:hover {
    color: ${theme.colors.primary[700]};
  }
`

export default function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (response.ok) {
        setSuccess('Account created successfully! You can now sign in.')
        setName('')
        setEmail('')
        setPassword('')
        setTimeout(() => {
          onClose()
          onSwitchToSignIn()
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setName('')
    setEmail('')
    setPassword('')
    setError('')
    setSuccess('')
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={handleClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <X size={20} />
        </CloseButton>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <SignUpButton 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </SignUpButton>
        </Form>

        <Divider>or</Divider>

        <SwitchPrompt>
          Already have an account?
          <SwitchLink onClick={onSwitchToSignIn}>
            Sign in
          </SwitchLink>
        </SwitchPrompt>
      </Modal>
    </Overlay>
  )
} 