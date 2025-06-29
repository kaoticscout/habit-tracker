import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Test scenarios for easy debugging
const TEST_SCENARIOS = {
  'daily-streak': {
    name: 'Daily Streak Test',
    habits: [
      {
        title: 'Test Daily Habit',
        frequency: 'daily',
        logs: [
          { date: '2025-01-01', completed: true },
          { date: '2025-01-02', completed: true },
          { date: '2025-01-03', completed: false },
          { date: '2025-01-04', completed: true },
          { date: '2025-01-05', completed: true }
        ]
      }
    ]
  },
  'weekly-sunday': {
    name: 'Weekly Sunday Edge Case',
    habits: [
      {
        title: 'Test Weekly Habit',
        frequency: 'weekly',
        logs: [
          { date: '2025-06-23', completed: true }, // Monday
          { date: '2025-06-26', completed: true }, // Thursday
          { date: '2025-06-29', completed: false }, // Sunday - will be toggled
          { date: '2025-07-02', completed: true }  // Next Wednesday
        ]
      }
    ]
  },
  'timezone-mix': {
    name: 'Mixed Timezone Logs',
    habits: [
      {
        title: 'Test Timezone Habit',
        frequency: 'daily',
        logs: [
          { date: '2025-06-28T00:00:00.000Z', completed: true }, // UTC
          { date: '2025-06-29T07:00:00.000Z', completed: false }, // UTC+7
          { date: '2025-06-30T12:00:00.000Z', completed: true }  // UTC+12
        ]
      }
    ]
  },
  'production-bug': {
    name: 'Production Bug Scenario',
    habits: [
      {
        title: 'Test Relationship Check-in',
        frequency: 'weekly',
        logs: [
          { date: '2025-06-23T00:00:00.000Z', completed: true },
          { date: '2025-06-25T00:00:00.000Z', completed: false },
          { date: '2025-06-26T00:00:00.000Z', completed: true },
          { date: '2025-06-29T00:00:00.000Z', completed: false },
          { date: '2025-06-29T07:00:00.000Z', completed: true }
        ]
      }
    ]
  }
}

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

    if (action === 'list-scenarios') {
      return NextResponse.json({
        scenarios: Object.keys(TEST_SCENARIOS),
        details: TEST_SCENARIOS
      })
    }

    if (action === 'setup' && scenario) {
      const testScenario = TEST_SCENARIOS[scenario as keyof typeof TEST_SCENARIOS]
      if (!testScenario) {
        return NextResponse.json({ error: 'Invalid scenario' }, { status: 400 })
      }

      // Clean up existing test habits
      await prisma.habit.deleteMany({
        where: {
          userId: session.user.id,
          title: { startsWith: 'Test ' }
        }
      })

      const results = []
      
      for (const habitData of testScenario.habits) {
        // Create habit
        const habit = await prisma.habit.create({
          data: {
            title: habitData.title,
            frequency: habitData.frequency,
            userId: session.user.id,
            currentStreak: 0,
            bestStreak: 0
          }
        })

        // Create logs
        for (const logData of habitData.logs) {
          await prisma.habitLog.create({
            data: {
              habitId: habit.id,
              userId: session.user.id,
              date: new Date(logData.date),
              completed: logData.completed
            }
          })
        }

        results.push({
          habitId: habit.id,
          title: habit.title,
          logsCreated: habitData.logs.length
        })
      }

      return NextResponse.json({
        message: `Test scenario "${testScenario.name}" set up successfully`,
        results
      })
    }

    if (action === 'simulate-toggle') {
      const habitId = searchParams.get('habitId')
      const clientDate = testDate ? new Date(testDate) : new Date()

      if (!habitId) {
        return NextResponse.json({ error: 'habitId required' }, { status: 400 })
      }

      // Get habit with logs
      const habit = await prisma.habit.findUnique({
        where: { id: habitId },
        include: { logs: true }
      })

      if (!habit) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
      }

      const targetDateStr = clientDate.toISOString().split('T')[0]

      // Find existing log for this date
      const existingLog = habit.logs.find(log => {
        const logDateStr = log.date.toISOString().split('T')[0]
        return logDateStr === targetDateStr
      })

      let newCompleted: boolean
      let logAction: string

      if (existingLog) {
        // Toggle existing log
        newCompleted = !existingLog.completed
        await prisma.habitLog.update({
          where: { id: existingLog.id },
          data: { 
            completed: newCompleted,
            updatedDuringToggle: true
          }
        })
        logAction = `Toggled existing log to ${newCompleted}`
      } else {
        // Create new log
        newCompleted = true
        await prisma.habitLog.create({
          data: {
            habitId: habit.id,
            userId: session.user.id,
            date: clientDate,
            completed: true,
            updatedDuringToggle: true
          }
        })
        logAction = 'Created new completed log'
      }

      // Calculate new streak
      const allLogs = await prisma.habitLog.findMany({
        where: { habitId: habit.id },
        orderBy: { date: 'desc' }
      })

      let newStreak = 0
      if (habit.frequency === 'daily') {
        newStreak = calculateDailyStreak(allLogs, clientDate)
      } else {
        newStreak = calculateWeeklyStreak(allLogs, clientDate)
      }

      const newBestStreak = Math.max(habit.bestStreak, newStreak)

      // Update habit streaks
      await prisma.habit.update({
        where: { id: habit.id },
        data: {
          currentStreak: newStreak,
          bestStreak: newBestStreak
        }
      })

      return NextResponse.json({
        message: 'Toggle simulated successfully',
        details: {
          habitTitle: habit.title,
          testDate: targetDateStr,
          logAction,
          newCompleted,
          oldStreak: habit.currentStreak,
          newStreak,
          oldBestStreak: habit.bestStreak,
          newBestStreak,
          totalLogs: allLogs.length
        }
      })
    }

    if (action === 'inspect') {
      const habitId = searchParams.get('habitId')
      const inspectDate = testDate ? new Date(testDate) : new Date()

      if (!habitId) {
        return NextResponse.json({ error: 'habitId required' }, { status: 400 })
      }

      const habit = await prisma.habit.findUnique({
        where: { id: habitId },
        include: { 
          logs: {
            orderBy: { date: 'desc' }
          }
        }
      })

      if (!habit) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
      }

      // Calculate what would happen with different dates
      const testDates = []
      for (let i = -3; i <= 3; i++) {
        const testDate = new Date(inspectDate)
        testDate.setDate(inspectDate.getDate() + i)
        
        let streak = 0
        if (habit.frequency === 'daily') {
          streak = calculateDailyStreak(habit.logs, testDate)
        } else {
          streak = calculateWeeklyStreak(habit.logs, testDate)
        }

        testDates.push({
          date: testDate.toISOString().split('T')[0],
          dayOfWeek: testDate.toLocaleDateString('en-US', { weekday: 'long' }),
          calculatedStreak: streak
        })
      }

      return NextResponse.json({
        habit: {
          id: habit.id,
          title: habit.title,
          frequency: habit.frequency,
          currentStreak: habit.currentStreak,
          bestStreak: habit.bestStreak
        },
        logs: habit.logs.map(log => ({
          id: log.id,
          date: log.date.toISOString(),
          dateStr: log.date.toISOString().split('T')[0],
          completed: log.completed,
          updatedDuringToggle: log.updatedDuringToggle
        })),
        streakCalculations: testDates
      })
    }

    return NextResponse.json({
      message: 'Debug API for testing habit logic',
      availableActions: [
        'list-scenarios - List available test scenarios',
        'setup?scenario=X - Set up a test scenario',
        'simulate-toggle?habitId=X&date=YYYY-MM-DD - Simulate toggling a habit',
        'inspect?habitId=X&date=YYYY-MM-DD - Inspect habit state and calculations'
      ]
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Streak calculation functions (matching the fixed logic)
function calculateDailyStreak(logs: any[], targetDate: Date): number {
  const targetDateStr = targetDate.toISOString().split('T')[0]
  
  const targetLog = logs.find(log => {
    const logDateStr = log.date.toISOString().split('T')[0]
    return logDateStr === targetDateStr
  })
  
  if (!targetLog || !targetLog.completed) {
    return 0
  }
  
  const sortedLogs = logs
    .filter(log => log.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => log.date.toISOString().split('T')[0])
  
  const uniqueDates = Array.from(new Set(sortedLogs))
  const targetIndex = uniqueDates.indexOf(targetDateStr)
  
  if (targetIndex === -1) return 0
  
  let streak = 1
  for (let i = targetIndex - 1; i >= 0; i--) {
    const currentDate = new Date(uniqueDates[i + 1])
    const prevDate = new Date(uniqueDates[i])
    
    const daysDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysDiff === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function calculateWeeklyStreak(logs: any[], targetDate: Date): number {
  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth()
  const targetDay = targetDate.getDate()
  const dayOfWeek = targetDate.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  
  const startOfWeek = new Date(targetYear, targetMonth, targetDay - daysFromMonday)
  const endOfWeek = new Date(targetYear, targetMonth, targetDay - daysFromMonday + 6)
  
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0]
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0]
  
  const thisWeekCompleted = logs.some(log => {
    const logDateStr = log.date.toISOString().split('T')[0]
    const isInWeek = logDateStr >= startOfWeekStr && logDateStr <= endOfWeekStr
    return isInWeek && log.completed
  })
  
  if (!thisWeekCompleted) {
    return 0
  }
  
  let streak = 1
  let currentWeekStartDate = new Date(startOfWeek)
  
  while (true) {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7)
    const currentWeekEndDate = new Date(currentWeekStartDate)
    currentWeekEndDate.setDate(currentWeekStartDate.getDate() + 6)
    
    const weekStartStr = currentWeekStartDate.toISOString().split('T')[0]
    const weekEndStr = currentWeekEndDate.toISOString().split('T')[0]
    
    const prevWeekCompleted = logs.some(log => {
      const logDateStr = log.date.toISOString().split('T')[0]
      const isInWeek = logDateStr >= weekStartStr && logDateStr <= weekEndStr
      return isInWeek && log.completed
    })
    
    if (prevWeekCompleted) {
      streak++
    } else {
      break
    }
  }
  
  return streak
} 