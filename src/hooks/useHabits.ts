import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { clearAllAppData } from '@/utils/localStorage'

interface HabitLog {
  id: string
  date: Date
  completed: boolean
}

interface Habit {
  id: string
  title: string
  category: string
  frequency: string
  isActive: boolean
  createdAt: Date
  logs: HabitLog[]
  currentStreak?: number
  bestStreak?: number
  order?: number
  lastUpdated?: number
}

export function useHabits() {
  const { data: session, status } = useSession()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migrationInProgress, setMigrationInProgress] = useState(false)

  // Calculate streaks for a habit based on its logs
  const calculateStreaks = (habit: Habit) => {
    const { logs, frequency } = habit
    
    // Sort logs by date (newest first)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // For daily habits, check consecutive days
    if (frequency === 'daily' || frequency === 'weekdays') {
      let checkDate = new Date(today)
      let foundToday = false
      
      // Check if today is completed (for current streak)
      const todayLog = sortedLogs.find(log => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === today.getTime()
      })
      
      if (todayLog && todayLog.completed) {
        foundToday = true
        currentStreak = 1
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // If today isn't completed, start checking from yesterday
        checkDate.setDate(checkDate.getDate() - 1)
      }
      
      // Count backwards for current streak
      while (true) {
        // Skip weekends for weekdays frequency
        if (frequency === 'weekdays' && (checkDate.getDay() === 0 || checkDate.getDay() === 6)) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
        
        const dayLog = sortedLogs.find(log => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === checkDate.getTime()
        })
        
        if (dayLog && dayLog.completed) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
      
      // Calculate best streak by going through all logs
      tempStreak = 0
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
      
      // Calculate current streak
      const thisWeekMonday = new Date(today)
      const dayOfWeek = thisWeekMonday.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      thisWeekMonday.setDate(thisWeekMonday.getDate() + diff)
      thisWeekMonday.setHours(0, 0, 0, 0)
      
      let checkWeek = thisWeekMonday.getTime()
      
      // If this week is completed, start current streak from this week
      if (weeklyCompletions.has(checkWeek)) {
        currentStreak = 1
        checkWeek -= 7 * 24 * 60 * 60 * 1000 // Go to previous week
      } else {
        // Start from last week
        checkWeek -= 7 * 24 * 60 * 60 * 1000
      }
      
      // Count backwards for current streak
      while (weeklyCompletions.has(checkWeek)) {
        currentStreak++
        checkWeek -= 7 * 24 * 60 * 60 * 1000
      }
      
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

  // Migrate localStorage data to database (only called during account creation)
  const migrateLocalStorageToDatabase = async () => {
    if (!session?.user) return

    try {
      const savedHabits = localStorage.getItem('routinely-habits')
      if (!savedHabits) {
        return
      }

      const localHabits = JSON.parse(savedHabits)
      if (!localHabits || localHabits.length === 0) {
        return
      }

      setMigrationInProgress(true)
      console.log('Migrating localStorage data to database...')

      // Convert localStorage habits with dates
      const habitsWithDates = localHabits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        logs: habit.logs.map((log: any) => ({
          ...log,
          date: new Date(log.date)
        }))
      }))

      // Create habits in database
      for (const habit of habitsWithDates) {
        try {
          // Create the habit
          const habitResponse = await fetch('/api/habits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: habit.title,
              category: habit.category,
              frequency: habit.frequency,
            }),
          })

          if (habitResponse.ok) {
            const newHabit = await habitResponse.json()
            
            // Create logs for this habit
            for (const log of habit.logs) {
              if (log.completed) {
                try {
                  // Set the date for the log entry
                  const logDate = new Date(log.date)
                  await fetch('/api/habits/migrate-log', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      habitId: newHabit.id,
                      date: logDate.toISOString(),
                      completed: log.completed
                    }),
                  })
                } catch (logError) {
                  console.error('Error migrating log:', logError)
                }
              }
            }
          }
        } catch (habitError) {
          console.error('Error migrating habit:', habitError)
        }
      }

      // Clear all localStorage data after successful migration
      clearAllAppData()
      
      // Refresh habits from database
      await fetchHabits()
      
      console.log('Migration completed successfully')
    } catch (error) {
      console.error('Error during migration:', error)
    } finally {
      setMigrationInProgress(false)
    }
  }

  // Fetch habits from API if user is authenticated
  const fetchHabits = async () => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/habits')
      if (!response.ok) {
        throw new Error('Failed to fetch habits')
      }
      const data = await response.json()
      console.log('📊 [FETCH] Raw data from API:', data.map((h: any) => ({
        id: h.id,
        title: h.title,
        logs: h.logs.map((l: any) => ({ date: l.date, completed: l.completed })),
        currentStreak: h.currentStreak,
        bestStreak: h.bestStreak
      })))
      
      // Log the first habit in detail to debug
      if (data.length > 0) {
        console.log('📊 [FETCH] First habit details:', {
          title: data[0].title,
          currentStreak: data[0].currentStreak,
          bestStreak: data[0].bestStreak,
          allLogs: data[0].logs.map((l: any) => ({ 
            date: new Date(l.date).toISOString(), 
            completed: l.completed 
          }))
        })
      }
      const habitsWithStreaks = data.map((habit: any) => {
        // Use database streak values if available, otherwise calculate
        const dbCurrentStreak = habit.currentStreak ?? 0
        const dbBestStreak = habit.bestStreak ?? 0
        
        // Only calculate streaks if database doesn't have them (backwards compatibility)
        let currentStreak = dbCurrentStreak
        let bestStreak = dbBestStreak
        
        if (dbCurrentStreak === 0 && dbBestStreak === 0) {
          const calculatedStreaks = calculateStreaks(habit)
          currentStreak = calculatedStreaks.currentStreak
          bestStreak = calculatedStreaks.bestStreak
        }
        
        return {
          ...habit,
          createdAt: new Date(habit.createdAt),
          logs: habit.logs.map((log: any) => ({
            ...log,
            date: new Date(log.date)
          })),
          currentStreak,
          bestStreak
        }
      })
      
      // Apply stored order from localStorage if available
      const storedOrder = localStorage.getItem('habit-order')
      if (storedOrder) {
        try {
          const orderMap = JSON.parse(storedOrder)
          const orderLookup = new Map(orderMap.map((item: { id: string; order: number }) => [item.id, item.order]))
          
          habitsWithStreaks.sort((a: any, b: any) => {
            const orderA = (orderLookup.get(a.id) as number) ?? 999
            const orderB = (orderLookup.get(b.id) as number) ?? 999
            return orderA - orderB
          })
          
          console.log('✅ Applied stored habit order from localStorage')
        } catch (error) {
          console.error('❌ Error applying stored order:', error)
        }
      }
      
      setHabits(habitsWithStreaks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits')
      console.error('Error fetching habits:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create a new habit
  const createHabit = async (habitData: { title: string; category: string; frequency: string }) => {
    if (!session?.user) {
      // For non-authenticated users, use local state
      const newHabit: Habit = {
        id: Date.now().toString(),
        ...habitData,
        isActive: true,
        createdAt: new Date(),
        logs: [],
        currentStreak: 0,
        bestStreak: 0
      }
      const updatedHabits = [...habits, newHabit]
      setHabits(updatedHabits)
      localStorage.setItem('routinely-habits', JSON.stringify(updatedHabits))
      return newHabit
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      })

      if (!response.ok) {
        throw new Error('Failed to create habit')
      }

      const newHabit = await response.json()
      setHabits(prev => [...prev, newHabit])
      return newHabit
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit')
      console.error('Error creating habit:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Toggle habit completion
  const toggleHabit = async (habitId: string) => {
    console.log('toggleHabit called with:', { 
      habitId, 
      hasSession: !!session?.user, 
      sessionUser: session?.user,
      sessionStatus: status
    })
    
    if (!session?.user) {
      console.log('No session, using local storage logic')
      // For non-authenticated users, use local state logic
      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const existingLog = habit.logs.find(log => {
            const logDate = new Date(log.date)
            logDate.setHours(0, 0, 0, 0)
            return logDate.getTime() === today.getTime()
          })

          let newLogs
          if (existingLog) {
            newLogs = habit.logs.map(log => 
              log.id === existingLog.id ? { ...log, completed: !log.completed } : log
            )
          } else {
            newLogs = [...habit.logs, {
              id: Date.now().toString(),
              date: today,
              completed: true
            }]
          }

          // Create updated habit with new logs
          const updatedHabit = { 
            ...habit, 
            logs: newLogs,
            currentStreak: habit.currentStreak || 0,
            bestStreak: habit.bestStreak || 0
          }
          
          // Calculate new streaks based on the updated logs
          const streaks = calculateStreaks(updatedHabit)
          updatedHabit.currentStreak = streaks.currentStreak
          updatedHabit.bestStreak = Math.max(updatedHabit.bestStreak, streaks.bestStreak)

          return updatedHabit
        }
        return habit
      })
      
      setHabits(updatedHabits)
      localStorage.setItem('routinely-habits', JSON.stringify(updatedHabits))
      return
    }

    console.log('Session exists, making API call')
    setLoading(true)
    setError(null)

    try {
      // Calculate today's date using the same method as the UI comparison
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      console.log('Making fetch request to:', `/api/habits/${habitId}/toggle`)
      console.log('Session user:', session?.user)
      console.log('Sending today date:', today.toISOString())
      
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Ensure cookies are sent
        body: JSON.stringify({
          date: today.toISOString()
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error response:', errorData)
        
        if (response.status === 401) {
          throw new Error('Please sign in to save your progress')
        }
        
        // Handle weekly habit already completed this week
        if (response.status === 400 && errorData.completedThisWeek) {
          console.log('Weekly habit already completed this week:', errorData.message)
          // Don't throw an error, just show a message to the user
          setError(errorData.message)
          return
        }
        
        throw new Error(`Failed to toggle habit: ${response.status}`)
      }

      const result = await response.json()
      console.log('API success response:', result)
      
      // Update local state with improved logic
      setHabits(prev => {
        const updatedHabits = prev.map(habit => {
          if (habit.id === habitId) {
            // Fix: Use the date directly from API without timezone conversion
            const resultDate = new Date(result.date)
            
            console.log('Updating habit logs for:', habit.title)
            console.log('API returned date:', result.date)
            console.log('Parsed result date:', resultDate.toISOString())
            console.log('Result completed:', result.completed)
            console.log('Streaks from API:', { currentStreak: result.currentStreak, bestStreak: result.bestStreak })
            console.log('Current logs:', habit.logs.map(log => ({ 
              id: log.id, 
              date: new Date(log.date).toISOString(), 
              completed: log.completed 
            })))

            const existingLogIndex = habit.logs.findIndex(log => {
              const logDate = new Date(log.date)
              // Compare dates by converting both to date strings (YYYY-MM-DD)
              const logDateStr = logDate.toISOString().split('T')[0]
              const resultDateStr = resultDate.toISOString().split('T')[0]
              console.log('Comparing dates:', { logDateStr, resultDateStr, match: logDateStr === resultDateStr })
              return logDateStr === resultDateStr
            })

            let newLogs = [...habit.logs]
            
            if (existingLogIndex >= 0) {
              // Update existing log
              newLogs[existingLogIndex] = {
                ...newLogs[existingLogIndex],
                completed: result.completed
              }
              console.log('Updated existing log at index:', existingLogIndex)
            } else {
              // Add new log for any toggle action (completed or not)
              newLogs.push({
                id: `${Date.now()}-${Math.random()}`,
                date: resultDate,
                completed: result.completed
              })
              console.log('Added new log with completed:', result.completed)
            }
            
            // Remove any duplicate logs for the same date (safety check)
            // Keep the most recently updated log for each date
            const dateLogMap = new Map()
            newLogs.forEach(log => {
              const logDateStr = new Date(log.date).toISOString().split('T')[0]
              if (!dateLogMap.has(logDateStr) || log.completed === result.completed) {
                // Keep this log if it's the first for this date, or if it matches the API result
                dateLogMap.set(logDateStr, log)
              }
            })
            
            const uniqueLogs = Array.from(dateLogMap.values())
            if (uniqueLogs.length !== newLogs.length) {
              console.log('Removed duplicate logs:', newLogs.length - uniqueLogs.length)
              newLogs = uniqueLogs
            }

            const updatedHabit = { 
              ...habit, 
              logs: newLogs,
              // Update streaks immediately from API response
              currentStreak: result.currentStreak ?? habit.currentStreak ?? 0,
              bestStreak: result.bestStreak ?? habit.bestStreak ?? 0,
              // Force re-render by updating a timestamp
              lastUpdated: Date.now()
            }
            console.log('Updated habit logs and streaks:', {
              logs: updatedHabit.logs.map(log => ({ 
                id: log.id, 
                date: new Date(log.date).toISOString(), 
                completed: log.completed 
              })),
              currentStreak: updatedHabit.currentStreak,
              bestStreak: updatedHabit.bestStreak,
              lastUpdated: updatedHabit.lastUpdated
            })
            
            // Debug: Check for duplicate date logs
            const todayLogs = updatedHabit.logs.filter(log => {
              const logDate = new Date(log.date)
              const logDateStr = logDate.toISOString().split('T')[0]
              const resultDateStr = resultDate.toISOString().split('T')[0]
              return logDateStr === resultDateStr
            })
            console.log('All logs for today after update:', todayLogs.map(log => ({
              id: log.id,
              date: new Date(log.date).toISOString(),
              completed: log.completed
            })))
            
            return updatedHabit
          }
          return habit
        })
        
        console.log('State update completed')
        return updatedHabits
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle habit')
      console.error('Error toggling habit:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    if (!session?.user) {
      const updatedHabits = habits.filter(habit => habit.id !== habitId)
      setHabits(updatedHabits)
      localStorage.setItem('routinely-habits', JSON.stringify(updatedHabits))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete habit')
      }

      setHabits(prev => prev.filter(habit => habit.id !== habitId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit')
      console.error('Error deleting habit:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create sample habits for new users
  const createSampleHabits = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/habits/seed', {
        method: 'POST',
      })
      
      if (response.ok) {
        await fetchHabits() // Refresh habits after creating samples
      }
    } catch (error) {
      console.error('Error creating sample habits:', error)
    }
  }

  // Mock data for non-authenticated users
  const createMockHabits = () => {
    const mockHabits: Habit[] = [
      {
        id: 'mock-1',
        title: 'Drink 8 glasses of water',
        category: 'Health',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: [],
        currentStreak: 0,
        bestStreak: 0
      },
      {
        id: 'mock-2',
        title: 'Read for 30 minutes',
        category: 'Learning',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: [],
        currentStreak: 0,
        bestStreak: 0
      },
      {
        id: 'mock-3',
        title: 'Exercise for 45 minutes',
        category: 'Fitness',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: [],
        currentStreak: 0,
        bestStreak: 0
      },
      {
        id: 'mock-4',
        title: 'Practice meditation',
        category: 'Wellness',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: [],
        currentStreak: 0,
        bestStreak: 0
      },
      {
        id: 'mock-5',
        title: 'Write in journal',
        category: 'Personal',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: [],
        currentStreak: 0,
        bestStreak: 0
      }
    ]
    return mockHabits
  }

  // Effect to fetch habits when user session changes
  useEffect(() => {
    if (status === 'loading') return // Still loading session

    if (session?.user) {
      // User is authenticated - ONLY use database
      // Check if there's localStorage data to migrate
      const checkForMigration = async () => {
        const savedHabits = localStorage.getItem('routinely-habits')
        if (savedHabits) {
          try {
            const parsed = JSON.parse(savedHabits)
            if (parsed && parsed.length > 0) {
              // Check if user has any habits in database
              const response = await fetch('/api/habits')
              if (response.ok) {
                const existingHabits = await response.json()
                if (existingHabits.length === 0) {
                  // User has localStorage data but no database habits - migrate
                  await migrateLocalStorageToDatabase()
                  return
                }
              }
            }
          } catch (err) {
            console.error('Error checking for migration:', err)
          }
          // Clear all localStorage data since user is now authenticated
          clearAllAppData()
        }
        // Fetch habits from database
        await fetchHabits()
      }
      
      checkForMigration()
    } else {
      // User is not authenticated - ONLY use localStorage
      const savedHabits = localStorage.getItem('routinely-habits')
      if (savedHabits) {
        try {
          const parsed = JSON.parse(savedHabits)
          // Convert date strings back to Date objects and ensure streak fields exist
          const habitsWithDates = parsed.map((habit: any) => ({
            ...habit,
            createdAt: new Date(habit.createdAt),
            logs: habit.logs.map((log: any) => ({
              ...log,
              date: new Date(log.date)
            })),
            currentStreak: habit.currentStreak || 0,
            bestStreak: habit.bestStreak || 0
          }))
          setHabits(habitsWithDates)
        } catch (err) {
          console.error('Error parsing saved habits:', err)
          const mockHabits = createMockHabits()
          setHabits(mockHabits)
          localStorage.setItem('routinely-habits', JSON.stringify(mockHabits))
        }
      } else {
        // No saved habits, create mock data
        const mockHabits = createMockHabits()
        setHabits(mockHabits)
        localStorage.setItem('routinely-habits', JSON.stringify(mockHabits))
      }
    }
  }, [session, status])

  // Clear migration state when user signs out
  useEffect(() => {
    if (!session?.user) {
      setMigrationInProgress(false)
    }
  }, [session])

  // Refetch function that works for both authenticated and non-authenticated users
  const refetch = async () => {
    console.log('🔄 [REFETCH] Starting refetch...')
    await fetchHabits()
    console.log('✅ [REFETCH] Refetch completed')
  }

  const reorderHabits = async (reorderedHabits: Habit[]) => {
    try {
      // Update local state immediately for instant feedback
      setHabits(reorderedHabits)
      
      if (session?.user) {
        // For authenticated users, store the order in localStorage as a fallback
        // until database schema is updated with the order field
        const habitOrder = reorderedHabits.map((habit, index) => ({
          id: habit.id,
          order: index
        }))
        localStorage.setItem('habit-order', JSON.stringify(habitOrder))
        
        console.log('✅ Habit order updated in localStorage for authenticated user')
      } else {
        // For non-authenticated users, update localStorage habits directly
        localStorage.setItem('routinely-habits', JSON.stringify(reorderedHabits))
        console.log('✅ Habit order updated in localStorage for guest user')
      }
    } catch (error) {
      console.error('❌ Error updating habit order:', error)
      // Revert to original order on error
      await fetchHabits()
    }
  }

  return {
    habits,
    loading,
    error,
    migrationInProgress,
    fetchHabits,
    createHabit,
    toggleHabit,
    deleteHabit,
    createSampleHabits,
    refetch,
    reorderHabits
  }
} 