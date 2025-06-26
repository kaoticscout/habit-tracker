'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { Clock, RefreshCw, Play } from 'lucide-react'

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

const ManualResetButton = styled.button`
  background: ${theme.colors.primary[500]};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  margin-left: ${theme.spacing[3]};
  
  &:hover {
    background: ${theme.colors.primary[600]};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-left: 0;
    margin-top: ${theme.spacing[2]};
    font-size: ${theme.typography.fontSize.xs};
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
  }
`

interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
}

interface ResetCountdownProps {
  onManualReset?: () => void
}

export function ResetCountdown({ onManualReset }: ResetCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ hours: 0, minutes: 0, seconds: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date()
      
      // Calculate next 8 AM UTC (when the cron job runs)
      const nextReset = new Date()
      nextReset.setUTCHours(8, 0, 0, 0) // 8 AM UTC
      
      // If it's already past 8 AM UTC today, set to tomorrow's 8 AM UTC
      if (now >= nextReset) {
        nextReset.setUTCDate(nextReset.getUTCDate() + 1)
      }
      
      const timeDiff = nextReset.getTime() - now.getTime()
      
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
      return "Reset at 8 AM UTC daily"
    }
  }

  const isAlmostTime = timeRemaining.hours === 0 && timeRemaining.minutes < 5
  const isTimeForReset = timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0

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
          <CountdownLabel>
            {isTimeForReset ? "Reset time!" : "Next reset in"}
          </CountdownLabel>
          <CountdownTime style={{ color: isAlmostTime ? theme.colors.primary[900] : undefined }}>
            {isTimeForReset ? "00:00:00" : formatTime(timeRemaining)}
          </CountdownTime>
          <CountdownSubtext>
            {isTimeForReset 
              ? "The daily reset should run automatically, or trigger it manually below"
              : getResetMessage()
            }
          </CountdownSubtext>
        </div>
        {(isTimeForReset || isAlmostTime) && onManualReset && (
          <ManualResetButton onClick={onManualReset}>
            <Play size={14} />
            {isTimeForReset ? "Run Reset Now" : "Manual Reset"}
          </ManualResetButton>
        )}
      </CountdownContent>
    </CountdownContainer>
  )
} 