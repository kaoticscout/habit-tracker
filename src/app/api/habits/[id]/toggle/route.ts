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
  console.log(`🧮 [CALC] Starting calculateHabitStreaks for habit ${habitId}, frequency: ${frequency}`)
  
  const logs = await prisma.habitLog.findMany({
    where: {
      habitId,
      userId
    },
    orderBy: {
      date: 'desc'
    }
  })
  
  console.log(`🧮 [CALC] Found ${logs.length} logs for habit`)
  console.log(`🧮 [CALC] Recent logs:`, logs.slice(0, 3).map(log => ({
    date: log.date.toISOString(),
    completed: log.completed,
    updatedDuringToggle: log.updatedDuringToggle
  })))

  let currentStreak = 0
  let bestStreak = 0

  if (frequency === 'daily') {
    // For daily habits - calculate current streak properly
    console.log(`🧮 [CALC] Starting daily streak calculation`)
    
    // Check if today is completed first
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayLog = logs.find(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })
    
    console.log(`🧮 [CALC] Today's log:`, todayLog ? {
      date: todayLog.date.toISOString(),
      completed: todayLog.completed
    } : 'none')
    
    if (todayLog?.completed) {
      // Today is completed - start streak from today and count backwards
      console.log(`🧮 [CALC] Today is completed, counting backwards from today`)
      currentStreak = 1
      
      // Count backwards for consecutive days before today
      for (let i = 1; ; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        checkDate.setHours(0, 0, 0, 0)
        
        const logForDate = logs.find(log => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === checkDate.getTime()
        })
        
        console.log(`🧮 [CALC] Checking day ${i} days ago:`, {
          date: checkDate.toISOString(),
          hasLog: !!logForDate,
          completed: logForDate?.completed
        })
        
        if (logForDate?.completed) {
          currentStreak++
        } else {
          break
        }
      }
    } else {
      // Today is not completed - current streak is 0
      console.log(`🧮 [CALC] Today is not completed, current streak is 0`)
      currentStreak = 0
    }

    // Calculate best streak by going through all logs chronologically
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
    // For weekly habits - calculate current streak properly
    console.log(`🧮 [CALC] Starting weekly streak calculation`)
    
    const getWeekStart = (date: Date) => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      d.setDate(diff)
      d.setHours(0, 0, 0, 0)
      return d
    }

    // Check if THIS week has any completed logs
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thisWeekStart = getWeekStart(today)
    
    const thisWeekLogs = logs.filter(log => {
      const logWeekStart = getWeekStart(new Date(log.date))
      return logWeekStart.getTime() === thisWeekStart.getTime() && log.completed
    })
    
    console.log(`🧮 [CALC] This week's completed logs:`, thisWeekLogs.length)
    console.log(`🧮 [CALC] Week start:`, thisWeekStart.toISOString())
    
    if (thisWeekLogs.length > 0) {
      // This week has completed logs - start streak from this week and count backwards
      console.log(`🧮 [CALC] This week is completed, counting backwards from this week`)
      currentStreak = 1
      
      // Count backwards for consecutive weeks before this week
      let weekOffset = 1
      while (true) {
        const checkWeekStart = new Date(thisWeekStart)
        checkWeekStart.setDate(thisWeekStart.getDate() - (weekOffset * 7))
        
        const weekLogs = logs.filter(log => {
          const logWeekStart = getWeekStart(new Date(log.date))
          return logWeekStart.getTime() === checkWeekStart.getTime() && log.completed
        })
        
        console.log(`🧮 [CALC] Checking week ${weekOffset} weeks ago:`, {
          weekStart: checkWeekStart.toISOString(),
          completedLogs: weekLogs.length
        })
        
        if (weekLogs.length > 0) {
          currentStreak++
          weekOffset++
        } else {
          break
        }
      }
    } else {
      // This week has no completed logs - current streak is 0
      console.log(`🧮 [CALC] This week is not completed, current streak is 0`)
      currentStreak = 0
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

  console.log(`🧮 [CALC] Final calculation results: current=${currentStreak}, best=${bestStreak}`)
  
  return {
    currentStreak: Math.max(0, currentStreak),
    bestStreak: Math.max(0, bestStreak)
  }
}

// Helper function to calculate intuitive streak impact
const calculateIntuitiveStreakImpact = async (habitId: string, userId: string, frequency: string, isTodayCompleted: boolean) => {
  console.log(`🧮 [INTUITIVE] Starting intuitive streak calculation for habit ${habitId}`)
  
  const logs = await prisma.habitLog.findMany({
    where: {
      habitId,
      userId
    },
    orderBy: {
      date: 'desc'
    }
  })
  
  console.log(`🧮 [INTUITIVE] Found ${logs.length} logs for habit`)
  
  if (frequency === 'daily') {
    // Calculate yesterday's streak (excluding today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    console.log(`🧮 [INTUITIVE] Calculating yesterday's streak from ${yesterday.toISOString()}`)
    
    let yesterdayStreak = 0
    let currentDate = new Date(yesterday)
    
    while (true) {
      currentDate.setHours(0, 0, 0, 0)
      const log = logs.find(l => {
        const logDate = new Date(l.date)
        logDate.setHours(0, 0, 0, 0)
        return logDate.getTime() === currentDate.getTime()
      })
      
      console.log(`🧮 [INTUITIVE] Checking ${currentDate.toISOString()}: ${log ? (log.completed ? '✅' : '❌') : 'no log'}`)
      
      if (!log || !log.completed) {
        console.log(`🧮 [INTUITIVE] Breaking yesterday's streak at ${currentDate.toISOString()}`)
        break
      }
      
      yesterdayStreak++
      console.log(`🧮 [INTUITIVE] Yesterday's streak increased to ${yesterdayStreak}`)
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    console.log(`🧮 [INTUITIVE] Yesterday's streak: ${yesterdayStreak}`)
    
    // Today's impact: if completed, add 1 to yesterday's streak; if not, show yesterday's streak
    const finalStreak = isTodayCompleted ? yesterdayStreak + 1 : yesterdayStreak
    console.log(`🧮 [INTUITIVE] Final intuitive streak: ${finalStreak} (yesterday: ${yesterdayStreak}, today: ${isTodayCompleted ? '+1' : '+0'})`)
    
    return finalStreak
  } else if (frequency === 'weekly') {
    // For weekly habits, use the same logic but for weeks
    const getWeekStart = (date: Date) => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      d.setDate(diff)
      d.setHours(0, 0, 0, 0)
      return d
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thisWeekStart = getWeekStart(today)
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    
    console.log(`🧮 [INTUITIVE] Calculating last week's streak from ${lastWeekStart.toISOString()}`)
    
    let lastWeekStreak = 0
    let currentWeekStart = new Date(lastWeekStart)
    
    while (true) {
      const weekLogs = logs.filter(log => {
        const logWeekStart = getWeekStart(new Date(log.date))
        return logWeekStart.getTime() === currentWeekStart.getTime() && log.completed
      })
      
      console.log(`🧮 [INTUITIVE] Checking week ${currentWeekStart.toISOString()}: ${weekLogs.length} completed logs`)
      
      if (weekLogs.length === 0) {
        console.log(`🧮 [INTUITIVE] Breaking last week's streak at ${currentWeekStart.toISOString()}`)
        break
      }
      
      lastWeekStreak++
      console.log(`🧮 [INTUITIVE] Last week's streak increased to ${lastWeekStreak}`)
      currentWeekStart.setDate(currentWeekStart.getDate() - 7)
    }
    
    console.log(`🧮 [INTUITIVE] Last week's streak: ${lastWeekStreak}`)
    
    // This week's impact: if completed, add 1 to last week's streak; if not, show last week's streak
    const finalStreak = isTodayCompleted ? lastWeekStreak + 1 : lastWeekStreak
    console.log(`🧮 [INTUITIVE] Final intuitive streak: ${finalStreak} (last week: ${lastWeekStreak}, this week: ${isTodayCompleted ? '+1' : '+0'})`)
    
    return finalStreak
  }
  
  return 0
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

    // For weekly/monthly habits, check if already completed this week/month (but not today)
    if (habit.frequency.toLowerCase() === 'weekly' || habit.frequency.toLowerCase() === 'monthly') {
      const today = new Date()
      
      let startOfPeriod: Date
      let endOfPeriod: Date
      
      if (habit.frequency.toLowerCase() === 'weekly') {
        // Calculate Monday of this week (handle Sunday = 0 case)
        const dayOfWeek = today.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startOfPeriod = new Date(today)
        startOfPeriod.setDate(today.getDate() - daysFromMonday)
        startOfPeriod.setHours(0, 0, 0, 0)
        
        endOfPeriod = new Date(startOfPeriod)
        endOfPeriod.setDate(startOfPeriod.getDate() + 6)
        endOfPeriod.setHours(23, 59, 59, 999)
      } else {
        // Monthly: start of month to end of month
        startOfPeriod = new Date(today.getFullYear(), today.getMonth(), 1)
        startOfPeriod.setHours(0, 0, 0, 0)
        
        endOfPeriod = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        endOfPeriod.setHours(23, 59, 59, 999)
      }
      
      // Check if there's already a completed log this week/month (but not today)
      const thisPeriodCompletedLog = await prisma.habitLog.findFirst({
        where: {
          habitId: params.id,
          userId: user.id,
          date: {
            gte: startOfPeriod,
            lte: endOfPeriod
          },
          completed: true,
          // Exclude today's log - we want to allow toggling today's log
          NOT: {
            date: {
              equals: new Date(today.getFullYear(), today.getMonth(), today.getDate())
            }
          }
        }
      })
      
      if (thisPeriodCompletedLog) {
        console.log(`🚫 [TOGGLE] ${habit.frequency} habit ${habit.title} already completed earlier this ${habit.frequency.toLowerCase()}, preventing toggle`)
        return NextResponse.json({ 
          error: `${habit.frequency} habit already completed this ${habit.frequency.toLowerCase()}`,
          message: `This ${habit.frequency.toLowerCase()} habit has already been completed for this ${habit.frequency.toLowerCase()}. You cannot toggle it until next ${habit.frequency.toLowerCase()}.`,
          completed: true,
          completedThisWeek: true
        }, { status: 400 })
      }
    }

    // Parse the date from request body if provided, otherwise use server's today
    let requestBody: { date?: string } = {}
    try {
      const rawBody = await req.text()
      console.log(`📨 [TOGGLE] Raw request body: ${rawBody}`)
      if (rawBody) {
        requestBody = JSON.parse(rawBody)
        console.log(`📨 [TOGGLE] Parsed request body:`, requestBody)
      }
    } catch (e) {
      console.log(`📨 [TOGGLE] No valid JSON body provided:`, e)
    }

    let today: Date
    if (requestBody.date) {
      // Use the date provided by the client (in their timezone)
      today = new Date(requestBody.date)
      console.log(`📅 [TOGGLE] Using client-provided date: ${requestBody.date} → ${today.toISOString()}`)
    } else {
      // Fallback: use server's date calculation (may have timezone issues)
      const now = new Date()
      today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      console.log(`📅 [TOGGLE] No client date provided, using server-calculated date: ${today.toISOString()}`)
      console.log(`📅 [TOGGLE] Server timezone info: ${now.toString()}`)
    }

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
      const newCompletedState = !existingLog.completed
      console.log(`🔄 [TOGGLE] Toggling existing log: ${existingLog.completed} → ${newCompletedState}`)
      console.log(`📊 [TOGGLE] Existing log details:`, {
        id: existingLog.id,
        date: existingLog.date.toISOString(),
        completed: existingLog.completed,
        habitId: existingLog.habitId
      })
      
      // Toggle existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { 
          completed: newCompletedState,
          // Mark that this was updated during toggle to prevent double counting in daily reset
          updatedDuringToggle: true
        }
      })
      
      console.log(`✅ [TOGGLE] Updated log result:`, {
        id: log.id,
        date: log.date.toISOString(),
        completed: log.completed
      })
    } else {
      console.log('➕ [TOGGLE] Creating new log with completed: true')
      console.log(`📅 [TOGGLE] Creating log for date: ${today.toISOString()}`)
      
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
      
      console.log(`✅ [TOGGLE] Created new log:`, {
        id: log.id,
        date: log.date.toISOString(),
        completed: log.completed
      })
    }

    // Calculate and update streaks immediately
    console.log(`🧮 [TOGGLE] Starting streak calculation for habit ${habit.title}`)
    console.log(`🧮 [TOGGLE] Log completed state: ${log.completed}`)
    console.log(`🧮 [TOGGLE] Habit current streaks before update: current=${habit.currentStreak}, best=${habit.bestStreak}`)
    
    // Use the new intuitive streak calculation
    const newCurrentStreak = await calculateIntuitiveStreakImpact(params.id, user.id, habit.frequency, log.completed)
    
    // For best streak, we still need to calculate the full streak to see if we beat the record
    const fullStreakCalculation = await calculateHabitStreaks(params.id, user.id, habit.frequency)
    const newBestStreak = Math.max(habit.bestStreak || 0, fullStreakCalculation.bestStreak)
    
    console.log(`🧮 [TOGGLE] Calculated new streaks: current=${newCurrentStreak}, best=${newBestStreak}`)
    
    // Update habit with new streak values
    try {
      const updatedHabit = await prisma.habit.update({
        where: { id: params.id },
        data: {
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          updatedAt: new Date()
        }
      })
      
      console.log(`📈 [TOGGLE] Updated streaks for ${habit.title}: ${habit.currentStreak || 0} → ${newCurrentStreak} (best: ${habit.bestStreak || 0} → ${newBestStreak})`)
      console.log(`🧮 [TOGGLE] Updated habit streaks in database: current=${updatedHabit.currentStreak}, best=${updatedHabit.bestStreak}`)
    } catch (error) {
      console.log(`⚠️ [TOGGLE] Could not update streak columns for ${habit.title}:`, error)
    }

    console.log(`✅ [TOGGLE] Final result:`, {
      id: log.id,
      completed: log.completed,
      date: log.date.toISOString(),
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak
    })

    return NextResponse.json({
      success: true,
      completed: log.completed,
      date: log.date,
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak
    })
  } catch (error) {
    console.error('💥 [TOGGLE] Error toggling habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 