import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

// Helper function to calculate streaks for a habit
const calculateHabitStreaks = async (habitId: string, userId: string, frequency: string) => {
  const logs = await prisma.habitLog.findMany({
    where: {
      habitId,
      userId
    },
    orderBy: {
      date: 'desc'
    }
  })

  let currentStreak = 0
  let bestStreak = 0

  if (frequency === 'daily') {
    // For daily habits
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if today is completed
    const todayLog = logs.find(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })

    if (todayLog?.completed) {
      currentStreak = 1
      
      // Count backwards for consecutive days
      for (let i = 1; i < logs.length; i++) {
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)
        expectedDate.setHours(0, 0, 0, 0)
        
        const logForDate = logs.find(log => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === expectedDate.getTime()
        })
        
        if (logForDate?.completed) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate best streak
    let tempStreak = 0
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    for (const log of sortedLogs) {
      if (log.completed) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
  } else if (frequency === 'weekly') {
    // For weekly habits - check completion by week
    const getWeekStart = (date: Date) => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      d.setDate(diff)
      d.setHours(0, 0, 0, 0)
      return d
    }

    const today = new Date()
    const thisWeekStart = getWeekStart(today)
    
    // Check if this week has any completed logs
    const thisWeekLogs = logs.filter(log => {
      const logWeekStart = getWeekStart(new Date(log.date))
      return logWeekStart.getTime() === thisWeekStart.getTime() && log.completed
    })

    if (thisWeekLogs.length > 0) {
      currentStreak = 1
      
      // Count backwards for consecutive weeks
      let weekOffset = 1
      while (true) {
        const checkWeekStart = new Date(thisWeekStart)
        checkWeekStart.setDate(thisWeekStart.getDate() - (weekOffset * 7))
        
        const weekLogs = logs.filter(log => {
          const logWeekStart = getWeekStart(new Date(log.date))
          return logWeekStart.getTime() === checkWeekStart.getTime() && log.completed
        })
        
        if (weekLogs.length > 0) {
          currentStreak++
          weekOffset++
        } else {
          break
        }
      }
    }

    // Calculate best streak for weekly habits
    const weeks = new Map()
    for (const log of logs) {
      if (log.completed) {
        const weekStart = getWeekStart(new Date(log.date))
        const weekKey = weekStart.getTime()
        weeks.set(weekKey, true)
      }
    }

    const sortedWeeks = Array.from(weeks.keys()).sort((a, b) => a - b)
    let tempStreak = 0
    let lastWeek = null

    for (const week of sortedWeeks) {
      if (lastWeek === null || week === lastWeek + (7 * 24 * 60 * 60 * 1000)) {
        tempStreak++
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
      lastWeek = week
    }
  }

  return {
    currentStreak: Math.max(0, currentStreak),
    bestStreak: Math.max(0, bestStreak)
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    console.log(`🔄 [TOGGLE] Starting toggle for habit ${params.id}`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ [TOGGLE] No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ [TOGGLE] User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get habit details including frequency
    const habit = await prisma.habit.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        frequency: true,
        userId: true,
        isActive: true,
        currentStreak: true,
        bestStreak: true
      }
    })

    if (!habit) {
      console.log('❌ [TOGGLE] Habit not found')
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    console.log(`📋 [TOGGLE] Found habit: ${habit.title} (${habit.frequency})`)

    // Get today's date (start of day)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    console.log(`📅 [TOGGLE] Today (start of day): ${today.toISOString()}`)

    // Check if there's already a log for today
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: params.id,
          date: today
        }
      }
    })

    console.log(`📊 [TOGGLE] Existing log:`, existingLog ? {
      id: existingLog.id,
      completed: existingLog.completed,
      date: existingLog.date.toISOString()
    } : 'none')

    let log
    if (existingLog) {
      console.log(`🔄 [TOGGLE] Toggling existing log: ${existingLog.completed} → ${!existingLog.completed}`)
      // Toggle existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { 
          completed: !existingLog.completed,
          // Mark that this was updated during toggle to prevent double counting in daily reset
          updatedDuringToggle: true
        }
      })
    } else {
      console.log('➕ [TOGGLE] Creating new log with completed: true')
      // Create new log for today
      log = await prisma.habitLog.create({
        data: {
          habitId: params.id,
          userId: user.id,
          date: today,
          completed: true,
          // Mark that this was created during toggle
          updatedDuringToggle: true
        }
      })
    }

    // Calculate and update streaks immediately
    console.log('📊 [TOGGLE] Calculating new streaks...')
    const streaks = await calculateHabitStreaks(params.id, user.id, habit.frequency)
    
    // Update habit with new streak values
    try {
      await prisma.habit.update({
        where: { id: params.id },
        data: {
          currentStreak: streaks.currentStreak,
          bestStreak: Math.max(habit.bestStreak || 0, streaks.bestStreak),
          updatedAt: new Date()
        }
      })
      
      console.log(`📈 [TOGGLE] Updated streaks for ${habit.title}: ${habit.currentStreak || 0} → ${streaks.currentStreak} (best: ${habit.bestStreak || 0} → ${Math.max(habit.bestStreak || 0, streaks.bestStreak)})`)
    } catch (error) {
      console.log(`⚠️ [TOGGLE] Could not update streak columns for ${habit.title}:`, error)
    }

    console.log(`✅ [TOGGLE] Final result:`, {
      id: log.id,
      completed: log.completed,
      date: log.date.toISOString(),
      currentStreak: streaks.currentStreak,
      bestStreak: Math.max(habit.bestStreak || 0, streaks.bestStreak)
    })

    return NextResponse.json({
      success: true,
      completed: log.completed,
      date: log.date,
      currentStreak: streaks.currentStreak,
      bestStreak: Math.max(habit.bestStreak || 0, streaks.bestStreak)
    })
  } catch (error) {
    console.error('💥 [TOGGLE] Error toggling habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 