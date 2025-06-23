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
}

export function useHabits() {
  const { data: session, status } = useSession()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migrationInProgress, setMigrationInProgress] = useState(false)

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
      setHabits(data)
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
        logs: []
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

          return { ...habit, logs: newLogs }
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
      console.log('Making fetch request to:', `/api/habits/${habitId}/toggle`)
      console.log('Session user:', session?.user)
      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // Ensure cookies are sent
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        if (response.status === 401) {
          throw new Error('Please sign in to save your progress')
        }
        throw new Error(`Failed to toggle habit: ${response.status}`)
      }

      const result = await response.json()
      console.log('API success response:', result)
      
      // Update local state
      setHabits(prev => prev.map(habit => {
        if (habit.id === habitId) {
          const today = new Date(result.date)
          const existingLogIndex = habit.logs.findIndex(log => {
            const logDate = new Date(log.date)
            return logDate.toDateString() === today.toDateString()
          })

          let newLogs = [...habit.logs]
          if (existingLogIndex >= 0) {
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              completed: result.completed
            }
          } else {
            newLogs.push({
              id: Date.now().toString(),
              date: today,
              completed: result.completed
            })
          }

          return { ...habit, logs: newLogs }
        }
        return habit
      }))
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
        logs: []
      },
      {
        id: 'mock-2',
        title: 'Read for 30 minutes',
        category: 'Learning',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: []
      },
      {
        id: 'mock-3',
        title: 'Exercise for 45 minutes',
        category: 'Fitness',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: []
      },
      {
        id: 'mock-4',
        title: 'Practice meditation',
        category: 'Wellness',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: []
      },
      {
        id: 'mock-5',
        title: 'Write in journal',
        category: 'Personal',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
        logs: []
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
          // Convert date strings back to Date objects
          const habitsWithDates = parsed.map((habit: any) => ({
            ...habit,
            createdAt: new Date(habit.createdAt),
            logs: habit.logs.map((log: any) => ({
              ...log,
              date: new Date(log.date)
            }))
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

  return {
    habits,
    loading: loading || migrationInProgress,
    error,
    createHabit,
    toggleHabit,
    deleteHabit,
    createSampleHabits,
    migrateLocalStorageToDatabase,
    refetch: fetchHabits
  }
} 