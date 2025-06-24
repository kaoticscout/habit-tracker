const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Test utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Date utilities to simulate different days
function createDateString(daysOffset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

function createDateObject(daysOffset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  date.setHours(0, 0, 0, 0)
  return date
}

function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDayOfWeek(date = new Date()) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

// Test data setup
async function setupTestUser() {
  try {
    const testUser = await prisma.user.upsert({
      where: { email: 'test-reset@example.com' },
      update: {},
      create: {
        id: 'test-reset-user',
        email: 'test-reset@example.com',
        name: 'Test Reset User',
        password: 'test123'
      }
    })
    return testUser
  } catch (error) {
    console.error('❌ Failed to setup test user:', error.message)
    throw error
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...')
  try {
    await prisma.habitLog.deleteMany({
      where: { userId: 'test-reset-user' }
    })
    await prisma.habit.deleteMany({
      where: { userId: 'test-reset-user' }
    })
    await prisma.user.deleteMany({
      where: { email: 'test-reset@example.com' }
    })
  } catch (error) {
    console.log('⚠️  Warning during cleanup:', error.message)
    // Continue even if cleanup fails
  }
}

// API call helper
async function callDailyReset() {
  try {
    const response = await fetch('http://localhost:3000/api/habits/daily-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('❌ Daily reset API call failed:', error.message)
    throw error
  }
}

// Test functions
async function test_daily_habit_completion_and_streaks() {
  console.log('\n🧪 Testing Daily Habit Completion and Streaks...')
  
  const user = await setupTestUser()
  
  // Create a daily habit
  const habit = await prisma.habit.create({
    data: {
      id: 'daily-habit-1',
      title: 'Drink Water',
      category: 'Health',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 0,
      bestStreak: 0
    }
  })
  
  // Test Case 1: Complete habit for 3 consecutive days
  console.log('📅 Case 1: Complete habit for 3 consecutive days')
  
  const logs = []
  for (let i = -2; i <= 0; i++) {
    const log = await prisma.habitLog.create({
      data: {
        id: `log-daily-${i}`,
        habitId: habit.id,
        userId: user.id,
        date: createDateObject(i),
        completed: true
      }
    })
    logs.push(log)
  }
  
  // Update habit with expected streak
  await prisma.habit.update({
    where: { id: habit.id },
    data: { currentStreak: 3, bestStreak: 3 }
  })
  
  // Run daily reset
  const result1 = await callDailyReset()
  console.log('📊 Reset result:', result1)
  
  // Verify streak remains (should not reset since today is completed)
  const updatedHabit1 = await prisma.habit.findUnique({
    where: { id: habit.id }
  })
  
  if (updatedHabit1.currentStreak === 3) {
    console.log('✅ Streak correctly maintained for completed habit')
  } else {
    console.log(`❌ Expected streak 3, got ${updatedHabit1.currentStreak}`)
  }
  
  // Test Case 2: Miss a day and check streak reset
  console.log('\n📅 Case 2: Miss today and check streak reset')
  
  // Remove today's log to simulate missing the habit
  await prisma.habitLog.deleteMany({
    where: {
      habitId: habit.id,
      date: createDateObject(0)
    }
  })
  
  const result2 = await callDailyReset()
  console.log('📊 Reset result:', result2)
  
  const updatedHabit2 = await prisma.habit.findUnique({
    where: { id: habit.id }
  })
  
  if (updatedHabit2.currentStreak === 0) {
    console.log('✅ Streak correctly reset for missed habit')
  } else {
    console.log(`❌ Expected streak 0, got ${updatedHabit2.currentStreak}`)
  }
  
  if (updatedHabit2.bestStreak === 3) {
    console.log('✅ Best streak correctly preserved')
  } else {
    console.log(`❌ Expected best streak 3, got ${updatedHabit2.bestStreak}`)
  }
}

async function test_weekly_habit_timing() {
  console.log('\n🧪 Testing Weekly Habit Reset Timing...')
  
  const user = await setupTestUser()
  
  // Create a weekly habit
  const habit = await prisma.habit.create({
    data: {
      id: 'weekly-habit-1',
      title: 'Meal Prep',
      category: 'Health',
      frequency: 'weekly',
      userId: user.id,
      isActive: true,
      currentStreak: 2,
      bestStreak: 3
    }
  })
  
  const today = new Date()
  const dayOfWeek = getDayOfWeek(today)
  
  console.log(`📅 Today is ${dayOfWeek}`)
  
  // Add a log for this week
  await prisma.habitLog.create({
    data: {
      id: 'weekly-log-current',
      habitId: habit.id,
      userId: user.id,
      date: createDateObject(-1), // Yesterday
      completed: true
    }
  })
  
  // Run daily reset
  const result = await callDailyReset()
  console.log('📊 Reset result:', result)
  
  // Check if weekly habit was processed correctly
  const weeklyActions = result.results?.filter(r => r.habitId === habit.id) || []
  const weeklyAction = weeklyActions[0]
  
  if (dayOfWeek === 'Monday') {
    console.log('🌟 Testing Monday reset (should process weekly habits)')
    if (weeklyAction?.action === 'streak_incremented') {
      console.log('✅ Weekly habit streak correctly incremented on Monday')
    } else if (weeklyAction?.action === 'streak_reset') {
      console.log('✅ Weekly habit streak correctly reset on Monday (if not completed)')
    } else {
      console.log(`❌ Unexpected weekly action on Monday: ${weeklyAction?.action}`)
    }
  } else {
    console.log(`🔍 Testing ${dayOfWeek} (should skip weekly habits)`)
    if (weeklyAction?.action === 'skipped_weekly') {
      console.log('✅ Weekly habit correctly skipped on non-Monday')
    } else {
      console.log(`❌ Expected skipped_weekly, got: ${weeklyAction?.action}`)
    }
  }
}

async function test_weekly_habit_streak_calculation() {
  console.log('\n🧪 Testing Weekly Habit Streak Calculation...')
  
  const user = await setupTestUser()
  
  // Create a weekly habit
  const habit = await prisma.habit.create({
    data: {
      id: 'weekly-habit-2',
      title: 'Exercise 3x',
      category: 'Fitness',
      frequency: 'weekly',
      userId: user.id,
      isActive: true,
      currentStreak: 0,
      bestStreak: 0
    }
  })
  
  const today = new Date()
  const weekStart = getWeekStart(today)
  
  // Test Case 1: Complete weekly habit (simulate Monday reset with completed week)
  console.log('📅 Case 1: Completed weekly habit')
  
  // Add logs from this week
  await prisma.habitLog.create({
    data: {
      id: 'weekly-complete-1',
      habitId: habit.id,
      userId: user.id,
      date: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000), // Wednesday
      completed: true
    }
  })
  
  // Simulate Monday reset by manually setting date to Monday
  const originalDateNow = Date.now
  const mockMonday = new Date(weekStart)
  Date.now = () => mockMonday.getTime()
  
  const result1 = await callDailyReset()
  console.log('📊 Reset result:', result1)
  
  const updatedHabit1 = await prisma.habit.findUnique({
    where: { id: habit.id }
  })
  
  console.log(`📈 Streak after completion: ${updatedHabit1.currentStreak}`)
  
  // Test Case 2: Miss weekly habit
  console.log('\n📅 Case 2: Missed weekly habit')
  
  // Remove all logs for this week
  await prisma.habitLog.deleteMany({
    where: {
      habitId: habit.id,
      date: {
        gte: weekStart
      }
    }
  })
  
  const result2 = await callDailyReset()
  console.log('📊 Reset result:', result2)
  
  const updatedHabit2 = await prisma.habit.findUnique({
    where: { id: habit.id }
  })
  
  console.log(`📈 Streak after miss: ${updatedHabit2.currentStreak}`)
  
  // Restore original Date.now
  Date.now = originalDateNow
}

async function test_mixed_frequency_habits() {
  console.log('\n🧪 Testing Mixed Daily and Weekly Habits...')
  
  const user = await setupTestUser()
  
  // Create both daily and weekly habits
  const dailyHabit = await prisma.habit.create({
    data: {
      id: 'mixed-daily',
      title: 'Read',
      category: 'Learning',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 5,
      bestStreak: 10
    }
  })
  
  const weeklyHabit = await prisma.habit.create({
    data: {
      id: 'mixed-weekly',
      title: 'Deep Clean',
      category: 'Home',
      frequency: 'weekly',
      userId: user.id,
      isActive: true,
      currentStreak: 2,
      bestStreak: 4
    }
  })
  
  // Add completion logs
  await prisma.habitLog.create({
    data: {
      id: 'mixed-daily-log',
      habitId: dailyHabit.id,
      userId: user.id,
      date: createDateObject(0), // Today
      completed: true
    }
  })
  
  await prisma.habitLog.create({
    data: {
      id: 'mixed-weekly-log',
      habitId: weeklyHabit.id,
      userId: user.id,
      date: createDateObject(-2), // Earlier this week
      completed: true
    }
  })
  
  const result = await callDailyReset()
  console.log('📊 Reset result:', result)
  
  // Verify both habits were processed appropriately
  const dailyResults = result.details?.filter(r => r.habitId === dailyHabit.id) || []
  const weeklyResults = result.details?.filter(r => r.habitId === weeklyHabit.id) || []
  
  console.log(`📈 Daily habit actions: ${dailyResults.map(r => r.action).join(', ')}`)
  console.log(`📈 Weekly habit actions: ${weeklyResults.map(r => r.action).join(', ')}`)
  
  if (dailyResults.some(r => r.action === 'streak_incremented')) {
    console.log('✅ Daily habit was processed and streak incremented')
  } else {
    console.log('❌ Daily habit should have been processed')
  }
  
  const today = new Date()
  if (getDayOfWeek(today) === 'Monday') {
    if (weeklyResults.length > 0 && weeklyResults[0].action !== 'skipped_weekly') {
      console.log('✅ Weekly habit was processed on Monday')
    } else {
      console.log('❌ Weekly habit was not processed on Monday')
    }
  } else {
    if (weeklyResults.some(r => r.action === 'skipped_weekly')) {
      console.log('✅ Weekly habit was correctly skipped on non-Monday')
    } else {
      console.log('❌ Weekly habit should have been skipped on non-Monday')
    }
  }
}

async function test_edge_cases() {
  console.log('\n🧪 Testing Edge Cases...')
  
  const user = await setupTestUser()
  
  // Test Case 1: Habit with no logs
  console.log('📅 Case 1: Habit with no logs')
  const emptyHabit = await prisma.habit.create({
    data: {
      id: 'empty-habit',
      title: 'New Habit',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 0,
      bestStreak: 0
    }
  })
  
  // Test Case 2: Habit with future logs (shouldn't happen but let's test)
  console.log('📅 Case 2: Habit with future logs')
  const futureHabit = await prisma.habit.create({
    data: {
      id: 'future-habit',
      title: 'Future Habit',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 0,
      bestStreak: 0
    }
  })
  
  await prisma.habitLog.create({
    data: {
      id: 'future-log',
      habitId: futureHabit.id,
      userId: user.id,
      date: createDateObject(1), // Tomorrow
      completed: true
    }
  })
  
  // Test Case 3: Inactive habit (should be skipped)
  console.log('📅 Case 3: Inactive habit')
  const inactiveHabit = await prisma.habit.create({
    data: {
      id: 'inactive-habit',
      title: 'Inactive Habit',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: false,
      currentStreak: 5,
      bestStreak: 10
    }
  })
  
  const result = await callDailyReset()
  console.log('📊 Reset result:', result)
  
  // Verify edge cases
  const emptyResults = result.details?.filter(r => r.habitId === emptyHabit.id) || []
  const futureResults = result.details?.filter(r => r.habitId === futureHabit.id) || []
  const inactiveResults = result.details?.filter(r => r.habitId === inactiveHabit.id) || []
  
  if (emptyResults.some(r => r.action === 'streak_reset')) {
    console.log('✅ Empty habit correctly had streak reset')
  } else {
    console.log('❌ Empty habit should have had streak reset')
  }
  
  if (futureResults.some(r => r.action === 'streak_reset')) {
    console.log('✅ Habit with future logs correctly had streak reset')
  } else {
    console.log('❌ Habit with future logs should have had streak reset')
  }
  
  if (inactiveResults.length === 0) {
    console.log('✅ Inactive habit was correctly skipped')
  } else {
    console.log('❌ Inactive habit should have been skipped')
  }
}

async function test_streak_boundary_conditions() {
  console.log('\n🧪 Testing Streak Boundary Conditions...')
  
  const user = await setupTestUser()
  
  // Test Case 1: Habit at max streak (edge case for large numbers)
  console.log('📅 Case 1: Habit with very high streak')
  const highStreakHabit = await prisma.habit.create({
    data: {
      id: 'high-streak-habit',
      title: 'High Streak Habit',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 365,
      bestStreak: 500
    }
  })
  
  // Complete today
  await prisma.habitLog.create({
    data: {
      id: 'high-streak-log',
      habitId: highStreakHabit.id,
      userId: user.id,
      date: createDateObject(0),
      completed: true
    }
  })
  
  // Test Case 2: Habit that should tie best streak
  console.log('📅 Case 2: Habit tying best streak')
  const tieStreakHabit = await prisma.habit.create({
    data: {
      id: 'tie-streak-habit',
      title: 'Tie Streak Habit',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 9,
      bestStreak: 10
    }
  })
  
  await prisma.habitLog.create({
    data: {
      id: 'tie-streak-log',
      habitId: tieStreakHabit.id,
      userId: user.id,
      date: createDateObject(0),
      completed: true
    }
  })
  
  // Test Case 3: Habit that should break best streak record
  console.log('📅 Case 3: Habit breaking best streak record')
  const recordHabit = await prisma.habit.create({
    data: {
      id: 'record-habit',
      title: 'Record Habit',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 14,
      bestStreak: 14
    }
  })
  
  await prisma.habitLog.create({
    data: {
      id: 'record-log',
      habitId: recordHabit.id,
      userId: user.id,
      date: createDateObject(0),
      completed: true
    }
  })
  
  const result = await callDailyReset()
  console.log('📊 Reset result:', result)
  
  // Check results
  const updatedHighStreak = await prisma.habit.findUnique({
    where: { id: highStreakHabit.id }
  })
  const updatedTieStreak = await prisma.habit.findUnique({
    where: { id: tieStreakHabit.id }
  })
  const updatedRecord = await prisma.habit.findUnique({
    where: { id: recordHabit.id }
  })
  
  console.log(`📈 High streak habit: ${updatedHighStreak.currentStreak} (was 365)`)
  console.log(`📈 Tie streak habit: ${updatedTieStreak.currentStreak} (was 9, best: ${updatedTieStreak.bestStreak})`)
  console.log(`📈 Record habit: ${updatedRecord.currentStreak} (was 14, best: ${updatedRecord.bestStreak})`)
  
  if (updatedHighStreak.currentStreak === 366) {
    console.log('✅ High streak correctly incremented')
  } else {
    console.log(`❌ High streak should be 366, got ${updatedHighStreak.currentStreak}`)
  }
  
  if (updatedTieStreak.currentStreak === 10 && updatedTieStreak.bestStreak === 10) {
    console.log('✅ Tie streak correctly reached best streak')
  } else {
    console.log(`❌ Tie streak issue: current=${updatedTieStreak.currentStreak}, best=${updatedTieStreak.bestStreak}`)
  }
  
  if (updatedRecord.currentStreak === 15 && updatedRecord.bestStreak === 15) {
    console.log('✅ Record streak correctly broke best streak')
  } else {
    console.log(`❌ Record streak issue: current=${updatedRecord.currentStreak}, best=${updatedRecord.bestStreak}`)
  }
}

async function test_performance_with_many_habits() {
  console.log('\n🧪 Testing Performance with Many Habits...')
  
  const user = await setupTestUser()
  const habitCount = 50
  
  console.log(`📊 Creating ${habitCount} habits...`)
  
  // Create many habits
  const habits = []
  for (let i = 0; i < habitCount; i++) {
    const habit = await prisma.habit.create({
      data: {
        id: `perf-habit-${i}`,
        title: `Performance Habit ${i}`,
        category: i % 2 === 0 ? 'Health' : 'Productivity',
        frequency: i % 3 === 0 ? 'weekly' : 'daily',
        userId: user.id,
        isActive: true,
        currentStreak: Math.floor(Math.random() * 20),
        bestStreak: Math.floor(Math.random() * 50) + 20
      }
    })
    habits.push(habit)
    
    // Add some random logs
    if (Math.random() > 0.3) { // 70% chance of having today's log
      await prisma.habitLog.create({
        data: {
          id: `perf-log-${i}`,
          habitId: habit.id,
          userId: user.id,
          date: createDateObject(0),
          completed: Math.random() > 0.2 // 80% completion rate
        }
      })
    }
  }
  
  console.log(`✅ Created ${habitCount} habits with logs`)
  
  // Measure performance
  const startTime = Date.now()
  const result = await callDailyReset()
  const endTime = Date.now()
  
  const duration = endTime - startTime
  console.log(`⏱️  Daily reset took ${duration}ms for ${habitCount} habits`)
  console.log(`📊 Processed ${result.results?.length || 0} habit actions`)
  
  if (duration < 5000) { // Should complete within 5 seconds
    console.log('✅ Performance test passed')
  } else {
    console.log('❌ Performance test failed - took too long')
  }
}

async function test_consecutive_streak_scenarios() {
  console.log('\n🧪 Testing Consecutive Streak Scenarios...')
  
  const user = await setupTestUser()
  
  // Test Case 1: Perfect 7-day streak
  console.log('📅 Case 1: Perfect 7-day streak')
  const perfectHabit = await prisma.habit.create({
    data: {
      id: 'perfect-streak',
      title: 'Perfect Streak',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 6,
      bestStreak: 6
    }
  })
  
  // Add logs for last 7 days including today
  for (let i = -6; i <= 0; i++) {
    await prisma.habitLog.create({
      data: {
        id: `perfect-${i}`,
        habitId: perfectHabit.id,
        userId: user.id,
        date: createDateObject(i),
        completed: true
      }
    })
  }
  
  // Test Case 2: Habit completed today but not yesterday (should be streak of 1)
  console.log('📅 Case 2: Habit completed today only (fresh start)')
  const freshHabit = await prisma.habit.create({
    data: {
      id: 'fresh-streak',
      title: 'Fresh Start Habit',
      category: 'Test',
      frequency: 'daily',
      userId: user.id,
      isActive: true,
      currentStreak: 0,
      bestStreak: 10
    }
  })
  
  // Only add today's log (completed)
  await prisma.habitLog.create({
    data: {
      id: 'fresh-today',
      habitId: freshHabit.id,
      userId: user.id,
      date: createDateObject(0), // Today only
      completed: true
    }
  })
  
  const result = await callDailyReset()
  console.log('📊 Reset result:', result)
  
  const updatedPerfect = await prisma.habit.findUnique({
    where: { id: perfectHabit.id }
  })
  
  const updatedFresh = await prisma.habit.findUnique({
    where: { id: freshHabit.id }
  })
  
  console.log(`📈 Perfect streak: ${updatedPerfect.currentStreak} (expected: 7)`)
  console.log(`📈 Fresh streak: ${updatedFresh.currentStreak} (expected: 1)`)
  
  if (updatedPerfect.currentStreak === 7 && updatedPerfect.bestStreak === 7) {
    console.log('✅ Perfect streak correctly incremented')
  } else {
    console.log(`❌ Perfect streak failed: current=${updatedPerfect.currentStreak}, best=${updatedPerfect.bestStreak}`)
  }
  
  if (updatedFresh.currentStreak === 1 && updatedFresh.bestStreak === 10) {
    console.log('✅ Fresh streak correctly started')
  } else {
    console.log(`❌ Fresh streak failed: current=${updatedFresh.currentStreak}, best=${updatedFresh.bestStreak}`)
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Daily Reset Tests')
  console.log('='.repeat(60))
  
  try {
    // Clean up any existing test data
    await cleanupTestData()
    
    // Run all test suites
    await test_daily_habit_completion_and_streaks()
    await delay(1000)
    
    await test_weekly_habit_timing()
    await delay(1000)
    
    await test_weekly_habit_streak_calculation()
    await delay(1000)
    
    await test_mixed_frequency_habits()
    await delay(1000)
    
    await test_edge_cases()
    await delay(1000)
    
    await test_streak_boundary_conditions()
    await delay(1000)
    
    await test_consecutive_streak_scenarios()
    await delay(1000)
    
    await test_performance_with_many_habits()
    
    console.log('\n✅ All tests completed!')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    console.error(error.stack)
  } finally {
    // Clean up test data
    await cleanupTestData()
    await prisma.$disconnect()
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
}

module.exports = {
  runAllTests,
  test_daily_habit_completion_and_streaks,
  test_weekly_habit_timing,
  test_weekly_habit_streak_calculation,
  test_mixed_frequency_habits,
  test_edge_cases,
  test_streak_boundary_conditions,
  test_consecutive_streak_scenarios,
  test_performance_with_many_habits
} 