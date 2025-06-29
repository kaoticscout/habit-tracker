import { describe, it, expect, beforeEach } from '@jest/globals'

// Mock the complete habit structure as returned by API
interface HabitLog {
  id: string
  date: Date
  completed: boolean
  habitId: string
  updatedDuringToggle?: boolean
}

interface Habit {
  id: string
  title: string
  frequency: string
  currentStreak: number
  bestStreak: number
  logs: HabitLog[]
}

// Simulate the toggle API logic
class HabitToggleSimulator {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private calculateDailyStreak(logs: HabitLog[], targetDate: Date): number {
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
    
    const uniqueDates = Array.from(new Set(sortedLogs))
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

  private calculateWeeklyStreak(logs: HabitLog[], targetDate: Date): number {
    // Calculate week boundaries using date arithmetic only (no time zones)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth()
    const targetDay = targetDate.getDate()
    const dayOfWeek = targetDate.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    
    // Create clean date objects for week boundaries
    const startOfWeek = new Date(targetYear, targetMonth, targetDay - daysFromMonday)
    const endOfWeek = new Date(targetYear, targetMonth, targetDay - daysFromMonday + 6)
    
    // Use YYYY-MM-DD strings for comparison to avoid timezone issues
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0]
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0]
    
    // Check if this week is completed
    const thisWeekCompleted = logs.some(log => {
      const logDateStr = log.date.toISOString().split('T')[0]
      const isInWeek = logDateStr >= startOfWeekStr && logDateStr <= endOfWeekStr
      return isInWeek && log.completed
    })
    
    if (!thisWeekCompleted) {
      return 0
    }
    
    // Count consecutive completed weeks
    let streak = 1
    let currentWeekStartDate = new Date(startOfWeek)
    
    while (true) {
      // Move to previous week (7 days back)
      currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7)
      const currentWeekEndDate = new Date(currentWeekStartDate)
      currentWeekEndDate.setDate(currentWeekStartDate.getDate() + 6)
      
      const weekStartStr = currentWeekStartDate.toISOString().split('T')[0]
      const weekEndStr = currentWeekEndDate.toISOString().split('T')[0]
      
      // Check if previous week is completed
      const prevWeekCompleted = logs.some(log => {
        const logDateStr = log.date.toISOString().split('T')[0]
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

  async toggleHabit(habit: Habit, clientDate: Date): Promise<Habit> {
    // Use client-provided date (this was the fix for timezone issues)
    const targetDate = new Date(clientDate)
    const targetDateStr = targetDate.toISOString().split('T')[0]
    
    // Find existing log for this date
    const existingLogIndex = habit.logs.findIndex(log => {
      const logDateStr = log.date.toISOString().split('T')[0]
      return logDateStr === targetDateStr
    })
    
    let updatedLogs = [...habit.logs]
    let newCompleted: boolean
    
    if (existingLogIndex >= 0) {
      // Toggle existing log
      const existingLog = updatedLogs[existingLogIndex]
      newCompleted = !existingLog.completed
      updatedLogs[existingLogIndex] = {
        ...existingLog,
        completed: newCompleted,
        updatedDuringToggle: true
      }
    } else {
      // Create new log
      newCompleted = true
      const newLog: HabitLog = {
        id: this.generateId(),
        date: targetDate,
        completed: true,
        habitId: habit.id,
        updatedDuringToggle: true
      }
      updatedLogs.push(newLog)
    }
    
    // Calculate new streak immediately
    let newStreak: number
    let newBestStreak: number
    
    if (habit.frequency === 'weekly') {
      newStreak = this.calculateWeeklyStreak(updatedLogs, targetDate)
    } else {
      newStreak = this.calculateDailyStreak(updatedLogs, targetDate)
    }
    
    newBestStreak = Math.max(habit.bestStreak, newStreak)
    
    return {
      ...habit,
      logs: updatedLogs,
      currentStreak: newStreak,
      bestStreak: newBestStreak
    }
  }
}

// Helper function to create habit
const createHabit = (
  id: string,
  title: string,
  frequency: string,
  currentStreak: number = 0,
  bestStreak: number = 0,
  logs: HabitLog[] = []
): Habit => ({
  id,
  title,
  frequency,
  currentStreak,
  bestStreak,
  logs
})

// Helper function to create log
const createLog = (
  date: Date,
  completed: boolean,
  habitId: string = 'test-habit',
  id: string = 'test-log'
): HabitLog => ({
  id,
  date,
  completed,
  habitId
})

// Helper function to create date
const createDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month - 1, day)
}

describe('Toggle API Integration Tests', () => {
  let simulator: HabitToggleSimulator
  
  beforeEach(() => {
    simulator = new HabitToggleSimulator()
  })

  describe('Daily Habit Toggle Scenarios', () => {
    it('should check habit and calculate correct streak', async () => {
      const habit = createHabit('1', 'Exercise', 'daily', 0, 0, [
        createLog(createDate(2025, 6, 27), true, '1'),
        createLog(createDate(2025, 6, 28), true, '1')
      ])
      
      const clientDate = createDate(2025, 6, 29)
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(3) // 27, 28, 29
      expect(result.bestStreak).toBe(3)
      expect(result.logs).toHaveLength(3)
      
      const todayLog = result.logs.find(log => 
        log.date.toISOString().split('T')[0] === '2025-06-29'
      )
      expect(todayLog?.completed).toBe(true)
      expect(todayLog?.updatedDuringToggle).toBe(true)
    })

    it('should uncheck habit and reset streak to 0', async () => {
      const habit = createHabit('1', 'Exercise', 'daily', 3, 3, [
        createLog(createDate(2025, 6, 27), true, '1'),
        createLog(createDate(2025, 6, 28), true, '1'),
        createLog(createDate(2025, 6, 29), true, '1')
      ])
      
      const clientDate = createDate(2025, 6, 29)
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(0) // Should be 0 when unchecked
      expect(result.bestStreak).toBe(3) // Best streak preserved
      
      const todayLog = result.logs.find(log => 
        log.date.toISOString().split('T')[0] === '2025-06-29'
      )
      expect(todayLog?.completed).toBe(false)
    })

    it('should handle timezone differences correctly', async () => {
      const habit = createHabit('1', 'Exercise', 'daily', 0, 0, [])
      
      // Client sends their timezone date
      const clientDate = new Date('2025-06-29T07:00:00.000Z')
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(1)
      expect(result.logs).toHaveLength(1)
      
      const newLog = result.logs[0]
      expect(newLog.date.toISOString().split('T')[0]).toBe('2025-06-29')
      expect(newLog.completed).toBe(true)
    })

    it('should handle the critical bug scenario correctly', async () => {
      // Recreate the exact bug: unchecking should return 0, not find previous completed day
      const habit = createHabit('1', 'Exercise', 'daily', 2, 5, [
        createLog(createDate(2025, 6, 26), true, '1'),
        createLog(createDate(2025, 6, 27), true, '1'),
        createLog(createDate(2025, 6, 28), true, '1'), // This was found by buggy logic
        createLog(createDate(2025, 6, 29), true, '1')  // Today - will be unchecked
      ])
      
      const clientDate = createDate(2025, 6, 29)
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(0) // Fixed: should be 0, not 3
      expect(result.bestStreak).toBe(5) // Best streak preserved
      
      const todayLog = result.logs.find(log => 
        log.date.toISOString().split('T')[0] === '2025-06-29'
      )
      expect(todayLog?.completed).toBe(false)
    })
  })

  describe('Weekly Habit Toggle Scenarios', () => {
    it('should check weekly habit and calculate correct streak', async () => {
      const habit = createHabit('1', 'Relationship Check-in', 'weekly', 0, 0, [
        createLog(createDate(2025, 6, 11), true, '1'), // Week 1
        createLog(createDate(2025, 6, 18), true, '1')  // Week 2
      ])
      
      const clientDate = createDate(2025, 6, 29) // Sunday of week 3
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(3) // 3 consecutive weeks
      expect(result.bestStreak).toBe(3)
      
      const todayLog = result.logs.find(log => 
        log.date.toISOString().split('T')[0] === '2025-06-29'
      )
      expect(todayLog?.completed).toBe(true)
    })

    it('should handle Sunday correctly in weekly calculation', async () => {
      // This tests the critical Sunday bug fix
      const habit = createHabit('1', 'Weekly Goal', 'weekly', 0, 0, [])
      
      const clientDate = createDate(2025, 6, 29) // Sunday
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(1)
      expect(result.logs).toHaveLength(1)
      
      const newLog = result.logs[0]
      expect(newLog.completed).toBe(true)
    })

    it('should uncheck weekly habit and reset streak', async () => {
      const habit = createHabit('1', 'Weekly Goal', 'weekly', 3, 3, [
        createLog(createDate(2025, 6, 11), true, '1'), // Week 1 (June 9-15)
        createLog(createDate(2025, 6, 18), true, '1'), // Week 2 (June 16-22)
        createLog(createDate(2025, 6, 29), true, '1')  // Week 3 (June 23-29) - will be toggled off
      ])
      
      const clientDate = createDate(2025, 6, 29) // Sunday of week 3 - toggle existing log
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(0) // Should be 0 when week is unchecked
      expect(result.bestStreak).toBe(3) // Best streak preserved
      
      const todayLog = result.logs.find(log => 
        log.date.toISOString().split('T')[0] === '2025-06-29'
      )
      expect(todayLog?.completed).toBe(false) // The existing log should be toggled to false
    })

    it('should handle the production bug scenario with mixed timezone logs', async () => {
      // Recreate the exact scenario from production - current week completed, previous week incomplete
      const habit = createHabit('1', 'Relationship Check-in', 'weekly', 0, 1, [
        // Previous week (June 16-22) - incomplete
        createLog(new Date('2025-06-18T00:00:00.000Z'), false, '1'), // Wednesday (not completed)
        // Current week (June 23-29) - has some completed logs
        createLog(new Date('2025-06-26T00:00:00.000Z'), true, '1'),  // Thursday (completed)
        createLog(new Date('2025-06-25T00:00:00.000Z'), false, '1'), // Wednesday (not completed)
        createLog(new Date('2025-06-23T00:00:00.000Z'), true, '1')   // Monday (completed)
      ])
      
      const clientDate = new Date('2025-06-29T07:00:00.000Z') // Sunday in user timezone
      const result = await simulator.toggleHabit(habit, clientDate)
      
      expect(result.currentStreak).toBe(1) // Current week completed, but previous week was not
      expect(result.logs).toHaveLength(5) // New log added
      
      const newLog = result.logs.find(log => 
        log.date.toISOString().split('T')[0] === '2025-06-29'
      )
      expect(newLog?.completed).toBe(true)
    })
  })

  describe('State Management and Edge Cases', () => {
    it('should preserve updatedDuringToggle flag', async () => {
      const habit = createHabit('1', 'Test', 'daily', 0, 0, [])
      
      const result = await simulator.toggleHabit(habit, createDate(2025, 6, 29))
      
      const newLog = result.logs[0]
      expect(newLog.updatedDuringToggle).toBe(true)
    })

    it('should handle multiple toggles correctly', async () => {
      let habit = createHabit('1', 'Test', 'daily', 0, 0, [])
      
      // First toggle - check
      habit = await simulator.toggleHabit(habit, createDate(2025, 6, 29))
      expect(habit.currentStreak).toBe(1)
      expect(habit.logs[0].completed).toBe(true)
      
      // Second toggle - uncheck
      habit = await simulator.toggleHabit(habit, createDate(2025, 6, 29))
      expect(habit.currentStreak).toBe(0)
      expect(habit.logs[0].completed).toBe(false)
      
      // Third toggle - check again
      habit = await simulator.toggleHabit(habit, createDate(2025, 6, 29))
      expect(habit.currentStreak).toBe(1)
      expect(habit.logs[0].completed).toBe(true)
    })

    it('should handle month boundaries correctly', async () => {
      const habit = createHabit('1', 'Test', 'daily', 0, 0, [
        createLog(createDate(2025, 5, 30), true, '1'),
        createLog(createDate(2025, 5, 31), true, '1')
      ])
      
      const result = await simulator.toggleHabit(habit, createDate(2025, 6, 1))
      
      expect(result.currentStreak).toBe(3) // Should span month boundary
    })

    it('should handle year boundaries correctly', async () => {
      const habit = createHabit('1', 'Test', 'daily', 0, 0, [
        createLog(createDate(2024, 12, 30), true, '1'),
        createLog(createDate(2024, 12, 31), true, '1')
      ])
      
      const result = await simulator.toggleHabit(habit, createDate(2025, 1, 1))
      
      expect(result.currentStreak).toBe(3) // Should span year boundary
    })

    it('should update best streak when current exceeds it', async () => {
      const habit = createHabit('1', 'Test', 'daily', 2, 5, [
        createLog(createDate(2025, 6, 27), true, '1'),
        createLog(createDate(2025, 6, 28), true, '1')
      ])
      
      // Add days to create a streak longer than best
      let result = habit
      for (let day = 29; day <= 35; day++) {
        const month = day <= 30 ? 6 : 7
        const dayOfMonth = day <= 30 ? day : day - 30
        result = await simulator.toggleHabit(result, createDate(2025, month, dayOfMonth))
      }
      
      expect(result.currentStreak).toBe(9) // 27,28,29,30,1,2,3,4,5
      expect(result.bestStreak).toBe(9) // Should update to new best
    })
  })
}) 