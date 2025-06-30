import { calculateIntuitiveStreaks } from '../utils/streakCalculation'

describe('Intuitive Streak Calculation', () => {
  const createLog = (daysAgo: number, completed: boolean) => ({
    id: `log-${daysAgo}`,
    date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    completed
  })

  describe('Daily Habits', () => {
    it('should show yesterday streak when today is not completed', () => {
      const logs = [
        createLog(0, false), // Today - not completed
        createLog(1, true),  // Yesterday - completed
        createLog(2, true),  // 2 days ago - completed
        createLog(3, true),  // 3 days ago - completed
        createLog(4, false), // 4 days ago - not completed
      ]

      const result = calculateIntuitiveStreaks(logs, 'daily')
      
      // Should show streak of 3 (yesterday + 2 days ago + 3 days ago)
      // Even though today is not completed, we show the streak from previous days
      expect(result.currentStreak).toBe(3)
    })

    it('should show yesterday streak + 1 when today is completed', () => {
      const logs = [
        createLog(0, true),  // Today - completed
        createLog(1, true),  // Yesterday - completed
        createLog(2, true),  // 2 days ago - completed
        createLog(3, false), // 3 days ago - not completed
      ]

      const result = calculateIntuitiveStreaks(logs, 'daily')
      
      // Should show streak of 3 (yesterday + 2 days ago + today)
      expect(result.currentStreak).toBe(3)
    })

    it('should show 0 when yesterday is not completed', () => {
      const logs = [
        createLog(0, false), // Today - not completed
        createLog(1, false), // Yesterday - not completed
        createLog(2, true),  // 2 days ago - completed
        createLog(3, true),  // 3 days ago - completed
      ]

      const result = calculateIntuitiveStreaks(logs, 'daily')
      
      // Should show 0 because yesterday breaks the streak
      expect(result.currentStreak).toBe(0)
    })

    it('should show 1 when only today is completed', () => {
      const logs = [
        createLog(0, true),  // Today - completed
        createLog(1, false), // Yesterday - not completed
        createLog(2, false), // 2 days ago - not completed
      ]

      const result = calculateIntuitiveStreaks(logs, 'daily')
      
      // Should show 1 because only today is completed
      expect(result.currentStreak).toBe(1)
    })
  })

  describe('Weekly Habits', () => {
    const createWeeklyLog = (weeksAgo: number, completed: boolean) => ({
      id: `weekly-log-${weeksAgo}`,
      date: new Date(Date.now() - weeksAgo * 7 * 24 * 60 * 60 * 1000),
      completed
    })

    it('should show last week streak when this week is not completed', () => {
      const logs = [
        createWeeklyLog(0, false), // This week - not completed
        createWeeklyLog(1, true),  // Last week - completed
        createWeeklyLog(2, true),  // 2 weeks ago - completed
        createWeeklyLog(3, false), // 3 weeks ago - not completed
      ]

      const result = calculateIntuitiveStreaks(logs, 'weekly')
      
      // Should show streak of 2 (last week + 2 weeks ago)
      expect(result.currentStreak).toBe(2)
    })

    it('should show last week streak + 1 when this week is completed', () => {
      const logs = [
        createWeeklyLog(0, true),  // This week - completed
        createWeeklyLog(1, true),  // Last week - completed
        createWeeklyLog(2, true),  // 2 weeks ago - completed
        createWeeklyLog(3, false), // 3 weeks ago - not completed
      ]

      const result = calculateIntuitiveStreaks(logs, 'weekly')
      
      // Should show streak of 3 (last week + 2 weeks ago + this week)
      expect(result.currentStreak).toBe(3)
    })
  })

  describe('Best Streak Calculation', () => {
    it('should calculate best streak correctly', () => {
      const logs = [
        createLog(0, true),  // Today - completed
        createLog(1, true),  // Yesterday - completed
        createLog(2, false), // 2 days ago - not completed (breaks streak)
        createLog(3, true),  // 3 days ago - completed
        createLog(4, true),  // 4 days ago - completed
        createLog(5, true),  // 5 days ago - completed
        createLog(6, false), // 6 days ago - not completed
      ]

      const result = calculateIntuitiveStreaks(logs, 'daily')
      
      // Current streak should be 2 (today + yesterday)
      // Best streak should be 3 (3, 4, 5 days ago)
      expect(result.currentStreak).toBe(2)
      expect(result.bestStreak).toBe(3)
    })
  })
}) 