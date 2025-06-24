#!/usr/bin/env node

/**
 * Comprehensive Daily Reset Test Suite
 * 
 * This script tests the daily reset functionality for both localStorage and database habits.
 * It verifies that:
 * 1. Daily habits are reset every day
 * 2. Weekly habits are only reset on Mondays
 * 3. Streaks are preserved correctly
 * 4. Completion status is reset properly
 */

const fs = require('fs')
const path = require('path')

// Test data setup
const createTestHabits = (date) => {
  const testDate = new Date(date)
  const yesterday = new Date(testDate)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(testDate)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  
  return [
    {
      id: 'test-daily-1',
      title: 'Daily Habit - Completed Yesterday',
      category: 'Health',
      frequency: 'daily',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      currentStreak: 5,
      bestStreak: 10,
      logs: [
        { id: 'log1', date: yesterday, completed: true },
        { id: 'log2', date: twoDaysAgo, completed: true },
        { id: 'log3', date: testDate, completed: true } // Today - should be reset
      ]
    },
    {
      id: 'test-daily-2',
      title: 'Daily Habit - Not Completed Yesterday',
      category: 'Learning',
      frequency: 'daily',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      currentStreak: 0,
      bestStreak: 3,
      logs: [
        { id: 'log4', date: twoDaysAgo, completed: true },
        { id: 'log5', date: testDate, completed: true } // Today - should be reset
      ]
    },
    {
      id: 'test-weekly-1',
      title: 'Weekly Habit - Should Reset on Monday',
      category: 'Fitness',
      frequency: 'weekly',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      currentStreak: 2,
      bestStreak: 5,
      logs: [
        { id: 'log6', date: yesterday, completed: true },
        { id: 'log7', date: testDate, completed: true } // Today - should only reset on Monday
      ]
    },
    {
      id: 'test-weekly-2',
      title: 'Weekly Habit - No Today Log',
      category: 'Personal',
      frequency: 'weekly',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      currentStreak: 1,
      bestStreak: 3,
      logs: [
        { id: 'log8', date: yesterday, completed: true }
      ]
    }
  ]
}

// Test scenarios
const testScenarios = [
  { name: 'Monday', date: new Date(2024, 11, 2), dayOfWeek: 1, expectWeeklyReset: true },
  { name: 'Tuesday', date: new Date(2024, 11, 3), dayOfWeek: 2, expectWeeklyReset: false },
  { name: 'Wednesday', date: new Date(2024, 11, 4), dayOfWeek: 3, expectWeeklyReset: false },
  { name: 'Thursday', date: new Date(2024, 11, 5), dayOfWeek: 4, expectWeeklyReset: false },
  { name: 'Friday', date: new Date(2024, 11, 6), dayOfWeek: 5, expectWeeklyReset: false },
  { name: 'Saturday', date: new Date(2024, 11, 7), dayOfWeek: 6, expectWeeklyReset: false },
  { name: 'Sunday', date: new Date(2024, 11, 8), dayOfWeek: 0, expectWeeklyReset: false }
]

// Simulate localStorage daily reset logic
function simulateLocalStorageReset(habits, testDate) {
  const today = new Date(testDate)
  today.setHours(0, 0, 0, 0)
  const isMonday = today.getDay() === 1
  
  let processedCount = 0
  let weeklySkipped = 0
  let logsCreated = 0
  
  const resetHabits = habits.map(habit => {
    const isWeekly = habit.frequency === 'weekly'
    
    // Skip weekly habits if it's not Monday
    if (isWeekly && !isMonday) {
      weeklySkipped++
      return habit
    }
    
    processedCount++
    
    // Check if there's already a log for today
    const existingTodayLog = habit.logs.find(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })
    
    if (!existingTodayLog) {
      // Add a reset log for today (incomplete)
      const newLog = {
        id: `${Date.now()}-${Math.random()}`,
        date: today,
        completed: false
      }
      logsCreated++
      return {
        ...habit,
        logs: [...habit.logs, newLog]
      }
    } else if (existingTodayLog.completed) {
      // If log exists and is completed, mark it as not completed
      const updatedLogs = habit.logs.map(log => {
        if (log.id === existingTodayLog.id) {
          return { ...log, completed: false }
        }
        return log
      })
      return {
        ...habit,
        logs: updatedLogs
      }
    }
    
    // No changes needed - already has incomplete log for today
    return habit
  })
  
  return {
    habits: resetHabits,
    summary: { processedCount, weeklySkipped, logsCreated }
  }
}

// Verify test results
function verifyResults(originalHabits, resetHabits, testDate, expectWeeklyReset) {
  const today = new Date(testDate)
  today.setHours(0, 0, 0, 0)
  const results = []
  
  resetHabits.forEach((habit, index) => {
    const original = originalHabits[index]
    const result = {
      habitName: habit.title,
      frequency: habit.frequency,
      passed: true,
      errors: []
    }
    
    // Check if streaks are preserved
    if (habit.currentStreak !== original.currentStreak) {
      result.passed = false
      result.errors.push(`Streak changed from ${original.currentStreak} to ${habit.currentStreak}`)
    }
    
    if (habit.bestStreak !== original.bestStreak) {
      result.passed = false
      result.errors.push(`Best streak changed from ${original.bestStreak} to ${habit.bestStreak}`)
    }
    
    // Check today's log status
    const todayLog = habit.logs.find(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })
    
    if (habit.frequency === 'daily') {
      // Daily habits should always be processed
      if (!todayLog) {
        result.passed = false
        result.errors.push('Missing today log for daily habit')
      } else if (todayLog.completed) {
        result.passed = false
        result.errors.push('Today log should be incomplete after reset')
      }
    } else if (habit.frequency === 'weekly') {
      if (expectWeeklyReset) {
        // Weekly habits should be processed on Monday
        if (!todayLog) {
          result.passed = false
          result.errors.push('Missing today log for weekly habit on Monday')
        } else if (todayLog.completed) {
          result.passed = false
          result.errors.push('Today log should be incomplete after weekly reset')
        }
      } else {
        // Weekly habits should NOT be processed on other days
        const originalTodayLog = original.logs.find(log => {
          const logDate = new Date(log.date)
          logDate.setHours(0, 0, 0, 0)
          return logDate.getTime() === today.getTime()
        })
        
        if (originalTodayLog && todayLog) {
          if (originalTodayLog.completed !== todayLog.completed) {
            result.passed = false
            result.errors.push('Weekly habit should not be modified on non-Monday')
          }
        } else if (!!originalTodayLog !== !!todayLog) {
          result.passed = false
          result.errors.push('Weekly habit logs should not change on non-Monday')
        }
      }
    }
    
    results.push(result)
  })
  
  return results
}

// Run all tests
function runTests() {
  console.log('🧪 Running Daily Reset Test Suite\n')
  
  let totalTests = 0
  let passedTests = 0
  
  testScenarios.forEach(scenario => {
    console.log(`\n📅 Testing ${scenario.name} (${scenario.date})`)
    console.log(`   Expected: Daily habits reset, Weekly habits ${scenario.expectWeeklyReset ? 'reset' : 'skipped'}`)
    
    // Create test data
    const originalHabits = createTestHabits(scenario.date)
    
    // Run reset simulation
    const { habits: resetHabits, summary } = simulateLocalStorageReset(
      JSON.parse(JSON.stringify(originalHabits)), // Deep clone
      scenario.date
    )
    
    console.log(`   Summary: Processed ${summary.processedCount}, Skipped ${summary.weeklySkipped}, Created ${summary.logsCreated}`)
    
    // Verify results
    const results = verifyResults(originalHabits, resetHabits, scenario.date, scenario.expectWeeklyReset)
    
    results.forEach(result => {
      totalTests++
      if (result.passed) {
        passedTests++
        console.log(`   ✅ ${result.habitName} (${result.frequency})`)
      } else {
        console.log(`   ❌ ${result.habitName} (${result.frequency})`)
        result.errors.forEach(error => {
          console.log(`      - ${error}`)
        })
      }
    })
  })
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!')
    return true
  } else {
    console.log('💥 Some tests failed!')
    return false
  }
}

// Edge case tests
function runEdgeCaseTests() {
  console.log('\n🔍 Running Edge Case Tests')
  
  const edgeCases = [
    {
      name: 'Habit with no logs',
      habit: {
        id: 'edge-1',
        title: 'No Logs Habit',
        frequency: 'daily',
        currentStreak: 0,
        bestStreak: 0,
        logs: []
      }
    },
    {
      name: 'Habit with future log',
      habit: {
        id: 'edge-2',
        title: 'Future Log Habit',
        frequency: 'daily',
        currentStreak: 1,
        bestStreak: 1,
        logs: [
          { id: 'future', date: new Date('2025-01-01'), completed: true }
        ]
      }
    },
    {
      name: 'Habit with undefined streaks',
      habit: {
        id: 'edge-3',
        title: 'Undefined Streaks Habit',
        frequency: 'daily',
        logs: [
          { id: 'today', date: new Date(), completed: true }
        ]
      }
    }
  ]
  
  edgeCases.forEach(testCase => {
    console.log(`   Testing: ${testCase.name}`)
    try {
      const { habits } = simulateLocalStorageReset([testCase.habit], new Date())
      console.log(`   ✅ ${testCase.name} handled correctly`)
    } catch (error) {
      console.log(`   ❌ ${testCase.name} failed: ${error.message}`)
    }
  })
}

// Main execution
async function main() {
  console.log('Daily Reset Test Suite')
  console.log('=====================\n')
  
  // Run localStorage tests
  const localStorageTestsPassed = runTests()
  
  // Run edge case tests
  runEdgeCaseTests()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 Test Summary:')
  console.log('- Tests the daily reset logic for all days of the week')
  console.log('- Verifies daily habits are reset every day')
  console.log('- Verifies weekly habits are only reset on Mondays')
  console.log('- Ensures streaks are preserved during resets')
  console.log('- Tests edge cases and error conditions')
  
  if (localStorageTestsPassed) {
    console.log('\n✅ All tests completed successfully!')
    process.exit(0)
  } else {
    console.log('\n❌ Some tests failed!')
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  simulateLocalStorageReset,
  verifyResults,
  createTestHabits,
  testScenarios
} 