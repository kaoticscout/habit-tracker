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
  frequency: string
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
        background: ${theme.colors.gray[50]};
        border: 1px solid ${theme.colors.gray[100]};
        opacity: 0.7;
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
  flex-direction: column;
  gap: 2px;
  width: 100%;
  max-width: 28px;
  align-items: center;
  justify-content: center;
  ${({ $totalSegments }) => $totalSegments === 0 && `visibility: hidden;`}
`

const ProgressRow = styled.div<{ $type: 'daily' | 'weekly' | 'monthly' }>`
  display: flex;
  gap: 2px;
  width: 100%;
  height: 5px;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: ${({ $type }) => {
    switch ($type) {
      case 'daily':
        return '#f0f6fb'; // soft blue
      case 'weekly':
        return '#f3f8f3'; // soft green
      case 'monthly':
        return '#fdf6ed'; // soft orange
    }
  }};
`

const ProgressSegment = styled.div<{ $isCompleted: boolean; $totalSegments: number; $frequency?: string }>`
  height: 5px;
  min-width: 4px;
  border-radius: 2px;
  flex: 1;
  transition: background 0.2s;
  background: ${({ $isCompleted, $frequency }) => {
    if (!$isCompleted) return 'transparent';
    switch ($frequency?.toLowerCase()) {
      case 'daily':
        return '#90caf9'; // pastel blue
      case 'weekly':
        return '#a5d6a7'; // pastel green
      case 'monthly':
        return '#ffd59e'; // pastel orange
      default:
        return '#90caf9';
    }
  }};
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

const LegendSegment = styled.div<{ $isCompleted: boolean; $frequency?: string }>`
  height: 3px;
  border-radius: 1px;
  flex: 1;
  background: ${({ $isCompleted, $frequency }) => {
    if ($isCompleted) {
      switch ($frequency?.toLowerCase()) {
        case 'daily':
          return theme.colors.primary[500]
        case 'weekly':
          return theme.colors.success[500]
        case 'monthly':
          return theme.colors.warning[500]
        default:
          return theme.colors.primary[500]
      }
    } else {
      return theme.colors.gray[200]
    }
  }};
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
  
  // Calculate the start of the calendar view (including previous month)
  // We want to show the full week that contains the first day of the month
  // PLUS the previous week to always show last week's progress
  const calendarStart = new Date(firstDayOfMonth)
  calendarStart.setDate(firstDayOfMonth.getDate() - firstDayWeekday - 7) // Go back one more week
  
  // Add days from previous month to fill the first two weeks (previous week + current week start)
  for (let i = 0; i < firstDayWeekday + 7; i++) {
    const date = new Date(calendarStart)
    date.setDate(calendarStart.getDate() + i)
    calendarDays.push({ date, isCurrentMonth: false })
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    calendarDays.push({ date, isCurrentMonth: true })
  }
  
  // Add days from next month to complete the last week
  const remainingCells = 7 - (calendarDays.length % 7)
  if (remainingCells < 7) {
    const lastDayOfCurrentMonth = new Date(currentYear, currentMonth, daysInMonth)
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(lastDayOfCurrentMonth)
      date.setDate(lastDayOfCurrentMonth.getDate() + i)
      calendarDays.push({ date, isCurrentMonth: false })
    }
  }
  
  // Get progress data for each day
  const getDayProgress = (date: Date | null) => {
    if (!date) return { 
      daily: { total: 0, completed: 0, habits: [] },
      weekly: { total: 0, completed: 0, habits: [] },
      monthly: { total: 0, completed: 0, habits: [] }
    }
    
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
    
    // Separate habits by frequency
    const dailyHabits = activeHabits.filter(h => h.frequency.toLowerCase() === 'daily')
    const weeklyHabits = activeHabits.filter(h => h.frequency.toLowerCase() === 'weekly')
    const monthlyHabits = activeHabits.filter(h => h.frequency.toLowerCase() === 'monthly')
    
    // Helper function to check completion for a habit on a specific date
    const checkHabitCompletion = (habit: Habit, targetDate: Date) => {
      const frequency = habit.frequency.toLowerCase()
      
      if (frequency === 'daily') {
        // For daily habits, check exact date match
        const dayLog = habit.logs.find(log => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === targetDate.getTime()
        })
        return dayLog?.completed || false
      } else if (frequency === 'weekly') {
        // For weekly habits, check if completed any time during the week containing targetDate
        const targetDayStart = new Date(targetDate)
        targetDayStart.setHours(0, 0, 0, 0)
        
        // Calculate Monday of the week containing targetDate
        const dayOfWeek = targetDayStart.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days to Monday
        const weekStart = new Date(targetDayStart)
        weekStart.setDate(targetDayStart.getDate() - daysFromMonday)
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6) // Sunday of this week
        weekEnd.setHours(23, 59, 59, 999)
        
        // Check if there's any completed log during this week
        const weekLog = habit.logs.find(log => {
          const logDate = new Date(log.date)
          return logDate >= weekStart && logDate <= weekEnd && log.completed
        })
        
        return !!weekLog
      } else if (frequency === 'monthly') {
        // For monthly habits, check if completed any time during the month containing targetDate
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
        monthStart.setHours(0, 0, 0, 0)
        
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        
        // Check if there's any completed log during this month
        const monthLog = habit.logs.find(log => {
          const logDate = new Date(log.date)
          return logDate >= monthStart && logDate <= monthEnd && log.completed
        })
        
        return !!monthLog
      }
      
      // Default fallback for other frequencies
      const dayLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === targetDate.getTime()
      })
      return dayLog?.completed || false
    }
    
    // Process each frequency type
    const processHabits = (habitList: Habit[]) => {
      const habitDetails = habitList.map(habit => {
        const completed = checkHabitCompletion(habit, dayStart)
        return {
          habitId: habit.id,
          habitTitle: habit.title,
          frequency: habit.frequency,
          completed
        }
      })
      
      const completed = habitDetails.filter(h => h.completed).length
      
      return {
        total: habitList.length,
        completed,
        habits: habitDetails
      }
    }
    
    return {
      daily: processHabits(dailyHabits),
      weekly: processHabits(weeklyHabits),
      monthly: processHabits(monthlyHabits)
    }
  }
  
  // Calculate stats for the full calendar view (including previous/next month days)
  const calendarStartDate = calendarDays[0]?.date
  const calendarEndDate = calendarDays[calendarDays.length - 1]?.date
  
  const calendarViewLogs = habitLogs.filter(log => {
    if (!calendarStartDate || !calendarEndDate) return false
    const logDate = new Date(log.completedAt)
    return logDate >= calendarStartDate && logDate <= calendarEndDate
  })
  
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
          >
            <ChevronLeft size={16} />
          </NavigationButton>
          <NavigationButton
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight size={16} />
          </NavigationButton>
        </div>
      </CalendarHeader>
      
      <SimpleExplanation>
        Each day shows separate progress rows for different habit types: daily habits (blue), weekly habits (green), and monthly habits (orange). Weekly and monthly habits show as completed for their entire period once completed. Previous/next month days have a gray background.
      </SimpleExplanation>
      
      <CalendarGrid>
        {dayLabels.map(day => (
          <DayLabel key={day.key}>{day.label}</DayLabel>
        ))}
        
        {calendarDays.map((day, index) => {
          const progress = getDayProgress(day.date)
          const totalHabits = progress.daily.total + progress.weekly.total + progress.monthly.total
          const completedHabits = progress.daily.completed + progress.weekly.completed + progress.monthly.completed
          const completionPercentage = totalHabits > 0 
            ? Math.round((completedHabits / totalHabits) * 100) 
            : 0
          
          // Create tooltip with all habit types
          const tooltipContent = totalHabits > 0 
            ? [
                `${completedHabits}/${totalHabits} habits completed (${completionPercentage}%)`,
                progress.daily.total > 0 ? `Daily: ${progress.daily.completed}/${progress.daily.total}` : null,
                progress.weekly.total > 0 ? `Weekly: ${progress.weekly.completed}/${progress.weekly.total}` : null,
                progress.monthly.total > 0 ? `Monthly: ${progress.monthly.completed}/${progress.monthly.total}` : null,
                ...progress.daily.habits.map((h: any) => `${h.completed ? '✓' : '○'} ${h.habitTitle}`),
                ...progress.weekly.habits.map((h: any) => `${h.completed ? '✓' : '○'} ${h.habitTitle}`),
                ...progress.monthly.habits.map((h: any) => `${h.completed ? '✓' : '○'} ${h.habitTitle}`)
              ].filter(Boolean).join('\n')
            : undefined
          
          return (
            <DayCell
              key={index}
              $isCurrentMonth={day.isCurrentMonth}
              $isToday={day.date ? isToday(day.date) : false}
              title={tooltipContent}
            >
              <DayNumber>{day.date?.getDate()}</DayNumber>
              <ProgressBar $totalSegments={totalHabits}>
                {/* Daily habits row */}
                {progress.daily.total > 0 && (
                  <ProgressRow $type="daily">
                    {Array.from({ length: progress.daily.total }, (_, i) => (
                      <ProgressSegment
                        key={`daily-${i}`}
                        $isCompleted={i < progress.daily.completed}
                        $totalSegments={progress.daily.total}
                        $frequency="daily"
                      />
                    ))}
                  </ProgressRow>
                )}
                
                {/* Weekly habits row */}
                {progress.weekly.total > 0 && (
                  <ProgressRow $type="weekly">
                    {Array.from({ length: progress.weekly.total }, (_, i) => (
                      <ProgressSegment
                        key={`weekly-${i}`}
                        $isCompleted={i < progress.weekly.completed}
                        $totalSegments={progress.weekly.total}
                        $frequency="weekly"
                      />
                    ))}
                  </ProgressRow>
                )}
                
                {/* Monthly habits row */}
                {progress.monthly.total > 0 && (
                  <ProgressRow $type="monthly">
                    {Array.from({ length: progress.monthly.total }, (_, i) => (
                      <ProgressSegment
                        key={`monthly-${i}`}
                        $isCompleted={i < progress.monthly.completed}
                        $totalSegments={progress.monthly.total}
                        $frequency="monthly"
                      />
                    ))}
                  </ProgressRow>
                )}
              </ProgressBar>
            </DayCell>
          )
        })}
      </CalendarGrid>
      
      <CalendarFooter>
        <Legend>
          <LegendItem>
            <LegendProgressBar>
              <LegendSegment $isCompleted={true} $frequency="daily" />
              <LegendSegment $isCompleted={true} $frequency="weekly" />
              <LegendSegment $isCompleted={false} />
            </LegendProgressBar>
            <span>Progress bar (2/3 habits)</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color={theme.colors.primary[500]} />
            <span>Daily</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color={theme.colors.success[500]} />
            <span>Weekly</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color={theme.colors.warning[500]} />
            <span>Monthly</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color="transparent" $border={`2px solid ${theme.colors.primary[300]}`} />
            <span>Today</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color={theme.colors.gray[50]} $border={`1px solid ${theme.colors.gray[100]}`} />
            <span>Other month</span>
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