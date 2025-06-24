import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🌅 Daily reset started at:', new Date().toISOString())
    
    // Verify this is a cron request (optional security check)
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = await executeQuery(async (prisma) => {
      // Get current date (start of day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Get yesterday's date
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      // Check if today is Monday (start of new week, end of previous week)
      const isStartOfWeek = today.getDay() === 1 // Monday = 1
      
      console.log('📅 Processing reset for:', {
        today: today.toISOString(),
        yesterday: yesterday.toISOString(),
        isStartOfWeek,
        dayOfWeek: today.getDay()
      })

      // Get all active habits with their logs
      const allHabits = await prisma.habit.findMany({
        where: { isActive: true },
        include: {
          logs: {
            where: {
              date: {
                gte: yesterday,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Include today
              }
            }
          },
          user: {
            select: { email: true }
          }
        }
      })

      console.log(`📊 Found ${allHabits.length} active habits to process`)

      let processedHabits = 0
      let streaksUpdated = 0
      let logsCreated = 0
      let weeklyHabitsSkipped = 0
      let errors: string[] = []
      const details: any[] = []

      // Process each habit
      for (const habit of allHabits) {
        try {
          const isWeeklyHabit = habit.frequency.toLowerCase() === 'weekly'
          
          // For weekly habits, only process on Monday (start of new week)
          if (isWeeklyHabit && !isStartOfWeek) {
            weeklyHabitsSkipped++
            details.push({
              habitId: habit.id,
              habitName: habit.title,
              userEmail: habit.user.email,
              frequency: habit.frequency,
              action: 'skipped_weekly',
              reason: 'Weekly habit - not start of week'
            })
            continue
          }

          // Check if habit should be tracked today based on frequency
          const shouldTrackToday = shouldHabitBeTrackedToday(habit.frequency, today, habit.createdAt)
          
          if (!shouldTrackToday) {
            details.push({
              habitId: habit.id,
              habitName: habit.title,
              userEmail: habit.user.email,
              frequency: habit.frequency,
              action: 'skipped',
              reason: 'Not scheduled for today'
            })
            continue
          }

          // For weekly habits, check the entire previous week for completion
          let wasCompletedInPeriod = false
          
          if (isWeeklyHabit) {
            // Check if completed any time in the previous week (Monday to Sunday)
            const lastWeekStart = new Date(today)
            lastWeekStart.setDate(lastWeekStart.getDate() - 7) // Go back 7 days to last Monday
            
            const lastWeekEnd = new Date(yesterday)
            lastWeekEnd.setHours(23, 59, 59, 999) // End of Sunday
            
            const weeklyLogs = await prisma.habitLog.findMany({
              where: {
                habitId: habit.id,
                date: {
                  gte: lastWeekStart,
                  lte: lastWeekEnd
                },
                completed: true
              }
            })
            
            wasCompletedInPeriod = weeklyLogs.length > 0
            
            console.log(`📅 Weekly habit ${habit.title}: checked period ${lastWeekStart.toISOString()} to ${lastWeekEnd.toISOString()}, completed: ${wasCompletedInPeriod}`)
          } else {
            // For daily habits, check yesterday
            const yesterdayLog = habit.logs.find(log => {
              const logDate = new Date(log.date)
              logDate.setHours(0, 0, 0, 0)
              return logDate.getTime() === yesterday.getTime()
            })
            wasCompletedInPeriod = yesterdayLog?.completed || false
          }

          // Find today's log (if it exists)
          const todayLog = habit.logs.find(log => {
            const logDate = new Date(log.date)
            logDate.setHours(0, 0, 0, 0)
            return logDate.getTime() === today.getTime()
          })

          // Create or update today's log entry (reset to incomplete)
          // This is the core functionality: reset all habits to unchecked for the new day
          let logAction = ''
          
          if (todayLog) {
            // Update existing log to incomplete (reset the checked status)
            await prisma.habitLog.update({
              where: { id: todayLog.id },
              data: { 
                completed: false,
                updatedAt: new Date()
              }
            })
            logAction = todayLog.completed ? 'reset_to_incomplete' : 'already_incomplete'
          } else {
            // Create new log entry for today (starts as incomplete/unchecked)
            await prisma.habitLog.create({
              data: {
                habitId: habit.id,
                userId: habit.userId,
                date: today,
                completed: false
              }
            })
            logsCreated++
            logAction = 'created_incomplete'
          }

          console.log(`📝 Habit ${habit.title}: ${logAction}, was completed in ${isWeeklyHabit ? 'week' : 'day'}: ${wasCompletedInPeriod}`)

          processedHabits++
          if (wasCompletedInPeriod) {
            streaksUpdated++
          }

          details.push({
            habitId: habit.id,
            habitName: habit.title,
            userEmail: habit.user.email,
            frequency: habit.frequency,
            action: 'reset',
            isWeeklyHabit,
            wasCompletedInPeriod,
            periodType: isWeeklyHabit ? 'week' : 'day',
            logAction,
            todayLogExists: !!todayLog,
            todayLogWasCompleted: todayLog?.completed || false,
            // TODO: Uncomment when streak fields are available
            // oldStreak: habit.currentStreak || 0,
            // newStreak,
            // oldBestStreak: habit.bestStreak || 0,
            // newBestStreak,
          })

        } catch (error) {
          const errorMsg = `Error processing habit ${habit.id} (${habit.title}): ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error('💥', errorMsg)
        }
      }

      return {
        processedHabits,
        streaksUpdated,
        logsCreated,
        weeklyHabitsSkipped,
        errors,
        details,
        totalHabits: allHabits.length
      }
    })

    const executionTime = Date.now() - startTime

    console.log('✅ Daily reset completed:', {
      ...results,
      executionTimeMs: executionTime
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      summary: {
        totalHabits: results.totalHabits,
        processedHabits: results.processedHabits,
        streaksUpdated: results.streaksUpdated,
        logsCreated: results.logsCreated,
        weeklyHabitsSkipped: results.weeklyHabitsSkipped,
        errorCount: results.errors.length
      },
      details: results.details,
      errors: results.errors
    })

  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error('💥 Daily reset failed:', error)
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to determine if a habit should be tracked today
function shouldHabitBeTrackedToday(frequency: string, date: Date, createdAt: Date): boolean {
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  switch (frequency.toLowerCase()) {
    case 'daily':
      return true
    
    case 'weekly':
      // Weekly habits are tracked on Mondays (start of new week)
      return dayOfWeek === 1
    
    case 'monthly':
      // Track on the 1st of each month
      return date.getDate() === 1
    
    case 'weekdays only':
      // Monday to Friday
      return dayOfWeek >= 1 && dayOfWeek <= 5
    
    case 'weekends only':
      // Saturday and Sunday
      return dayOfWeek === 0 || dayOfWeek === 6
    
    case 'every monday':
      return dayOfWeek === 1
    
    case 'every tuesday':
      return dayOfWeek === 2
    
    case 'every wednesday':
      return dayOfWeek === 3
    
    case 'every thursday':
      return dayOfWeek === 4
    
    case 'every friday':
      return dayOfWeek === 5
    
    case 'every saturday':
      return dayOfWeek === 6
    
    case 'every sunday':
      return dayOfWeek === 0
    
    // Handle custom frequencies like "every 2 days", "every 3 days", etc.
    default:
      if (frequency.startsWith('every ') && frequency.endsWith(' days')) {
        const match = frequency.match(/every (\d+) days/)
        if (match) {
          const interval = parseInt(match[1])
          // Calculate days since habit creation
          const creationDate = new Date(createdAt)
          creationDate.setHours(0, 0, 0, 0)
          const daysSinceCreation = Math.floor((date.getTime() - creationDate.getTime()) / (24 * 60 * 60 * 1000))
          // Check if today falls on the interval
          return daysSinceCreation % interval === 0
        }
      }
      
      // Default to daily for unknown frequencies
      return true
  }
}

// Allow GET requests for manual testing
export async function GET(req: NextRequest) {
  return POST(req)
} 