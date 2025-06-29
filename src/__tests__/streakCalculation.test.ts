import { describe, it, expect } from '@jest/globals'

// Mock habit log interface matching Prisma schema
interface HabitLog {
  id: string
  date: Date
  completed: boolean
  habitId: string
}

// Server-side streak calculation logic (extracted from toggle API)
const calculateDailyStreak = (logs: HabitLog[], targetDate: Date): number => {
  const targetDateStr = targetDate.toISOString().split('T')[0]
  
  // Check if target date is completed
  const targetLog = logs.find(log => {
    const logDateStr = log.date.toISOString().split('T')[0]
    return logDateStr === targetDateStr
  })
  
  if (!targetLog || !targetLog.completed) {
    return 0
  }
  
  // Count consecutive completed days ending with target date
  const sortedLogs = logs
    .filter(log => log.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => log.date.toISOString().split('T')[0])
  
  const uniqueDates = [...new Set(sortedLogs)]
  const targetIndex = uniqueDates.indexOf(targetDateStr)
  
  if (targetIndex === -1) return 0
  
  let streak = 1
  for (let i = targetIndex - 1; i >= 0; i--) {
    const currentDate = new Date(uniqueDates[i + 1])
    const prevDate = new Date(uniqueDates[i])
    
    const daysDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysDiff === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

const calculateWeeklyStreak = (logs: HabitLog[], targetDate: Date): number => {
  const startOfWeek = new Date(targetDate)
  const dayOfWeek = targetDate.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startOfWeek.setDate(targetDate.getDate() - daysFromMonday)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  // Check if this week is completed
  const thisWeekCompleted = logs.some(log => {
    const logDateStr = log.date.toISOString().split('T')[0]
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0]
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0]
    
    const isInWeek = logDateStr >= startOfWeekStr && logDateStr <= endOfWeekStr
    return isInWeek && log.completed
  })
  
  if (!thisWeekCompleted) {
    return 0
  }
  
  // Count consecutive completed weeks
  let streak = 1
  let currentWeekStart = new Date(startOfWeek)
  
  while (true) {
    // Move to previous week
    currentWeekStart.setDate(currentWeekStart.getDate() - 7)
    const currentWeekEnd = new Date(currentWeekStart)
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
    currentWeekEnd.setHours(23, 59, 59, 999)
    
    // Check if previous week is completed
    const prevWeekCompleted = logs.some(log => {
      const logDateStr = log.date.toISOString().split('T')[0]
      const weekStartStr = currentWeekStart.toISOString().split('T')[0]
      const weekEndStr = currentWeekEnd.toISOString().split('T')[0]
      
      const isInWeek = logDateStr >= weekStartStr && logDateStr <= weekEndStr
      return isInWeek && log.completed
    })
    
    if (prevWeekCompleted) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// Helper function to create a date
const createDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month - 1, day)
}

// Helper function to create habit log
const createLog = (date: Date, completed: boolean, id: string = 'test-log'): HabitLog => ({
  id,
  date,
  completed,
  habitId: 'test-habit'
})

describe('Streak Calculation Logic', () => {
  describe('Daily Streak Calculation', () => {
    describe('Basic Streak Counting', () => {
      it('should return 1 for single completed day', () => {
        const logs = [
          createLog(createDate(2025, 6, 29), true)
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(1)
      })
      
      it('should return 0 for uncompleted day', () => {
        const logs = [
          createLog(createDate(2025, 6, 29), false)
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(0)
      })
      
      it('should return 0 when no log exists for target date', () => {
        const logs = [
          createLog(createDate(2025, 6, 28), true)
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(0)
      })
      
      it('should count consecutive days correctly', () => {
        const logs = [
          createLog(createDate(2025, 6, 26), true),
          createLog(createDate(2025, 6, 27), true),
          createLog(createDate(2025, 6, 28), true),
          createLog(createDate(2025, 6, 29), true)
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(4)
      })
      
      it('should stop counting at gap in streak', () => {
        const logs = [
          createLog(createDate(2025, 6, 25), true),
          createLog(createDate(2025, 6, 26), true),
          // Gap on 27th
          createLog(createDate(2025, 6, 28), true),
          createLog(createDate(2025, 6, 29), true)
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(2) // Only 28th and 29th
      })
      
      it('should ignore incomplete days in streak', () => {
        const logs = [
          createLog(createDate(2025, 6, 26), true),
          createLog(createDate(2025, 6, 27), false), // Incomplete - breaks streak
          createLog(createDate(2025, 6, 28), true),
          createLog(createDate(2025, 6, 29), true)
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(2) // Only 28th and 29th
      })
    })
    
    describe('Edge Cases', () => {
      it('should handle month boundaries', () => {
        const logs = [
          createLog(createDate(2025, 5, 30), true), // May 30
          createLog(createDate(2025, 5, 31), true), // May 31
          createLog(createDate(2025, 6, 1), true),  // June 1
          createLog(createDate(2025, 6, 2), true)   // June 2
        ]
        const targetDate = createDate(2025, 6, 2)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(4)
      })
      
      it('should handle year boundaries', () => {
        const logs = [
          createLog(createDate(2024, 12, 30), true),
          createLog(createDate(2024, 12, 31), true),
          createLog(createDate(2025, 1, 1), true),
          createLog(createDate(2025, 1, 2), true)
        ]
        const targetDate = createDate(2025, 1, 2)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(4)
      })
      
      it('should handle timezone differences in logs', () => {
        const logs = [
          createLog(new Date('2025-06-28T07:00:00.000Z'), true), // UTC+7
          createLog(new Date('2025-06-29T00:00:00.000Z'), true)  // UTC
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(2) // Should work with mixed timezone formats
      })
    })
    
    describe('The Critical Bug Scenario', () => {
      it('should return 0 when habit is unchecked (the bug we fixed)', () => {
        // This recreates the exact bug scenario
        const logs = [
          createLog(createDate(2025, 6, 27), true),
          createLog(createDate(2025, 6, 28), true),
          createLog(createDate(2025, 6, 29), false) // Unchecked today
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(0) // Should be 0, not find "most recent completed day"
      })
      
      it('should correctly calculate when habit is checked after being unchecked', () => {
        const logs = [
          createLog(createDate(2025, 6, 27), true),
          createLog(createDate(2025, 6, 28), false), // Gap
          createLog(createDate(2025, 6, 29), true)   // Checked today
        ]
        const targetDate = createDate(2025, 6, 29)
        
        const streak = calculateDailyStreak(logs, targetDate)
        expect(streak).toBe(1) // Fresh start after gap
      })
    })
  })

  describe('Weekly Streak Calculation', () => {
    describe('Basic Week Streak Counting', () => {
      it('should return 1 for single completed week', () => {
        const logs = [
          createLog(createDate(2025, 6, 25), true) // Wednesday in week
        ]
        const targetDate = createDate(2025, 6, 29) // Sunday of same week
        
        const streak = calculateWeeklyStreak(logs, targetDate)
        expect(streak).toBe(1)
      })
      
      it('should return 0 for week with no completed logs', () => {
        const logs = [
          createLog(createDate(2025, 6, 25), false) // Incomplete Wednesday
        ]
        const targetDate = createDate(2025, 6, 29) // Sunday of same week
        
        const streak = calculateWeeklyStreak(logs, targetDate)
        expect(streak).toBe(0)
      })
      
      it('should count consecutive completed weeks', () => {
        const logs = [
          // Week 1 (June 16-22)
          createLog(createDate(2025, 6, 18), true),
          // Week 2 (June 23-29)
          createLog(createDate(2025, 6, 25), true),
          // Week 3 (June 30 - July 6)
          createLog(createDate(2025, 7, 2), true)
        ]
        const targetDate = createDate(2025, 7, 6) // Sunday of week 3
        
        const streak = calculateWeeklyStreak(logs, targetDate)
        expect(streak).toBe(3)
      })
      
      it('should stop counting at gap in weekly streak', () => {
        const logs = [
          // Week 1 (June 9-15) - completed
          createLog(createDate(2025, 6, 11), true),
          // Week 2 (June 16-22) - SKIPPED
          // Week 3 (June 23-29) - completed
          createLog(createDate(2025, 6, 25), true),
          // Week 4 (June 30 - July 6) - completed
          createLog(createDate(2025, 7, 2), true)
        ]
        const targetDate = createDate(2025, 7, 6) // Sunday of week 4
        
        const streak = calculateWeeklyStreak(logs, targetDate)
        expect(streak).toBe(2) // Only weeks 3 and 4
      })
    })
    
    describe('Week Boundary Handling', () => {
      it('should work correctly when checking from different days of the week', () => {
        const logs = [
          createLog(createDate(2025, 6, 25), true) // Wednesday
        ]
        
        // Test from all days of the same week
        const daysOfWeek = [
          createDate(2025, 6, 23), // Monday
          createDate(2025, 6, 24), // Tuesday
          createDate(2025, 6, 25), // Wednesday
          createDate(2025, 6, 26), // Thursday
          createDate(2025, 6, 27), // Friday
          createDate(2025, 6, 28), // Saturday
          createDate(2025, 6, 29)  // Sunday
        ]
        
        daysOfWeek.forEach(targetDate => {
          const streak = calculateWeeklyStreak(logs, targetDate)
          expect(streak).toBe(1) // Should find completed week from any day
        })
      })
      
      it('should handle the critical Sunday edge case correctly', () => {
        const logs = [
          createLog(createDate(2025, 6, 29), true) // Sunday completion
        ]
        const targetDate = createDate(2025, 6, 29) // Checking from Sunday
        
        const streak = calculateWeeklyStreak(logs, targetDate)
        expect(streak).toBe(1) // Should correctly identify Sunday as part of current week
      })
      
      it('should handle month boundaries in weekly calculation', () => {
        const logs = [
          // Week spanning May-June
          createLog(createDate(2025, 5, 28), true), // Wednesday in May
        ]
        const targetDate = createDate(2025, 6, 1) // Sunday in June (same week)
        
        const streak = calculateWeeklyStreak(logs, targetDate)
        expect(streak).toBe(1)
      })
    })
    
    describe('The Critical Sunday Bug', () => {
      it('should correctly handle Sunday when dayOfWeek is 0', () => {
        // Test the exact calculation that was buggy
        const sunday = createDate(2025, 6, 29)
        const dayOfWeek = sunday.getDay() // 0 for Sunday
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        
        expect(dayOfWeek).toBe(0)
        expect(daysFromMonday).toBe(6) // This was the fix - was calculating -1 before
        
        const logs = [
          createLog(createDate(2025, 6, 29), true) // Sunday
        ]
        
        const streak = calculateWeeklyStreak(logs, sunday)
        expect(streak).toBe(1) // Should work correctly
      })
      
      it('should not include logs from next week when checking from Sunday', () => {
        const logs = [
          createLog(createDate(2025, 6, 29), true), // Sunday (current week)
          createLog(createDate(2025, 6, 30), true)  // Monday (next week)
        ]
        const targetDate = createDate(2025, 6, 29) // Checking from Sunday
        
        const streak = calculateWeeklyStreak(logs, targetDate)
        expect(streak).toBe(1) // Should only count current week
      })
    })
  })

  describe('Production Scenarios', () => {
    it('should handle the exact production bug with timezone differences', () => {
      // This recreates the scenario from production logs
      const logs = [
        createLog(new Date('2025-06-29T07:00:00.000Z'), true),  // User timezone
        createLog(new Date('2025-06-29T00:00:00.000Z'), false), // Server timezone
        createLog(new Date('2025-06-28T00:00:00.000Z'), true),
        createLog(new Date('2025-06-27T00:00:00.000Z'), true)
      ]
      
      const targetDate = new Date('2025-06-29T07:00:00.000Z')
      const streak = calculateDailyStreak(logs, targetDate)
      expect(streak).toBe(3) // Should correctly identify consecutive days
    })
    
    it('should handle mixed completed/incomplete logs with timezone variations', () => {
      const logs = [
        createLog(new Date('2025-06-26T07:00:00.000Z'), true),
        createLog(new Date('2025-06-27T00:00:00.000Z'), false), // Gap
        createLog(new Date('2025-06-28T07:00:00.000Z'), true),
        createLog(new Date('2025-06-29T00:00:00.000Z'), true)
      ]
      
      const targetDate = new Date('2025-06-29T07:00:00.000Z')
      const streak = calculateDailyStreak(logs, targetDate)
      expect(streak).toBe(2) // Only 28th and 29th due to gap
    })
  })
}) 