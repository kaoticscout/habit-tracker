'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { Clock, RefreshCw } from 'lucide-react'

const CountdownContainer = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.primary[25]} 100%);
  border: 1px solid ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[6]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[3]};
  text-align: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[4]};
    gap: ${theme.spacing[2]};
    flex-direction: column;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      ${theme.colors.primary[200]} 0%, 
      ${theme.colors.primary[400]} 50%, 
      ${theme.colors.primary[200]} 100%);
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`

const CountdownIcon = styled.div`
  color: ${theme.colors.primary[600]};
  display: flex;
  align-items: center;
  opacity: 0.8;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: 14px;
  }
`

const CountdownContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing[1]};
  }
`

const CountdownLabel = styled.div`
  color: ${theme.colors.primary[700]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
  }
`

const CountdownTime = styled.div`
  color: ${theme.colors.primary[800]};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: 0.05em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.base};
  }
`

const CountdownSubtext = styled.div`
  color: ${theme.colors.primary[600]};
  font-size: ${theme.typography.fontSize.xs};
  opacity: 0.8;
  margin-top: ${theme.spacing[1]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-top: ${theme.spacing[1]};
  }
`

interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
}

export function ResetCountdown() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ hours: 0, minutes: 0, seconds: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0) // Set to midnight
      
      const timeDiff = tomorrow.getTime() - now.getTime()
      
      if (timeDiff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 }
      }
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
      
      return { hours, minutes, seconds }
    }

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining())

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [isClient])

  if (!isClient) {
    // Prevent hydration mismatch by showing a placeholder during SSR
    return (
      <CountdownContainer>
        <CountdownIcon>
          <Clock size={18} />
        </CountdownIcon>
        <CountdownContent>
          <CountdownLabel>Next reset in</CountdownLabel>
          <CountdownTime>--:--:--</CountdownTime>
        </CountdownContent>
      </CountdownContainer>
    )
  }

  const formatTime = (time: TimeRemaining): string => {
    const { hours, minutes, seconds } = time
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getResetMessage = (): string => {
    const { hours, minutes } = timeRemaining
    
    if (hours === 0 && minutes === 0) {
      return "Reset happening very soon!"
    } else if (hours === 0 && minutes < 5) {
      return "Reset coming up in a few minutes"
    } else if (hours === 0) {
      return "Reset in less than an hour"
    } else if (hours === 1) {
      return "Reset in about an hour"
    } else if (hours < 6) {
      return "Reset in a few hours"
    } else {
      return "Reset at midnight tonight"
    }
  }

  const isAlmostTime = timeRemaining.hours === 0 && timeRemaining.minutes < 5

  return (
    <CountdownContainer>
      <CountdownIcon>
        {isAlmostTime ? (
          <RefreshCw size={18} style={{ animation: 'spin 2s linear infinite' }} />
        ) : (
          <Clock size={18} />
        )}
      </CountdownIcon>
      <CountdownContent>
        <div>
          <CountdownLabel>Next reset in</CountdownLabel>
          <CountdownTime style={{ color: isAlmostTime ? theme.colors.primary[900] : undefined }}>
            {formatTime(timeRemaining)}
          </CountdownTime>
          <CountdownSubtext>{getResetMessage()}</CountdownSubtext>
        </div>
      </CountdownContent>
    </CountdownContainer>
  )
} 