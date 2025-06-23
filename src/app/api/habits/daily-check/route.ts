import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    // Verify this is called from an authorized source (cron job)
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active habits with their creation date for custom interval calculations
    const activeHabits = await prisma.habit.findMany({
      where: {
        isActive: true
      },
      include: {
        logs: {
          where: {
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    let processedHabits = 0
    let createdLogs = 0
    let skippedHabits = 0
    let errors: string[] = []
    const details: any[] = []

    // Process each habit
    for (const habit of activeHabits) {
      try {
        // Check if this habit should be tracked today based on frequency
        const shouldTrackToday = shouldHabitBeTrackedToday(habit.frequency, today, habit.createdAt)
        
        if (!shouldTrackToday) {
          skippedHabits++
          details.push({
            habitId: habit.id,
            habitName: habit.title,
            frequency: habit.frequency,
            action: 'skipped',
            reason: 'Not scheduled for today'
          })
          continue
        }

        // Check if there's already a log for today
        const existingLog = habit.logs.find(log => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === today.getTime()
        })

        if (existingLog) {
          details.push({
            habitId: habit.id,
            habitName: habit.title,
            frequency: habit.frequency,
            action: 'existing_log',
            completed: existingLog.completed
          })
        } else {
          // Create log entry with completed: false
          await prisma.habitLog.create({
            data: {
              habitId: habit.id,
              userId: habit.userId,
              date: today,
              completed: false
            }
          })
          createdLogs++
          details.push({
            habitId: habit.id,
            habitName: habit.title,
            frequency: habit.frequency,
            action: 'created_log',
            completed: false
          })
        }

        processedHabits++
      } catch (error) {
        const errorMsg = `Error processing habit ${habit.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    const executionTime = Date.now() - startTime

    const result = {
      message: 'Daily habit check completed',
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      summary: {
        totalHabits: activeHabits.length,
        processedHabits,
        skippedHabits,
        createdLogs,
        errors: errors.length
      },
      date: today.toISOString(),
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      errors: errors.length > 0 ? errors : undefined
    }

    // Log success with summary
    console.log(`Daily habit check completed: ${processedHabits} habits processed, ${createdLogs} logs created, ${skippedHabits} skipped`)

    return NextResponse.json(result, { 
      status: errors.length > 0 ? 207 : 200 // 207 Multi-Status if there were some errors
    })
  } catch (error) {
    console.error('Error in daily habit check:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function shouldHabitBeTrackedToday(frequency: string, date: Date, createdAt: Date): boolean {
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  switch (frequency.toLowerCase()) {
    case 'daily':
      return true
    
    case 'weekly':
      // Track on Mondays for weekly habits
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