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
        const habit = await prisma.habit.create({
          data: {
            title: habitData.title,
            frequency: habitData.frequency,
            userId: user.id,
            currentStreak: 0
          }
        })

        // Create logs
        for (const logData of habitData.logs) {
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
        const logs = await prisma.habitLog.findMany({
          where: { habitId: habit.id },
          orderBy: { date: 'desc' }
        })

        const targetDate = new Date()
        const streak = habitData.frequency === 'daily' 
          ? calculateDailyStreak(logs, targetDate)
          : calculateWeeklyStreak(logs, targetDate)

        await prisma.habit.update({
          where: { id: habit.id },
          data: { currentStreak: streak }
        })

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

      // Simulate the toggle by creating/updating a log for the test date
      const testDate = new Date(date)
      const existingLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        return logDate.toISOString().split('T')[0] === testDate.toISOString().split('T')[0]
      })

      if (existingLog) {
        // Toggle the existing log
        await prisma.habitLog.update({
          where: { id: existingLog.id },
          data: { completed: !existingLog.completed }
        })
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
      }

      // Get updated logs and calculate new streak
      const updatedLogs = await prisma.habitLog.findMany({
        where: { habitId: habit.id },
        orderBy: { date: 'desc' }
      })

      const newStreak = habit.frequency === 'daily' 
        ? calculateDailyStreak(updatedLogs, targetDate)
        : calculateWeeklyStreak(updatedLogs, targetDate)

      // Update the habit's streak
      await prisma.habit.update({
        where: { id: habit.id },
        data: { currentStreak: newStreak }
      })

      return NextResponse.json({
        details: {
          oldStreak,
          newStreak,
          change: newStreak - oldStreak
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
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const log = logs.find(l => l.date === dateStr)
    
    console.log(`🔍 [DEBUG] Checking ${dateStr}: ${log ? (log.completed ? '✅' : '❌') : 'no log'}`)
    
    if (!log || !log.completed) {
      break
    }
    
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  console.log(`📊 [DEBUG] Final daily streak: ${streak}`)
  return streak
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