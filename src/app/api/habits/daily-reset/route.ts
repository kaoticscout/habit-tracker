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
      // Get current date info
      const now = new Date()
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Check if today is Monday (end of week for weekly habits)
      const isMonday = today.getDay() === 1 // Monday = 1
      
      console.log('📅 Processing reset for:', {
        today: today.toISOString(),
        tomorrow: tomorrow.toISOString(),
        isMonday,
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]
      })

      // Get all active habits with their users - using raw query to avoid schema conflicts
      const allHabitsRaw = await prisma.$queryRaw`
        SELECT 
          h.id,
          h.title,
          h.category,
          h.frequency,
          h."isActive",
          h."createdAt",
          h."updatedAt",
          h."userId",
          u.email as user_email
        FROM habits h
        JOIN users u ON h."userId" = u.id
        WHERE h."isActive" = true
        ORDER BY h."createdAt" ASC
      ` as Array<{
        id: string
        title: string
        category: string
        frequency: string
        isActive: boolean
        createdAt: Date
        updatedAt: Date
        userId: string
        user_email: string
      }>

      console.log(`📊 Found ${allHabitsRaw.length} active habits to process`)

      let processedHabits = 0
      let streaksUpdated = 0
      let logsCreated = 0
      let weeklyHabitsSkipped = 0
      let errors: string[] = []
      const details: any[] = []

      // Process each habit
      for (const habitRaw of allHabitsRaw) {
        try {
          const habit = {
            ...habitRaw,
            user: { email: habitRaw.user_email }
          }
          
          const isWeeklyHabit = habit.frequency.toLowerCase() === 'weekly'
          
          // For weekly habits, only process on Monday (end of week evaluation)
          if (isWeeklyHabit && !isMonday) {
            weeklyHabitsSkipped++
            details.push({
              habitId: habit.id,
              habitName: habit.title,
              userEmail: habit.user.email,
              frequency: habit.frequency,
              action: 'skipped_weekly',
              reason: 'Weekly habit - not Monday (end of week)'
            })
            continue
          }

          // Get current streak values (may not exist in production DB yet)
          let oldStreak = 0
          let oldBestStreak = 0
          
          try {
            const currentHabit = await prisma.$queryRaw`
              SELECT 
                COALESCE("currentStreak", 0) as current_streak,
                COALESCE("bestStreak", 0) as best_streak
              FROM habits 
              WHERE id = ${habit.id}
            ` as Array<{ current_streak: number, best_streak: number }>
            
            if (currentHabit.length > 0) {
              oldStreak = currentHabit[0].current_streak || 0
              oldBestStreak = currentHabit[0].best_streak || 0
            }
          } catch (error) {
            console.log(`⚠️ Streak columns not available for habit ${habit.title}, using defaults`)
          }

          // Check completion status for the period we're evaluating
          let wasCompletedInPeriod = false
          let periodDescription = ''
          
          if (isWeeklyHabit) {
            // For weekly habits on Monday: check if completed any time THIS WEEK (Monday to Sunday)
            const thisWeekStart = new Date(today)
            thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1) // This Monday
            
            const thisWeekEnd = new Date(today)
            thisWeekEnd.setHours(23, 59, 59, 999) // End of today (Monday)
            
            // Actually, we want to check the PREVIOUS week since we're evaluating at the END of a week period
            const lastWeekStart = new Date(thisWeekStart)
            lastWeekStart.setDate(lastWeekStart.getDate() - 7) // Previous Monday
            
            const lastWeekEnd = new Date(thisWeekStart)
            lastWeekEnd.setDate(lastWeekEnd.getDate() - 1) // Previous Sunday
            lastWeekEnd.setHours(23, 59, 59, 999)
            
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
            periodDescription = `week ${lastWeekStart.toISOString().split('T')[0]} to ${lastWeekEnd.toISOString().split('T')[0]}`
            
            console.log(`📅 Weekly habit ${habit.title}: checked ${periodDescription}, found ${weeklyLogs.length} completed logs, completed: ${wasCompletedInPeriod}`)
          } else {
            // For daily habits: check if completed TODAY to determine tomorrow's streak
            const currentDayLog = await prisma.habitLog.findFirst({
              where: {
                habitId: habit.id,
                date: {
                  gte: today,
                  lt: tomorrow
                }
              }
            })
            
            wasCompletedInPeriod = currentDayLog?.completed || false
            periodDescription = `today ${today.toISOString().split('T')[0]}`
            
            console.log(`📅 Daily habit ${habit.title}: checked ${periodDescription}, log exists: ${!!currentDayLog}, completed: ${wasCompletedInPeriod}`)
            console.log(`📅 Today date range: ${today.toISOString()} to ${tomorrow.toISOString()}`)
            
            // Check if this habit was already updated during toggle today
            if (currentDayLog?.updatedDuringToggle) {
              console.log(`🔄 Processing habit ${habit.title} that was updated during toggle today - will clear flag and continue with reset`)
              
              // Clear the flag but continue processing (don't skip)
              // This allows manual daily reset testing to work properly
              await prisma.habitLog.update({
                where: { id: currentDayLog.id },
                data: { updatedDuringToggle: false }
              })
              
              console.log(`✅ Cleared updatedDuringToggle flag for ${habit.title}, continuing with reset`)
            }
          }

          // Calculate new streak values based on completion
          let newStreak = 0
          let newBestStreak = oldBestStreak
          let streakAction = ''
          
          console.log(`🔢 Streak calculation for ${habit.title}: wasCompletedInPeriod=${wasCompletedInPeriod}, oldStreak=${oldStreak}, oldBestStreak=${oldBestStreak}`)
          
          if (wasCompletedInPeriod) {
            // Habit was completed - increment streak
            newStreak = oldStreak + 1
            newBestStreak = Math.max(oldBestStreak, newStreak)
            streakAction = 'streak_incremented'
            streaksUpdated++
            console.log(`✅ Streak incremented: ${oldStreak} → ${newStreak}`)
          } else {
            // Habit was not completed - reset streak to 0
            newStreak = 0
            newBestStreak = oldBestStreak // Keep best streak
            streakAction = 'streak_reset'
            console.log(`❌ Streak reset: ${oldStreak} → 0`)
          }
          
          // Update streak values in database (only if columns exist)
          try {
            await prisma.$executeRaw`
              UPDATE habits 
              SET "currentStreak" = ${newStreak}, "bestStreak" = ${newBestStreak}, "updatedAt" = CURRENT_TIMESTAMP
              WHERE id = ${habit.id}
            `
            console.log(`📊 Updated streaks for ${habit.title}: ${oldStreak} → ${newStreak} (best: ${oldBestStreak} → ${newBestStreak})`)
          } catch (error) {
            console.log(`⚠️ Could not update streak columns for ${habit.title} (columns may not exist in production)`)
          }

          // Create tomorrow's log for continuity (don't modify today's log - preserve user's progress)
          let logAction = 'no_log_action'
          
          if (!isWeeklyHabit) {
            // Ensure today's log exists (but don't modify if it exists - preserve user's progress)
            const todayLog = await prisma.habitLog.findFirst({
              where: {
                habitId: habit.id,
                date: {
                  gte: today,
                  lt: tomorrow
                }
              }
            })
            
            if (!todayLog) {
              // Create today's log as incomplete if it doesn't exist
              await prisma.habitLog.create({
                data: {
                  habitId: habit.id,
                  userId: habit.userId,
                  date: today,
                  completed: false
                }
              })
              logAction = 'created_today_incomplete'
            } else {
              logAction = 'today_log_preserved'
            }
            
            // Ensure tomorrow's log exists for continuity
            const tomorrowLog = await prisma.habitLog.findFirst({
              where: {
                habitId: habit.id,
                date: {
                  gte: tomorrow,
                  lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
                }
              }
            })
            
            if (!tomorrowLog) {
              // Create tomorrow's log entry (starts as incomplete/unchecked)
              await prisma.habitLog.create({
                data: {
                  habitId: habit.id,
                  userId: habit.userId,
                  date: tomorrow,
                  completed: false
                }
              })
              logsCreated++
              logAction += '_and_created_tomorrow'
            }
          }

          console.log(`📝 Habit ${habit.title}: ${streakAction} based on ${periodDescription}, ${logAction}`)

          processedHabits++

          details.push({
            habitId: habit.id,
            habitName: habit.title,
            userEmail: habit.user.email,
            frequency: habit.frequency,
            action: streakAction,
            isWeeklyHabit,
            wasCompletedInPeriod,
            periodChecked: periodDescription,
            logAction,
            oldStreak,
            newStreak,
            oldBestStreak,
            newBestStreak,
            streakChange: newStreak - oldStreak,
            bestStreakChanged: newBestStreak > oldBestStreak
          })

        } catch (error) {
          const errorMsg = `Error processing habit ${habitRaw.id} (${habitRaw.title}): ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error('💥', errorMsg)
          
          details.push({
            habitId: habitRaw.id,
            habitName: habitRaw.title,
            userEmail: habitRaw.user_email,
            frequency: habitRaw.frequency,
            action: 'error',
            error: errorMsg
          })
        }
      }

      return {
        processedHabits,
        streaksUpdated,
        logsCreated,
        weeklyHabitsSkipped,
        errors,
        details,
        totalHabits: allHabitsRaw.length
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
      // Weekly habits are evaluated on Mondays (end of week)
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