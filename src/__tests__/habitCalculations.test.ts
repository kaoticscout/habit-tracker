import { describe, it, expect } from '@jest/globals'

// Mock habit interfaces
interface HabitLog {
  id: string
  date: Date
  completed: boolean
}

interface Habit {
  id: string
  title: string
  frequency: string
  logs: HabitLog[]
  currentStreak?: number
  bestStreak?: number
}

// Helper function to create a date at midnight in local timezone
const createLocalDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month - 1, day) // month is 0-indexed
}

// Helper function to create a date from ISO string
const createDateFromISO = (isoString: string): Date => {
  return new Date(isoString)
}

// Weekly calculation logic (extracted from component)
const calculateWeeklyCompletion = (habit: Habit, today: Date): boolean => {
  const startOfWeek = new Date(today)
  
  // Calculate Monday of this week (handle Sunday = 0 case)
  const dayOfWeek = today.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startOfWeek.setDate(today.getDate() - daysFromMonday)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  // Check if there's any completed log this week using string-based comparison
  const thisWeekLogs = habit.logs.filter(log => {
    const logDate = new Date(log.date)
    
    // Use date strings to avoid timezone comparison issues
    const logDateStr = logDate.toISOString().split('T')[0]
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0]
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0]
    
    const isInWeek = logDateStr >= startOfWeekStr && logDateStr <= endOfWeekStr
    const isCompleted = log.completed
    
    return isInWeek && isCompleted
  })
  
  return thisWeekLogs.length > 0
}

// Daily calculation logic (extracted from component)
const calculateDailyCompletion = (habit: Habit, today: Date): boolean => {
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Find log that matches today's date
  const todayLog = habit.logs.find(log => {
    const logDate = new Date(log.date)
    
    // Compare using date strings (YYYY-MM-DD) to avoid timezone issues
    const logDateStr = logDate.toISOString().split('T')[0]
    const todayDateStr = todayOnly.toISOString().split('T')[0]
    
    return logDateStr === todayDateStr
  })
  
  return todayLog ? todayLog.completed : false
}

describe('Habit Calculations', () => {
  describe('Weekly Habit Calculations', () => {
    describe('Week Boundary Calculations', () => {
      it('should correctly identify Sunday as part of current week', () => {
        const sunday = createLocalDate(2025, 6, 29) // Sunday June 29, 2025
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'weekly',
          logs: [
            {
              id: '1',
              date: createLocalDate(2025, 6, 29),
              completed: true
            }
          ]
        }
        
        const result = calculateWeeklyCompletion(habit, sunday)
        expect(result).toBe(true)
      })
      
      it('should include all days Monday-Sunday in same week', () => {
        const daysOfWeek = [
          createLocalDate(2025, 6, 23), // Monday
          createLocalDate(2025, 6, 24), // Tuesday
          createLocalDate(2025, 6, 25), // Wednesday
          createLocalDate(2025, 6, 26), // Thursday
          createLocalDate(2025, 6, 27), // Friday
          createLocalDate(2025, 6, 28), // Saturday
          createLocalDate(2025, 6, 29)  // Sunday
        ]
        
        daysOfWeek.forEach((date, index) => {
          const habit: Habit = {
            id: 'test',
            title: 'Test Habit',
            frequency: 'weekly',
            logs: [
              {
                id: '1',
                date: createLocalDate(2025, 6, 25), // Wednesday
                completed: true
              }
            ]
          }
          
          const result = calculateWeeklyCompletion(habit, date)
          expect(result).toBe(true)
        })
      })
      
      it('should not include logs from previous week', () => {
        const currentWeekSunday = createLocalDate(2025, 6, 29) // Sunday June 29
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'weekly',
          logs: [
            {
              id: '1',
              date: createLocalDate(2025, 6, 22), // Previous Sunday
              completed: true
            }
          ]
        }
        
        const result = calculateWeeklyCompletion(habit, currentWeekSunday)
        expect(result).toBe(false)
      })
      
      it('should return false when week has only incomplete logs', () => {
        const today = createLocalDate(2025, 6, 25) // Wednesday
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'weekly',
          logs: [
            {
              id: '1',
              date: createLocalDate(2025, 6, 24), // Tuesday - not completed
              completed: false
            },
            {
              id: '2',
              date: createLocalDate(2025, 6, 25), // Wednesday - not completed
              completed: false
            }
          ]
        }
        
        const result = calculateWeeklyCompletion(habit, today)
        expect(result).toBe(false)
      })
    })
    
    describe('Timezone Handling', () => {
      it('should work correctly with UTC dates', () => {
        const today = createLocalDate(2025, 6, 29) // Sunday
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'weekly',
          logs: [
            {
              id: '1',
              date: createDateFromISO('2025-06-29T00:00:00.000Z'), // UTC Sunday
              completed: true
            }
          ]
        }
        
        const result = calculateWeeklyCompletion(habit, today)
        expect(result).toBe(true)
      })
      
      it('should work correctly with timezone-offset dates', () => {
        const today = createLocalDate(2025, 6, 29) // Sunday
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'weekly',
          logs: [
            {
              id: '1',
              date: createDateFromISO('2025-06-29T07:00:00.000Z'), // UTC+7 Sunday
              completed: true
            }
          ]
        }
        
        const result = calculateWeeklyCompletion(habit, today)
        expect(result).toBe(true)
      })
    })

    describe('Production Bug Scenario', () => {
      it('should handle the exact production scenario from logs', () => {
        // This recreates the exact scenario from your production logs
        const sunday = createLocalDate(2025, 6, 29) // Sunday June 29
        const habit: Habit = {
          id: 'test',
          title: 'Relationship Check-in',
          frequency: 'weekly',
          logs: [
            {
              id: '1',
              date: createDateFromISO('2025-06-29T07:00:00.000Z'),
              completed: true
            },
            {
              id: '2',
              date: createDateFromISO('2025-06-29T00:00:00.000Z'),
              completed: false
            },
            {
              id: '3',
              date: createDateFromISO('2025-06-26T00:00:00.000Z'),
              completed: true
            },
            {
              id: '4',
              date: createDateFromISO('2025-06-24T00:00:00.000Z'),
              completed: false
            },
            {
              id: '5',
              date: createDateFromISO('2025-06-23T00:00:00.000Z'),
              completed: true
            }
          ]
        }
        
        const result = calculateWeeklyCompletion(habit, sunday)
        expect(result).toBe(true) // Should find completed logs from this week (June 23-29)
      })
    })
  })

  describe('Daily Habit Calculations', () => {
    describe('Date Matching', () => {
      it('should match exact date', () => {
        const today = createLocalDate(2025, 6, 29)
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'daily',
          logs: [
            {
              id: '1',
              date: createLocalDate(2025, 6, 29),
              completed: true
            }
          ]
        }
        
        const result = calculateDailyCompletion(habit, today)
        expect(result).toBe(true)
      })
      
      it('should not match different dates', () => {
        const today = createLocalDate(2025, 6, 29)
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'daily',
          logs: [
            {
              id: '1',
              date: createLocalDate(2025, 6, 28), // Yesterday
              completed: true
            }
          ]
        }
        
        const result = calculateDailyCompletion(habit, today)
        expect(result).toBe(false)
      })
      
      it('should handle timezone differences correctly', () => {
        const today = createLocalDate(2025, 6, 29)
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'daily',
          logs: [
            {
              id: '1',
              date: createDateFromISO('2025-06-29T07:00:00.000Z'), // Different timezone, same date
              completed: true
            }
          ]
        }
        
        const result = calculateDailyCompletion(habit, today)
        expect(result).toBe(true)
      })
      
      it('should return false for incomplete log', () => {
        const today = createLocalDate(2025, 6, 29)
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'daily',
          logs: [
            {
              id: '1',
              date: createLocalDate(2025, 6, 29),
              completed: false
            }
          ]
        }
        
        const result = calculateDailyCompletion(habit, today)
        expect(result).toBe(false)
      })
      
      it('should return false when no log exists for today', () => {
        const today = createLocalDate(2025, 6, 29)
        const habit: Habit = {
          id: 'test',
          title: 'Test Habit',
          frequency: 'daily',
          logs: []
        }
        
        const result = calculateDailyCompletion(habit, today)
        expect(result).toBe(false)
      })
    })
  })

  describe('Week Boundary Edge Cases', () => {
    it('should handle month boundaries correctly', () => {
      const endOfJune = createLocalDate(2025, 6, 29) // Sunday June 29
      const habit: Habit = {
        id: 'test',
        title: 'Test Habit',
        frequency: 'weekly',
        logs: [
          {
            id: '1',
            date: createLocalDate(2025, 6, 23), // Monday June 23 (same week)
            completed: true
          },
          {
            id: '2',
            date: createLocalDate(2025, 7, 1), // Tuesday July 1 (next week)
            completed: true
          }
        ]
      }
      
      const result = calculateWeeklyCompletion(habit, endOfJune)
      expect(result).toBe(true) // Should only find June 23 log
    })
    
    it('should handle year boundaries correctly', () => {
      const endOfYear = createLocalDate(2024, 12, 29) // Sunday Dec 29, 2024
      const habit: Habit = {
        id: 'test',
        title: 'Test Habit',
        frequency: 'weekly',
        logs: [
          {
            id: '1',
            date: createLocalDate(2024, 12, 23), // Monday Dec 23 (same week)
            completed: true
          },
          {
            id: '2',
            date: createLocalDate(2025, 1, 1), // Wednesday Jan 1 (next week)
            completed: true
          }
        ]
      }
      
      const result = calculateWeeklyCompletion(habit, endOfYear)
      expect(result).toBe(true) // Should only find Dec 23 log
    })
  })

  describe('Week Calculation Helper Functions', () => {
    const getWeekBoundaries = (date: Date) => {
      const startOfWeek = new Date(date)
      const dayOfWeek = date.getDay()
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      startOfWeek.setDate(date.getDate() - daysFromMonday)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      return { startOfWeek, endOfWeek }
    }
    
    it('should calculate correct week for Monday', () => {
      const monday = createLocalDate(2025, 6, 23)
      const { startOfWeek, endOfWeek } = getWeekBoundaries(monday)
      
      expect(startOfWeek.getDate()).toBe(23) // Same Monday
      expect(endOfWeek.getDate()).toBe(29) // Following Sunday
    })
    
    it('should calculate correct week for Sunday', () => {
      const sunday = createLocalDate(2025, 6, 29)
      const { startOfWeek, endOfWeek } = getWeekBoundaries(sunday)
      
      expect(startOfWeek.getDate()).toBe(23) // Previous Monday
      expect(endOfWeek.getDate()).toBe(29) // Same Sunday
    })
    
    it('should calculate correct week for Wednesday', () => {
      const wednesday = createLocalDate(2025, 6, 25)
      const { startOfWeek, endOfWeek } = getWeekBoundaries(wednesday)
      
      expect(startOfWeek.getDate()).toBe(23) // Previous Monday
      expect(endOfWeek.getDate()).toBe(29) // Following Sunday
    })

    it('should handle the critical Sunday edge case', () => {
      // This test specifically addresses the bug where Sunday was miscalculated
      const sunday = createLocalDate(2025, 6, 29) // Sunday
      const dayOfWeek = sunday.getDay() // Should be 0
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Should be 6, not -1
      
      expect(dayOfWeek).toBe(0) // Sunday
      expect(daysFromMonday).toBe(6) // Sunday is 6 days from Monday
      
      const { startOfWeek } = getWeekBoundaries(sunday)
      expect(startOfWeek.getDate()).toBe(23) // Should be Monday June 23, not July 1
    })
  })
}) 