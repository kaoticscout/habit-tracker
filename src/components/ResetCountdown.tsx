'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

const CountdownContainer = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[4]};
  }
`

const CountdownTime = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
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
        <CountdownTime>Next reset in --:--:--</CountdownTime>
      </CountdownContainer>
    )
  }

  const formatTime = (time: TimeRemaining): string => {
    const { hours, minutes, seconds } = time
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <CountdownContainer>
      <CountdownTime>
        Next reset in {formatTime(timeRemaining)}
      </CountdownTime>
    </CountdownContainer>
  )
} 