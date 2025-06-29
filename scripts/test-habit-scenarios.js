#!/usr/bin/env node

/**
 * Quick command-line habit testing script
 * 
 * Usage:
 *   node scripts/test-habit-scenarios.js daily-streak
 *   node scripts/test-habit-scenarios.js weekly-sunday
 *   node scripts/test-habit-scenarios.js production-bug
 *   node scripts/test-habit-scenarios.js timezone-mix
 */

const https = require('https')

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

const scenarios = {
  'daily-streak': {
    name: 'Daily Streak Test',
    description: 'Tests consecutive daily habits with gaps',
    testDays: [-1, 0, 1] // Yesterday, today, tomorrow
  },
  'weekly-sunday': {
    name: 'Weekly Sunday Edge Case',
    description: 'Tests the critical Sunday calculation bug',
    testDays: [0] // Today (if Sunday)
  },
  'production-bug': {
    name: 'Production Bug Scenario',
    description: 'Recreates the exact production issue',
    testDays: [0]
  },
  'timezone-mix': {
    name: 'Mixed Timezone Logs',
    description: 'Tests habits with logs in different timezones',
    testDays: [0, 1]
  }
}

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`
    const protocol = url.startsWith('https') ? https : require('http')
    
    protocol.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          resolve({ error: 'Invalid JSON response', raw: data })
        }
      })
    }).on('error', reject)
  })
}

async function testScenario(scenarioKey) {
  const scenario = scenarios[scenarioKey]
  if (!scenario) {
    console.error(`❌ Unknown scenario: ${scenarioKey}`)
    console.log('Available scenarios:', Object.keys(scenarios).join(', '))
    return
  }

  console.log(`\n🧪 Testing: ${scenario.name}`)
  console.log(`📝 ${scenario.description}`)
  console.log('=' .repeat(50))

  try {
    // Setup scenario
    console.log('⚙️  Setting up scenario...')
    const setupResult = await makeRequest(`/api/debug/test-habits?action=setup&scenario=${scenarioKey}`)
    
    if (setupResult.error) {
      console.error('❌ Setup failed:', setupResult.error)
      return
    }
    
    console.log('✅ Setup complete:', setupResult.message)
    
    // Get the created habit
    const habitsResult = await makeRequest('/api/habits')
    const testHabit = habitsResult.habits?.find(h => h.title.startsWith('Test '))
    
    if (!testHabit) {
      console.error('❌ No test habit found')
      return
    }
    
    console.log(`🎯 Testing habit: ${testHabit.title} (${testHabit.frequency})`)
    console.log(`📊 Initial streak: ${testHabit.currentStreak}`)
    
    // Test different days
    for (const dayOffset of scenario.testDays) {
      const testDate = new Date()
      testDate.setDate(testDate.getDate() + dayOffset)
      const dateStr = testDate.toISOString().split('T')[0]
      const dayName = testDate.toLocaleDateString('en-US', { weekday: 'long' })
      
      console.log(`\n📅 Testing ${dayName} (${dateStr})...`)
      
      // Inspect before toggle
      const beforeResult = await makeRequest(`/api/debug/test-habits?action=inspect&habitId=${testHabit.id}&date=${dateStr}`)
      const beforeStreak = beforeResult.streakCalculations?.find(calc => calc.date === dateStr)?.calculatedStreak || 0
      
      console.log(`   Before: Calculated streak = ${beforeStreak}`)
      
      // Toggle habit
      const toggleResult = await makeRequest(`/api/debug/test-habits?action=simulate-toggle&habitId=${testHabit.id}&date=${dateStr}`)
      
      if (toggleResult.details) {
        console.log(`   Action: ${toggleResult.details.logAction}`)
        console.log(`   Result: Streak ${toggleResult.details.oldStreak} → ${toggleResult.details.newStreak}`)
        
        if (toggleResult.details.newBestStreak > toggleResult.details.oldBestStreak) {
          console.log(`   🏆 New best streak: ${toggleResult.details.newBestStreak}`)
        }
      } else {
        console.log(`   ❌ Toggle failed:`, toggleResult.error)
      }
    }
    
    // Final inspection
    console.log('\n📋 Final state:')
    const finalResult = await makeRequest(`/api/debug/test-habits?action=inspect&habitId=${testHabit.id}`)
    
    if (finalResult.logs) {
      console.log('   Logs:')
      finalResult.logs
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(log => {
          const status = log.completed ? '✅' : '❌'
          const toggled = log.updatedDuringToggle ? ' (TOGGLED)' : ''
          console.log(`     ${log.dateStr}: ${status}${toggled}`)
        })
    }
    
    console.log(`   Current streak: ${finalResult.habit?.currentStreak}`)
    console.log(`   Best streak: ${finalResult.habit?.bestStreak}`)
    
    console.log('\n✅ Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Main execution
const scenarioKey = process.argv[2]

if (!scenarioKey) {
  console.log('🧪 Habit Testing Script')
  console.log('\nUsage: node scripts/test-habit-scenarios.js <scenario>')
  console.log('\nAvailable scenarios:')
  Object.entries(scenarios).forEach(([key, scenario]) => {
    console.log(`  ${key.padEnd(15)} - ${scenario.description}`)
  })
  console.log('\nExample: node scripts/test-habit-scenarios.js daily-streak')
  process.exit(1)
}

testScenario(scenarioKey)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Script error:', error)
    process.exit(1)
  }) 