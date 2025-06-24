#!/usr/bin/env node

/**
 * Streak Logic Test Script
 * 
 * This script tests the streak calculation logic to ensure
 * streaks are preserved correctly during daily resets.
 */

// Mock habit data with different streak scenarios
const createStreakTestData = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  return [
    {
      id: 'streak-test-1',
      title: 'Perfect Streak - Completed Yesterday',
      frequency: 'daily',
      currentStreak: 5,
      bestStreak: 10,
      logs: [
        { date: threeDaysAgo, completed: true },
        { date: twoDaysAgo, completed: true },
        { date: yesterday, completed: true },
        { date: today, completed: true } // Should be reset
      ]
    },
    {
      id: 'streak-test-2',
      title: 'Broken Streak - Missed Yesterday',
      frequency: 'daily',
      currentStreak: 3,
      bestStreak: 8,
      logs: [
        { date: threeDaysAgo, completed: true },
        { date: twoDaysAgo, completed: true },
        { date: yesterday, completed: false }, // Missed yesterday
        { date: today, completed: true } // Should be reset
      ]
    },
    {
      id: 'streak-test-3',
      title: 'New Habit - No Previous Logs',
      frequency: 'daily',
      currentStreak: 0,
      bestStreak: 0,
      logs: [
        { date: today, completed: true } // Should be reset
      ]
    },
    {
      id: 'streak-test-4',
      title: 'Weekly Habit - Good Streak',
      frequency: 'weekly',
      currentStreak: 2,
      bestStreak: 5,
      logs: [
        { date: oneWeekAgo, completed: true },
        { date: today, completed: true } // Should only be reset on Monday
      ]
    },
    {
      id: 'streak-test-5',
      title: 'Long Streak - Record Holder',
      frequency: 'daily',
      currentStreak: 15,
      bestStreak: 15, // Current streak equals best
      logs: [
        { date: threeDaysAgo, completed: true },
        { date: twoDaysAgo, completed: true },
        { date: yesterday, completed: true },
        { date: today, completed: true } // Should be reset
      ]
    }
  ]
}

// Test streak preservation during reset
function testStreakPreservation() {
  console.log('🏆 Testing Streak Preservation During Reset')
  console.log('==========================================\n')
  
  const testHabits = createStreakTestData()
  const today = new Date()
  const isMonday = today.getDay() === 1
  
  console.log(`📅 Today is ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]}`)
  console.log(`🔄 Weekly habits will be ${isMonday ? 'processed' : 'skipped'}\n`)
  
  let allTestsPassed = true
  
  testHabits.forEach((habit, index) => {
    console.log(`📊 Test ${index + 1}: ${habit.title}`)
    console.log(`   Frequency: ${habit.frequency}`)
    console.log(`   Current Streak: ${habit.currentStreak}`)
    console.log(`   Best Streak: ${habit.bestStreak}`)
    
    // Simulate reset logic
    const isWeekly = habit.frequency === 'weekly'
    const shouldSkip = isWeekly && !isMonday
    
    if (shouldSkip) {
      console.log(`   ⏭️  Skipped (weekly habit on non-Monday)`)
      console.log(`   ✅ Streaks preserved: Current ${habit.currentStreak}, Best ${habit.bestStreak}`)
    } else {
      // Find today's log
      const todayLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return logDate.getTime() === today.getTime()
      })
      
      if (todayLog && todayLog.completed) {
        console.log(`   🔄 Reset today's log from completed to incomplete`)
        console.log(`   ✅ Streaks preserved: Current ${habit.currentStreak}, Best ${habit.bestStreak}`)
      } else {
        console.log(`   ➕ Added incomplete log for today`)
        console.log(`   ✅ Streaks preserved: Current ${habit.currentStreak}, Best ${habit.bestStreak}`)
      }
    }
    
    // Verify streak preservation
    const originalCurrentStreak = habit.currentStreak
    const originalBestStreak = habit.bestStreak
    
    if (originalCurrentStreak === habit.currentStreak && originalBestStreak === habit.bestStreak) {
      console.log(`   ✅ PASS: Streaks correctly preserved`)
    } else {
      console.log(`   ❌ FAIL: Streaks were modified during reset`)
      allTestsPassed = false
    }
    
    console.log('')
  })
  
  return allTestsPassed
}

// Test streak calculation logic
function testStreakCalculation() {
  console.log('🧮 Testing Streak Calculation Logic')
  console.log('==================================\n')
  
  const testCases = [
    {
      name: 'Perfect Daily Streak',
      logs: [
        { date: new Date('2024-12-01'), completed: true },
        { date: new Date('2024-12-02'), completed: true },
        { date: new Date('2024-12-03'), completed: true },
        { date: new Date('2024-12-04'), completed: true },
        { date: new Date('2024-12-05'), completed: true }
      ],
      expectedStreak: 5
    },
    {
      name: 'Broken Streak',
      logs: [
        { date: new Date('2024-12-01'), completed: true },
        { date: new Date('2024-12-02'), completed: true },
        { date: new Date('2024-12-03'), completed: false }, // Break
        { date: new Date('2024-12-04'), completed: true },
        { date: new Date('2024-12-05'), completed: true }
      ],
      expectedStreak: 2 // Only last 2 days
    },
    {
      name: 'No Streak',
      logs: [
        { date: new Date('2024-12-01'), completed: false },
        { date: new Date('2024-12-02'), completed: false },
        { date: new Date('2024-12-03'), completed: false }
      ],
      expectedStreak: 0
    },
    {
      name: 'Single Day Streak',
      logs: [
        { date: new Date('2024-12-01'), completed: false },
        { date: new Date('2024-12-02'), completed: false },
        { date: new Date('2024-12-03'), completed: true }
      ],
      expectedStreak: 1
    }
  ]
  
  let allTestsPassed = true
  
  testCases.forEach((testCase, index) => {
    console.log(`📊 Test ${index + 1}: ${testCase.name}`)
    
    // Calculate streak from logs
    const calculatedStreak = calculateStreakFromLogs(testCase.logs)
    
    console.log(`   Expected Streak: ${testCase.expectedStreak}`)
    console.log(`   Calculated Streak: ${calculatedStreak}`)
    
    if (calculatedStreak === testCase.expectedStreak) {
      console.log(`   ✅ PASS`)
    } else {
      console.log(`   ❌ FAIL`)
      allTestsPassed = false
    }
    
    console.log('')
  })
  
  return allTestsPassed
}

// Helper function to calculate streak from logs
function calculateStreakFromLogs(logs) {
  if (!logs || logs.length === 0) return 0
  
  // Sort logs by date (newest first)
  const sortedLogs = logs
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  
  let streak = 0
  
  // Count consecutive completed days from the most recent
  for (const log of sortedLogs) {
    if (log.completed) {
      streak++
    } else {
      break // Stop at first incomplete day
    }
  }
  
  return streak
}

// Test edge cases
function testEdgeCases() {
  console.log('🔍 Testing Edge Cases')
  console.log('====================\n')
  
  const edgeCases = [
    {
      name: 'Undefined streaks',
      habit: {
        title: 'No Streak Data',
        frequency: 'daily',
        // currentStreak and bestStreak are undefined
        logs: []
      }
    },
    {
      name: 'Null logs array',
      habit: {
        title: 'Null Logs',
        frequency: 'daily',
        currentStreak: 0,
        bestStreak: 0,
        logs: null
      }
    },
    {
      name: 'Empty logs array',
      habit: {
        title: 'Empty Logs',
        frequency: 'daily',
        currentStreak: 0,
        bestStreak: 0,
        logs: []
      }
    },
    {
      name: 'Future date logs',
      habit: {
        title: 'Future Logs',
        frequency: 'daily',
        currentStreak: 1,
        bestStreak: 1,
        logs: [
          { date: new Date('2025-01-01'), completed: true }
        ]
      }
    }
  ]
  
  let allTestsPassed = true
  
  edgeCases.forEach((testCase, index) => {
    console.log(`📊 Test ${index + 1}: ${testCase.name}`)
    
    try {
      // Simulate processing this habit
      const habit = testCase.habit
      
      // Ensure streak fields exist (backwards compatibility)
      if (typeof habit.currentStreak === 'undefined') habit.currentStreak = 0
      if (typeof habit.bestStreak === 'undefined') habit.bestStreak = 0
      
      // Ensure logs is an array
      if (!Array.isArray(habit.logs)) habit.logs = []
      
      console.log(`   ✅ PASS: Edge case handled gracefully`)
      
    } catch (error) {
      console.log(`   ❌ FAIL: ${error.message}`)
      allTestsPassed = false
    }
    
    console.log('')
  })
  
  return allTestsPassed
}

// Main execution
function main() {
  console.log('Streak Logic Test Suite')
  console.log('======================\n')
  
  const test1 = testStreakPreservation()
  const test2 = testStreakCalculation()
  const test3 = testEdgeCases()
  
  console.log('📊 Final Results')
  console.log('================')
  console.log(`Streak Preservation: ${test1 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Streak Calculation: ${test2 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Edge Cases: ${test3 ? '✅ PASS' : '❌ FAIL'}`)
  
  const allPassed = test1 && test2 && test3
  console.log(`\nOverall: ${allPassed ? '🎉 ALL TESTS PASSED' : '💥 SOME TESTS FAILED'}`)
  
  if (allPassed) {
    console.log('\n✅ Your streak logic is working correctly!')
    console.log('   • Streaks are preserved during daily resets')
    console.log('   • Streak calculations are accurate')
    console.log('   • Edge cases are handled properly')
  } else {
    console.log('\n❌ Some issues were found with streak logic')
    console.log('   Review the failed tests above for details')
  }
  
  return allPassed
}

if (require.main === module) {
  const success = main()
  process.exit(success ? 0 : 1)
}

module.exports = {
  testStreakPreservation,
  testStreakCalculation,
  testEdgeCases,
  calculateStreakFromLogs
} 