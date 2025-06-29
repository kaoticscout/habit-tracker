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

interface Habit {
  id: string
  title: string
  logs: Array<{
    id: string
    date: Date
    completed: boolean
  }>
}

interface ProgressCalendarProps {
  habitLogs: HabitLog[]
  habits: Habit[] // Add habits prop to know total number of habits
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

const DayCell = styled.div<{ $isCurrentMonth: boolean; $isToday: boolean }>`
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.base};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  position: relative;
  padding: ${theme.spacing[1]};
  gap: 2px;
  
  ${({ $isCurrentMonth, $isToday }) => {
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

const DayNumber = styled.div`
  margin-bottom: 2px;
`

const ProgressBar = styled.div<{ $totalSegments: number }>`
  display: flex;
  gap: 1px;
  width: 100%;
  max-width: 28px;
  height: 3px;
  align-items: center;
  justify-content: center;
  
  ${({ $totalSegments }) => $totalSegments === 0 && `
    visibility: hidden;
  `}
`

const ProgressSegment = styled.div<{ $isCompleted: boolean; $totalSegments: number }>`
  height: 3px;
  border-radius: 1px;
  flex: 1;
  transition: all ${theme.transitions.normal};
  
  ${({ $isCompleted, $totalSegments }) => {
    // Adjust minimum width based on number of segments
    const minWidth = $totalSegments <= 3 ? '6px' : $totalSegments <= 5 ? '4px' : '2px';
    
    return `
      min-width: ${minWidth};
      background: ${$isCompleted ? theme.colors.primary[500] : theme.colors.gray[200]};
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

const LegendProgressBar = styled.div`
  display: flex;
  gap: 1px;
  width: 16px;
  height: 3px;
`

const LegendSegment = styled.div<{ $isCompleted: boolean }>`
  height: 3px;
  border-radius: 1px;
  flex: 1;
  background: ${({ $isCompleted }) => $isCompleted ? theme.colors.primary[500] : theme.colors.gray[200]};
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

export default function ProgressCalendar({ habitLogs, habits, className }: ProgressCalendarProps) {
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
  
  // Get progress data for each day
  const getDayProgress = (date: Date | null) => {
    if (!date) return { totalHabits: 0, completedHabits: 0, habitDetails: [] }
    
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    // Get all habits that should be tracked on this date
    const activeHabits = habits.filter(habit => {
      // Check if habit was created before or on this date
      const habitCreated = new Date(habit.logs[0]?.date || date)
      return habitCreated <= dayEnd
    })
    
    // For each habit, check if it was completed on this date
    const habitDetails = activeHabits.map(habit => {
      const dayLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === dayStart.getTime()
      })
      
      return {
        habitId: habit.id,
        habitTitle: habit.title,
        completed: dayLog?.completed || false
      }
    })
    
    const completedHabits = habitDetails.filter(h => h.completed).length
    
    return {
      totalHabits: activeHabits.length,
      completedHabits,
      habitDetails
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
  
  const dayLabels = [
    { label: 'S', key: 'sun' },
    { label: 'M', key: 'mon' },
    { label: 'T', key: 'tue' },
    { label: 'W', key: 'wed' },
    { label: 'T', key: 'thu' },
    { label: 'F', key: 'fri' },
    { label: 'S', key: 'sat' }
  ]
  
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
        Each progress bar shows your habit completion for that day. Blue segments represent completed habits.
      </SimpleExplanation>
      
      <CalendarGrid>
        {dayLabels.map(day => (
          <DayLabel key={day.key}>{day.label}</DayLabel>
        ))}
        
        {calendarDays.map((day, index) => {
          const progress = getDayProgress(day.date)
          const completionPercentage = progress.totalHabits > 0 
            ? Math.round((progress.completedHabits / progress.totalHabits) * 100) 
            : 0
          
          return (
            <DayCell
              key={index}
              $isCurrentMonth={day.isCurrentMonth}
              $isToday={day.date ? isToday(day.date) : false}
              title={progress.totalHabits > 0 
                ? `${progress.completedHabits}/${progress.totalHabits} habits completed (${completionPercentage}%)\n${progress.habitDetails.map(h => `${h.completed ? '✓' : '○'} ${h.habitTitle}`).join('\n')}`
                : undefined
              }
            >
              <DayNumber>{day.date?.getDate()}</DayNumber>
              <ProgressBar $totalSegments={progress.totalHabits}>
                {Array.from({ length: progress.totalHabits }, (_, i) => (
                  <ProgressSegment
                    key={i}
                    $isCompleted={i < progress.completedHabits}
                    $totalSegments={progress.totalHabits}
                  />
                ))}
              </ProgressBar>
            </DayCell>
          )
        })}
      </CalendarGrid>
      
      <CalendarFooter>
        <Legend>
          <LegendItem>
            <LegendProgressBar>
              <LegendSegment $isCompleted={true} />
              <LegendSegment $isCompleted={true} />
              <LegendSegment $isCompleted={false} />
            </LegendProgressBar>
            <span>Progress bar (2/3 habits)</span>
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