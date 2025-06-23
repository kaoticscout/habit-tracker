'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HabitLog {
  id: string
  habitId: string
  completedAt: Date
}

interface ProgressCalendarProps {
  habitLogs: HabitLog[]
  className?: string
}

const CalendarContainer = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.zen};
  
  &:hover {
    box-shadow: ${theme.shadows.md};
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[4]};
  }
`

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[4]};
  }
`

const MonthTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.light};
  color: ${theme.colors.text.primary};
  margin: 0;
  letter-spacing: -0.02em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`

const NavigationButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.muted};
  cursor: pointer;
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.base};
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${theme.colors.text.primary};
    background: ${theme.colors.gray[50]};
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${theme.spacing[1]};
  margin-bottom: ${theme.spacing[4]};
`

const DayLabel = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.muted};
  font-weight: ${theme.typography.fontWeight.normal};
  padding: ${theme.spacing[2]} 0;
  letter-spacing: 0.05em;
`

const DayCell = styled.div<{ $isCurrentMonth: boolean; $isToday: boolean; $hasActivity: boolean; $activityLevel: number }>`
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.base};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  position: relative;
  
  ${({ $isCurrentMonth, $isToday, $hasActivity, $activityLevel }) => {
    if (!$isCurrentMonth) {
      return `
        color: ${theme.colors.text.disabled};
        background: transparent;
      `
    }
    
    if ($isToday) {
      return `
        color: ${theme.colors.primary[700]};
        background: ${theme.colors.primary[50]};
        border: 2px solid ${theme.colors.primary[300]};
        font-weight: ${theme.typography.fontWeight.medium};
      `
    }
    
    if ($hasActivity) {
      // Show different intensity levels based on number of habits completed
      let backgroundColor, textColor, fontWeight, boxShadow
      
      if ($activityLevel >= 5) {
        // High activity - 5+ habits
        backgroundColor = theme.colors.primary[600]
        textColor = 'white'
        fontWeight = theme.typography.fontWeight.semibold
        boxShadow = '0 2px 6px rgba(14, 165, 233, 0.3)'
      } else if ($activityLevel >= 3) {
        // Medium-high activity - 3-4 habits
        backgroundColor = theme.colors.primary[500]
        textColor = 'white'
        fontWeight = theme.typography.fontWeight.medium
        boxShadow = '0 1px 4px rgba(14, 165, 233, 0.25)'
      } else if ($activityLevel >= 2) {
        // Medium activity - 2 habits
        backgroundColor = theme.colors.primary[400]
        textColor = 'white'
        fontWeight = theme.typography.fontWeight.medium
        boxShadow = '0 1px 3px rgba(14, 165, 233, 0.2)'
      } else {
        // Low activity - 1 habit
        backgroundColor = theme.colors.primary[300]
        textColor = 'white'
        fontWeight = theme.typography.fontWeight.normal
        boxShadow = '0 1px 2px rgba(14, 165, 233, 0.15)'
      }
      
      return `
        color: ${textColor};
        background: ${backgroundColor};
        font-weight: ${fontWeight};
        box-shadow: ${boxShadow};
      `
    }
    
    return `
      color: ${theme.colors.text.secondary};
      background: transparent;
      border: 1px solid ${theme.colors.gray[100]};
      
      &:hover {
        background: ${theme.colors.gray[50]};
        border-color: ${theme.colors.gray[200]};
      }
    `
  }}
`

const CalendarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.gray[100]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${theme.spacing[3]};
    align-items: flex-start;
  }
`

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[3]};
  }
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.muted};
`

const LegendDot = styled.div<{ $color: string; $border?: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: ${({ $border }) => $border || 'none'};
`

const Stats = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[3]};
  }
`

const Stat = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`

const StatLabel = styled.div`
  color: ${theme.colors.text.muted};
  font-size: ${theme.typography.fontSize.xs};
`

const SimpleExplanation = styled.div`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[4]};
  line-height: ${theme.typography.lineHeight.relaxed};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
    margin-bottom: ${theme.spacing[3]};
  }
`

export default function ProgressCalendar({ habitLogs, className }: ProgressCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const firstDayWeekday = firstDayOfMonth.getDay()
  
  // Generate calendar days
  const calendarDays = []
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push({ date: null, isCurrentMonth: false })
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    calendarDays.push({ date, isCurrentMonth: true })
  }
  
  // Add empty cells to complete the grid (7 columns)
  const remainingCells = 7 - (calendarDays.length % 7)
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.push({ date: null, isCurrentMonth: false })
    }
  }
  
  // Get activity data for each day
  const getDayActivity = (date: Date | null) => {
    if (!date) return { hasActivity: false, activityLevel: 0 }
    
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    const dayLogs = habitLogs.filter(log => {
      const logDate = new Date(log.completedAt)
      return logDate >= dayStart && logDate <= dayEnd
    })
    
    return {
      hasActivity: dayLogs.length > 0,
      activityLevel: dayLogs.length
    }
  }
  
  // Calculate stats
  const currentMonthLogs = habitLogs.filter(log => {
    const logDate = new Date(log.completedAt)
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear
  })
  
  const totalDays = daysInMonth
  const activeDays = new Set(currentMonthLogs.map(log => {
    const date = new Date(log.completedAt)
    return date.getDate()
  })).size
  
  const completionRate = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0
  const totalCompletions = currentMonthLogs.length
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }
  
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  
  return (
    <CalendarContainer className={className}>
      <CalendarHeader>
        <MonthTitle>{formatMonth(currentDate)}</MonthTitle>
        <div style={{ display: 'flex', gap: theme.spacing[1] }}>
          <NavigationButton
            onClick={() => navigateMonth('prev')}
            disabled={currentMonth === 0 && currentYear === 2024}
          >
            <ChevronLeft size={16} />
          </NavigationButton>
          <NavigationButton
            onClick={() => navigateMonth('next')}
            disabled={currentMonth === 11 && currentYear === 2030}
          >
            <ChevronRight size={16} />
          </NavigationButton>
        </div>
      </CalendarHeader>
      
      <SimpleExplanation>
        Darker blue shows more habits completed that day. Today is highlighted with a border.
      </SimpleExplanation>
      
      <CalendarGrid>
        {dayLabels.map(label => (
          <DayLabel key={label}>{label}</DayLabel>
        ))}
        
        {calendarDays.map((day, index) => {
          const activity = getDayActivity(day.date)
          return (
            <DayCell
              key={index}
              $isCurrentMonth={day.isCurrentMonth}
              $isToday={day.date ? isToday(day.date) : false}
              $hasActivity={activity.hasActivity}
              $activityLevel={activity.activityLevel}
              title={activity.hasActivity ? `${activity.activityLevel} habit${activity.activityLevel > 1 ? 's' : ''} completed` : undefined}
            >
              {day.date?.getDate()}
              {activity.hasActivity && activity.activityLevel > 1 && (
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  opacity: 0.9
                }}>
                  {activity.activityLevel}
                </div>
              )}
            </DayCell>
          )
        })}
      </CalendarGrid>
      
      <CalendarFooter>
        <Legend>
          <LegendItem>
            <LegendDot $color={theme.colors.primary[300]} />
            <span>Fewer habits</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color={theme.colors.primary[600]} />
            <span>More habits</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color="transparent" $border={`2px solid ${theme.colors.primary[300]}`} />
            <span>Today</span>
          </LegendItem>
        </Legend>
        
        <Stats>
          <Stat>
            <StatValue>{completionRate}%</StatValue>
            <StatLabel>Days active</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{activeDays}</StatValue>
            <StatLabel>Days with habits</StatLabel>
          </Stat>
          <Stat>
            <StatValue>{totalCompletions}</StatValue>
            <StatLabel>Total completions</StatLabel>
          </Stat>
        </Stats>
      </CalendarFooter>
    </CalendarContainer>
  )
} 