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
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing[4]};
`

const Modal = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[8]};
  max-width: 360px;
  width: 100%;
  box-shadow: ${theme.shadows.sm};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[8]};
`

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.text.primary};
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.disabled};
  cursor: pointer;
  padding: ${theme.spacing[1]};
  
  &:hover {
    color: ${theme.colors.text.secondary};
  }
`

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[4]};
  border: none;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background-color: transparent;
  margin-bottom: ${theme.spacing[6]};
  
  &:focus {
    outline: none;
    border-bottom-color: ${theme.colors.text.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[6]};
  text-align: center;
`

const SuccessMessage = styled.div`
  color: ${theme.colors.success};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[6]};
  text-align: center;
`

const SignUpButton = styled.button`
  width: 100%;
  background: none;
  border: 1px solid ${theme.colors.gray[200]};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.base};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.text.primary};
    color: ${theme.colors.text.primary};
  }
  
  &:disabled {
    color: ${theme.colors.text.disabled};
    border-color: ${theme.colors.gray[100]};
    cursor: not-allowed;
  }
`

const SwitchPrompt = styled.div`
  text-align: center;
  color: ${theme.colors.text.disabled};
  font-size: ${theme.typography.fontSize.sm};
`

const SwitchLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  margin-left: ${theme.spacing[1]};
  
  &:hover {
    color: ${theme.colors.text.secondary};
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
        <Header>
          <Title>Create account</Title>
          <CloseButton onClick={handleClose}>
            <X size={18} />
          </CloseButton>
        </Header>

        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <SignUpButton 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </SignUpButton>
        </form>

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