import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const scenario = searchParams.get('scenario')
    const testDate = searchParams.get('date')

    // Create dynamic test scenarios based on current date
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(today.getDate() - 2)
    
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]
    
    console.log(`📅 [DEBUG] Dynamic dates calculated:`, {
      today: todayStr,
      yesterday: yesterdayStr,
      twoDaysAgo: twoDaysAgoStr,
      currentTime: today.toISOString(),
      currentDate: today.toDateString()
    })

    // Test scenarios for easy debugging
    const TEST_SCENARIOS = {
      'toggle-streak-preservation': {
        name: 'Toggle Streak Preservation Test',
        description: 'Tests that toggling only affects current day/week, not entire streak',
        habits: [{
          title: 'Daily Toggle Test',
          frequency: 'daily',
          logs: [
            { date: twoDaysAgoStr, completed: true },
            { date: yesterdayStr, completed: true },
            { date: todayStr, completed: true }
          ]
        }]
      },
      'daily-toggle-test': {
        name: 'Daily Habit Toggle Test',
        description: 'Tests daily habit toggle behavior with existing streak',
        habits: [{
          title: 'Daily Toggle Habit',
          frequency: 'daily',
          logs: [
            { date: twoDaysAgoStr, completed: true },
            { date: yesterdayStr, completed: true },
            { date: todayStr, completed: true }
          ]
        }]
      },
      'weekly-toggle-test': {
        name: 'Weekly Habit Toggle Test',
        description: 'Tests weekly habit toggle behavior with existing streak',
        habits: [{
          title: 'Weekly Toggle Habit',
          frequency: 'weekly',
          logs: [
            { date: '2024-12-22', completed: true }, // Sunday
            { date: '2024-12-29', completed: true }  // Next Sunday
          ]
        }]
      },
      'daily-streak': {
        name: 'Daily Streak Test',
        description: 'Tests basic daily streak functionality with consecutive days',
        habits: [
          {
            title: 'Test Daily Exercise',
            frequency: 'daily',
            logs: [
              { date: '2025-01-01', completed: true },
              { date: '2025-01-02', completed: true },
              { date: '2025-01-03', completed: true },
              { date: '2025-01-04', completed: false },
              { date: '2025-01-05', completed: true },
              { date: '2025-01-06', completed: true }
            ]
          }
        ]
      },
      'weekly-sunday': {
        name: 'Weekly Sunday Bug Test',
        description: 'Tests the Sunday week boundary bug in weekly habits',
        habits: [
          {
            title: 'Test Weekly Review',
            frequency: 'weekly',
            logs: [
              { date: '2025-01-05', completed: true }, // Sunday
              { date: '2025-01-12', completed: true }, // Next Sunday
              { date: '2025-01-19', completed: false }, // Missing week
              { date: '2025-01-26', completed: true } // Should reset streak
            ]
          }
        ]
      }
    }

    if (action === 'list') {
      return NextResponse.json({
        scenarios: Object.keys(TEST_SCENARIOS).map(key => ({
          key,
          ...TEST_SCENARIOS[key]
        }))
      })
    }

    if (action === 'setup' && scenario) {
      const testScenario = TEST_SCENARIOS[scenario]
      if (!testScenario) {
        return NextResponse.json({ error: 'Invalid scenario' }, { status: 400 })
      }

      console.log(`🚀 [DEBUG] Setting up scenario: ${scenario}`)
      
      // First find the user by email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      // Clear existing test habits
      await prisma.habit.deleteMany({
        where: {
          userId: user.id,
          title: {
            in: testScenario.habits.map(h => h.title)
          }
        }
      })

      // Create new test habits
      const createdHabits = []
      for (const habitData of testScenario.habits) {
        console.log(`🔍 [DEBUG] Creating habit: ${habitData.title}`)
        
        const habit = await prisma.habit.create({
          data: {
            title: habitData.title,
            frequency: habitData.frequency,
            userId: user.id,
            currentStreak: 0
          }
        })

        console.log(`✅ [DEBUG] Created habit with ID: ${habit.id}`)

        // Create logs
        console.log(`📝 [DEBUG] Creating ${habitData.logs.length} logs for habit`)
        for (const logData of habitData.logs) {
          console.log(`📝 [DEBUG] Creating log: ${logData.date} (completed: ${logData.completed})`)
          await prisma.habitLog.create({
            data: {
              habitId: habit.id,
              userId: user.id,
              date: new Date(logData.date),
              completed: logData.completed
            }
          })
        }

        // Calculate and update initial streak
        console.log(`🔍 [DEBUG] Calculating initial streak for habit`)
        const logs = await prisma.habitLog.findMany({
          where: { habitId: habit.id },
          orderBy: { date: 'desc' }
        })

        console.log(`📋 [DEBUG] Found ${logs.length} logs:`, logs.map(l => ({
          date: l.date,
          completed: l.completed
        })))

        const targetDate = new Date()
        console.log(`📅 [DEBUG] Target date for streak calculation: ${targetDate.toISOString()}`)
        
        const streak = habitData.frequency === 'daily' 
          ? calculateDailyStreak(logs, targetDate)
          : calculateWeeklyStreak(logs, targetDate)

        console.log(`📊 [DEBUG] Calculated initial streak: ${streak}`)

        await prisma.habit.update({
          where: { id: habit.id },
          data: { currentStreak: streak }
        })

        console.log(`✅ [DEBUG] Updated habit streak to: ${streak}`)

        createdHabits.push(habit)
      }

      console.log(`✅ [DEBUG] Setup completed successfully`)
      return NextResponse.json({ 
        message: 'Test scenario setup complete',
        habits: createdHabits
      })
    }

    if (action === 'inspect' && scenario) {
      const testScenario = TEST_SCENARIOS[scenario]
      if (!testScenario) {
        return NextResponse.json({ error: 'Invalid scenario' }, { status: 400 })
      }

      const habits = await prisma.habit.findMany({
        where: {
          userId: session.user.email,
          title: {
            in: testScenario.habits.map(h => h.title)
          }
        },
        include: {
          logs: {
            orderBy: { date: 'desc' }
          }
        }
      })

      if (habits.length === 0) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
      }

      return NextResponse.json({ habits })
    }

    if (action === 'simulate-toggle') {
      const habitId = searchParams.get('habitId')
      const date = searchParams.get('date')
      
      if (!habitId || !date) {
        return NextResponse.json({ error: 'Missing habitId or date' }, { status: 400 })
      }

      // Find the user by email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get the habit
      const habit = await prisma.habit.findFirst({
        where: {
          id: habitId,
          userId: user.id
        },
        include: {
          logs: {
            orderBy: { date: 'desc' }
          }
        }
      })

      if (!habit) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
      }

      // Get current streak
      const targetDate = new Date()
      const oldStreak = habit.frequency === 'daily' 
        ? calculateDailyStreak(habit.logs, targetDate)
        : calculateWeeklyStreak(habit.logs, targetDate)

      console.log(`🔍 [DEBUG] Simulate toggle - Before toggle:`, {
        habitId: habit.id,
        habitTitle: habit.title,
        testDate: date,
        logsCount: habit.logs.length,
        logs: habit.logs.map(l => ({ date: l.date, completed: l.completed })),
        oldStreak,
        frequency: habit.frequency
      })

      // Simulate the toggle by creating/updating a log for the test date
      const testDate = new Date(date)
      const existingLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        return logDate.toISOString().split('T')[0] === testDate.toISOString().split('T')[0]
      })

      console.log(`🔍 [DEBUG] Found existing log for test date:`, {
        testDate: testDate.toISOString().split('T')[0],
        existingLog: existingLog ? { date: existingLog.date, completed: existingLog.completed } : null
      })

      let newCompletedStatus = true
      if (existingLog) {
        // Toggle the existing log
        newCompletedStatus = !existingLog.completed
        await prisma.habitLog.update({
          where: { id: existingLog.id },
          data: { completed: newCompletedStatus }
        })
        console.log(`🔄 [DEBUG] Toggled existing log from ${existingLog.completed} to ${newCompletedStatus}`)
      } else {
        // Create a new log for the test date
        await prisma.habitLog.create({
          data: {
            habitId: habit.id,
            userId: user.id,
            date: testDate,
            completed: true
          }
        })
        console.log(`➕ [DEBUG] Created new log for test date with completed: true`)
      }

      // Get updated logs and calculate new streak using intuitive calculation
      const updatedLogs = await prisma.habitLog.findMany({
        where: { habitId: habit.id },
        orderBy: { date: 'desc' }
      })

      let newStreak: number
      if (habit.frequency === 'daily') {
        newStreak = calculateIntuitiveStreak(updatedLogs, targetDate, newCompletedStatus)
      } else if (habit.frequency === 'weekly') {
        // For weekly habits, check if this week has any completed logs
        const thisWeekStart = getWeekStart(targetDate)
        const thisWeekEnd = new Date(thisWeekStart)
        thisWeekEnd.setDate(thisWeekStart.getDate() + 6)
        
        const thisWeekLogs = updatedLogs.filter(log => {
          const logDate = new Date(log.date)
          return logDate >= thisWeekStart && logDate <= thisWeekEnd
        })
        
        const isThisWeekCompleted = thisWeekLogs.some(log => log.completed)
        newStreak = calculateIntuitiveWeeklyStreak(updatedLogs, targetDate, isThisWeekCompleted)
      } else {
        // Fallback to old calculation for other frequencies
        newStreak = calculateWeeklyStreak(updatedLogs, targetDate)
      }

      console.log(`🔍 [DEBUG] Simulate toggle - After toggle:`, {
        updatedLogsCount: updatedLogs.length,
        updatedLogs: updatedLogs.map(l => ({ date: l.date, completed: l.completed })),
        newStreak,
        change: newStreak - oldStreak,
        todayCompleted: newCompletedStatus
      })

      // Update the habit's streak
      await prisma.habit.update({
        where: { id: habit.id },
        data: { currentStreak: newStreak }
      })

      return NextResponse.json({
        details: {
          oldStreak,
          newStreak,
          change: newStreak - oldStreak,
          todayCompleted: newCompletedStatus
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('❌ [DEBUG] Error in test habits API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateDailyStreak(logs: any[], targetDate: Date): number {
  console.log(`🔍 [DEBUG] Calculating daily streak for ${logs.length} logs`)
  
  const targetDateStr = targetDate.toISOString().split('T')[0]
  console.log(`📅 [DEBUG] Target date: ${targetDateStr}`)
  
  let streak = 0
  let currentDate = new Date(targetDate)
  
  console.log(`🔍 [DEBUG] Starting streak calculation from ${targetDateStr}`)
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const log = logs.find(l => l.date.toISOString().split('T')[0] === dateStr)
    
    console.log(`🔍 [DEBUG] Checking ${dateStr}: ${log ? (log.completed ? '✅' : '❌') : 'no log'}`)
    
    if (!log || !log.completed) {
      console.log(`🔍 [DEBUG] Breaking streak at ${dateStr} - no log or not completed`)
      break
    }
    
    streak++
    console.log(`📊 [DEBUG] Streak increased to ${streak} for ${dateStr}`)
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  console.log(`📊 [DEBUG] Final daily streak: ${streak}`)
  return streak
}

function calculateIntuitiveStreak(logs: any[], targetDate: Date, isTodayCompleted: boolean): number {
  console.log(`🔍 [DEBUG] Calculating intuitive streak for ${logs.length} logs`)
  
  const targetDateStr = targetDate.toISOString().split('T')[0]
  console.log(`📅 [DEBUG] Target date: ${targetDateStr}, Today completed: ${isTodayCompleted}`)
  
  // Calculate yesterday's streak (excluding today)
  const yesterday = new Date(targetDate)
  yesterday.setDate(yesterday.getDate() - 1)
  
  let yesterdayStreak = 0
  let currentDate = new Date(yesterday)
  
  console.log(`🔍 [DEBUG] Calculating yesterday's streak from ${yesterday.toISOString().split('T')[0]}`)
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const log = logs.find(l => l.date.toISOString().split('T')[0] === dateStr)
    
    console.log(`🔍 [DEBUG] Checking ${dateStr}: ${log ? (log.completed ? '✅' : '❌') : 'no log'}`)
    
    if (!log || !log.completed) {
      console.log(`🔍 [DEBUG] Breaking yesterday's streak at ${dateStr} - no log or not completed`)
      break
    }
    
    yesterdayStreak++
    console.log(`📊 [DEBUG] Yesterday's streak increased to ${yesterdayStreak} for ${dateStr}`)
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  console.log(`📊 [DEBUG] Yesterday's streak: ${yesterdayStreak}`)
  
  // Today's impact: if completed, add 1 to yesterday's streak; if not, show yesterday's streak
  const finalStreak = isTodayCompleted ? yesterdayStreak + 1 : yesterdayStreak
  console.log(`📊 [DEBUG] Final intuitive streak: ${finalStreak} (yesterday: ${yesterdayStreak}, today: ${isTodayCompleted ? '+1' : '+0'})`)
  
  return finalStreak
}

function calculateWeeklyStreak(logs: any[], targetDate: Date): number {
  console.log(`🔍 [DEBUG] Calculating weekly streak for ${logs.length} logs`)
  
  let streak = 0
  let currentWeekStart = getWeekStart(targetDate)
  
  while (true) {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)
    
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= currentWeekStart && logDate <= weekEnd
    })
    
    const hasCompletion = weekLogs.some(log => log.completed)
    
    const weekStartStr = currentWeekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]
    console.log(`🔍 [DEBUG] Week ${weekStartStr} to ${weekEndStr}: ${hasCompletion ? '✅' : '❌'} (${weekLogs.length} logs)`)
    
    if (!hasCompletion) {
      break
    }
    
    streak++
    currentWeekStart.setDate(currentWeekStart.getDate() - 7)
  }
  
  console.log(`📊 [DEBUG] Final weekly streak: ${streak}`)
  return streak
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function calculateIntuitiveWeeklyStreak(logs: any[], targetDate: Date, isThisWeekCompleted: boolean): number {
  console.log(`🔍 [DEBUG] Calculating intuitive weekly streak for ${logs.length} logs`)
  
  const targetDateStr = targetDate.toISOString().split('T')[0]
  console.log(`📅 [DEBUG] Target date: ${targetDateStr}, This week completed: ${isThisWeekCompleted}`)
  
  // Calculate last week's streak (excluding this week)
  const thisWeekStart = getWeekStart(targetDate)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(thisWeekStart.getDate() - 7)
  
  console.log(`🔍 [DEBUG] Calculating last week's streak from ${lastWeekStart.toISOString().split('T')[0]}`)
  
  let lastWeekStreak = 0
  let currentWeekStart = new Date(lastWeekStart)
  
  while (true) {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)
    
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.date)
      return logDate >= currentWeekStart && logDate <= weekEnd
    })
    
    const hasCompletion = weekLogs.some(log => log.completed)
    
    const weekStartStr = currentWeekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]
    console.log(`🔍 [DEBUG] Checking week ${weekStartStr} to ${weekEndStr}: ${hasCompletion ? '✅' : '❌'} (${weekLogs.length} logs)`)
    
    if (!hasCompletion) {
      console.log(`🔍 [DEBUG] Breaking last week's streak at ${weekStartStr} - no completion`)
      break
    }
    
    lastWeekStreak++
    console.log(`📊 [DEBUG] Last week's streak increased to ${lastWeekStreak} for week ${weekStartStr}`)
    currentWeekStart.setDate(currentWeekStart.getDate() - 7)
  }
  
  console.log(`📊 [DEBUG] Last week's streak: ${lastWeekStreak}`)
  
  // This week's impact: if completed, add 1 to last week's streak; if not, show last week's streak
  const finalStreak = isThisWeekCompleted ? lastWeekStreak + 1 : lastWeekStreak
  console.log(`📊 [DEBUG] Final intuitive weekly streak: ${finalStreak} (last week: ${lastWeekStreak}, this week: ${isThisWeekCompleted ? '+1' : '+0'})`)
  
  return finalStreak
} 