// Simple HabitLog interface that matches what's used in useHabits
interface SimpleHabitLog {
  id: string
  date: Date
  completed: boolean
}

export interface StreakResult {
  currentStreak: number
  bestStreak: number
}

export function calculateIntuitiveStreaks(logs: SimpleHabitLog[], frequency: string): StreakResult {
  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  let currentStreak = 0
  let bestStreak = 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // For daily habits, check consecutive days
  if (frequency === 'daily' || frequency === 'weekdays') {
    // Check if today is completed
    const todayLog = sortedLogs.find(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })
    
    const isTodayCompleted = todayLog?.completed || false
    
    // Calculate yesterday's streak (excluding today)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    let yesterdayStreak = 0
    let currentDate = new Date(yesterday)
    
    while (true) {
      currentDate.setHours(0, 0, 0, 0)
      
      // Skip weekends for weekdays frequency
      if (frequency === 'weekdays' && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        currentDate.setDate(currentDate.getDate() - 1)
        continue
      }
      
      const dayLog = sortedLogs.find(log => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === currentDate.getTime()
      })
      
      if (!dayLog || !dayLog.completed) {
        break
      }
      
      yesterdayStreak++
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    // Today's impact: if completed, add 1 to yesterday's streak; if not, show yesterday's streak
    currentStreak = isTodayCompleted ? yesterdayStreak + 1 : yesterdayStreak
    
    // Calculate best streak by going through all logs chronologically
    let tempStreak = 0
    const allDates = new Set()
    
    // Get all unique dates with completed logs
    sortedLogs.forEach(log => {
      if (log.completed) {
        const dateStr = new Date(log.date).toDateString()
        allDates.add(dateStr)
      }
    })
    
    const completedDates = Array.from(allDates).map(dateStr => new Date(dateStr as string)).sort((a, b) => b.getTime() - a.getTime())
    
    for (let i = 0; i < completedDates.length; i++) {
      let streakCount = 1
      let currentDate = new Date(completedDates[i])
      
      // Count consecutive days from this date
      for (let j = i + 1; j < completedDates.length; j++) {
        const nextDate = new Date(completedDates[j])
        const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // For weekdays, account for weekends
        let expectedDiff = 1
        if (frequency === 'weekdays') {
          const currentDay = currentDate.getDay()
          if (currentDay === 1) expectedDiff = 3 // Monday after Friday
          else if (currentDay === 0) expectedDiff = 2 // Sunday after Friday (shouldn't happen for weekdays)
        }
        
        if (dayDiff === expectedDiff) {
          streakCount++
          currentDate = nextDate
        } else {
          break
        }
      }
      
      bestStreak = Math.max(bestStreak, streakCount)
    }
  } 
  // For weekly habits, check consecutive weeks
  else if (frequency === 'weekly') {
    // Group logs by week (Monday to Sunday)
    const weeklyCompletions = new Map()
    
    sortedLogs.forEach(log => {
      if (log.completed) {
        const logDate = new Date(log.date)
        // Get Monday of the week
        const monday = new Date(logDate)
        const dayOfWeek = monday.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust for Sunday = 0
        monday.setDate(monday.getDate() + diff)
        monday.setHours(0, 0, 0, 0)
        
        const weekKey = monday.getTime()
        weeklyCompletions.set(weekKey, true)
      }
    })
    
    const completedWeeks = Array.from(weeklyCompletions.keys()).sort((a, b) => b - a)
    
    // Calculate current streak using intuitive logic
    const thisWeekMonday = new Date(today)
    const dayOfWeek = thisWeekMonday.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    thisWeekMonday.setDate(thisWeekMonday.getDate() + diff)
    thisWeekMonday.setHours(0, 0, 0, 0)
    
    // Check if this week is completed
    const isThisWeekCompleted = weeklyCompletions.has(thisWeekMonday.getTime())
    
    // Calculate last week's streak (excluding this week)
    const lastWeekStart = new Date(thisWeekMonday)
    lastWeekStart.setDate(thisWeekMonday.getDate() - 7)
    
    let lastWeekStreak = 0
    let currentWeekStart = new Date(lastWeekStart)
    
    while (true) {
      if (weeklyCompletions.has(currentWeekStart.getTime())) {
        lastWeekStreak++
        currentWeekStart.setDate(currentWeekStart.getDate() - 7)
      } else {
        break
      }
    }
    
    // This week's impact: if completed, add 1 to last week's streak; if not, show last week's streak
    currentStreak = isThisWeekCompleted ? lastWeekStreak + 1 : lastWeekStreak
    
    // Calculate best streak
    for (let i = 0; i < completedWeeks.length; i++) {
      let streakCount = 1
      let currentWeek = completedWeeks[i]
      
      for (let j = i + 1; j < completedWeeks.length; j++) {
        const nextWeek = completedWeeks[j]
        const weekDiff = (currentWeek - nextWeek) / (7 * 24 * 60 * 60 * 1000)
        
        if (weekDiff === 1) {
          streakCount++
          currentWeek = nextWeek
        } else {
          break
        }
      }
      
      bestStreak = Math.max(bestStreak, streakCount)
    }
  }
  
  return {
    currentStreak: Math.max(0, currentStreak),
    bestStreak: Math.max(0, bestStreak)
  }
} 