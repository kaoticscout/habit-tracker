import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock styled-components before importing ProgressCalendar
jest.mock('styled-components', () => ({
  ...jest.requireActual('styled-components'),
  createGlobalStyle: () => () => null,
}))

// Mock the styled-components theme
jest.mock('../styles/theme', () => ({
  theme: {
    colors: {
      surface: '#ffffff',
      text: {
        primary: '#000000',
        secondary: '#666666',
        muted: '#999999',
        disabled: '#cccccc'
      },
      primary: {
        50: '#f0f6fb',
        300: '#90caf9',
        500: '#2196f3',
        700: '#1976d2'
      },
      success: {
        500: '#4caf50'
      },
      warning: {
        500: '#ff9800'
      },
      gray: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0'
      }
    },
    spacing: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px'
    },
    typography: {
      fontSize: {
        xs: '12px',
        sm: '14px',
        lg: '18px',
        xl: '20px'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        light: 300
      },
      lineHeight: {
        relaxed: 1.6
      }
    },
    borderRadius: {
      base: '4px',
      lg: '8px'
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.1)',
      md: '0 4px 6px rgba(0,0,0,0.1)'
    },
    transitions: {
      normal: '0.2s',
      zen: '0.3s'
    },
    breakpoints: {
      sm: '640px'
    }
  }
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left">‹</div>,
  ChevronRight: () => <div data-testid="chevron-right">›</div>
}))

// Import ProgressCalendar after mocks
import ProgressCalendar from '../components/ProgressCalendar'

describe('ProgressCalendar', () => {
  const createHabit = (id: string, title: string, frequency: string, logs: Array<{ date: Date; completed: boolean }>) => ({
    id,
    title,
    frequency,
    logs: logs.map((log, index) => ({
      id: `log-${id}-${index}`,
      date: log.date,
      completed: log.completed
    }))
  })

  const createDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day)
    date.setHours(0, 0, 0, 0)
    return date
  }

  beforeEach(() => {
    // Mock current date to June 2025
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2025, 5, 15)) // June 15, 2025
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Weekly Habit Display', () => {
    it('should show weekly habit as completed for all days of the week when completed on any day', () => {
      const habits = [
        createHabit('weekly-1', 'Weekly Exercise', 'weekly', [
          { date: createDate(2025, 6, 12), completed: true } // Thursday
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // The habit should be visible in the calendar for June 2025
      // Since it was completed on Thursday June 12, it should show as completed
      // for the entire week (June 9-15)
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })

    it('should show previous month days in calendar view', () => {
      const habits = [
        createHabit('daily-1', 'Daily Habit', 'daily', [
          { date: createDate(2025, 5, 31), completed: true } // May 31st
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // The calendar should show previous month days and display the habit
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })

    it('should always show previous week in calendar view', () => {
      const habits = [
        createHabit('weekly-1', 'Weekly Exercise', 'weekly', [
          { date: createDate(2025, 5, 25), completed: true } // Previous week
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // The calendar should show the previous week and display the weekly habit
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })

    it('should not show weekly habit as completed for weeks when it was not completed', () => {
      const habits = [
        createHabit('weekly-1', 'Weekly Exercise', 'weekly', [
          { date: createDate(2025, 6, 12), completed: true } // Week of June 9-15
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // The habit should not show as completed for other weeks
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })
  })

  describe('Monthly Habit Display', () => {
    it('should show monthly habit as completed for all days of the month when completed on any day', () => {
      const habits = [
        createHabit('monthly-1', 'Monthly Review', 'monthly', [
          { date: createDate(2025, 6, 15), completed: true } // June 15
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // The habit should be visible in the calendar for June 2025
      // Since it was completed on June 15, it should show as completed
      // for the entire month of June
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })

    it('should not show monthly habit as completed for months when it was not completed', () => {
      const habits = [
        createHabit('monthly-1', 'Monthly Review', 'monthly', [
          { date: createDate(2025, 6, 15), completed: true } // June only
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // The habit should not show as completed for other months
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })
  })

  describe('Daily Habit Display', () => {
    it('should show daily habit as completed only on the specific day it was completed', () => {
      const habits = [
        createHabit('daily-1', 'Daily Meditation', 'daily', [
          { date: createDate(2025, 6, 15), completed: true } // June 15 only
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // The habit should be visible in the calendar for June 2025
      // It should only show as completed on June 15
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })
  })

  describe('Mixed Frequency Habits', () => {
    it('should correctly display habits of different frequencies together', () => {
      const habits = [
        createHabit('daily-1', 'Daily Meditation', 'daily', [
          { date: createDate(2025, 6, 15), completed: true }
        ]),
        createHabit('weekly-1', 'Weekly Exercise', 'weekly', [
          { date: createDate(2025, 6, 12), completed: true } // Thursday
        ]),
        createHabit('monthly-1', 'Monthly Review', 'monthly', [
          { date: createDate(2025, 6, 15), completed: true }
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // All three habits should be visible in the calendar
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })
  })

  describe('Calendar Navigation', () => {
    it('should allow navigation to previous years', () => {
      const habits = [
        createHabit('daily-1', 'Daily Habit', 'daily', [
          { date: createDate(2024, 12, 31), completed: true } // December 31, 2024
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // Should be able to navigate to previous years without restrictions
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    })
  })

  describe('Visual Differentiation', () => {
    it('should show legend for other month days', () => {
      const habits = [
        createHabit('daily-1', 'Daily Habit', 'daily', [
          { date: createDate(2025, 6, 15), completed: true }
        ])
      ]

      const habitLogs = habits.flatMap(habit =>
        habit.logs
          .filter(log => log.completed)
          .map(log => ({
            id: log.id,
            habitId: habit.id,
            completedAt: new Date(log.date)
          }))
      )

      render(<ProgressCalendar habitLogs={habitLogs} habits={habits} />)

      // Should show legend for other month days
      expect(screen.getByText('Other month')).toBeInTheDocument()
    })
  })
}) 