#!/usr/bin/env node

/**
 * API Daily Reset Test Script
 * 
 * This script tests the /api/habits/daily-reset endpoint directly
 * to ensure it's working correctly for authenticated users.
 */

const fetch = require('node-fetch')

async function testAPIReset() {
  console.log('🌐 Testing Daily Reset API Endpoint')
  console.log('===================================\n')
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const endpoint = `${baseUrl}/api/habits/daily-reset`
  
  try {
    console.log(`📡 Making POST request to: ${endpoint}`)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ API Reset Successful!')
      console.log('\n📋 Reset Summary:')
      console.log(`   • Processed Habits: ${data.summary?.processedHabits || 'N/A'}`)
      console.log(`   • Weekly Habits Skipped: ${data.summary?.weeklyHabitsSkipped || 'N/A'}`)
      console.log(`   • Logs Created: ${data.summary?.logsCreated || 'N/A'}`)
      console.log(`   • Logs Updated: ${data.summary?.logsUpdated || 'N/A'}`)
      
      if (data.summary?.dayOfWeek !== undefined) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        console.log(`   • Day of Week: ${days[data.summary.dayOfWeek]} (${data.summary.dayOfWeek})`)
      }
      
      console.log('\n🔍 Expected Behavior:')
      const today = new Date()
      const isMonday = today.getDay() === 1
      if (isMonday) {
        console.log('   • Today is Monday - Weekly habits should be processed')
        console.log('   • Both daily and weekly habits should be reset')
      } else {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        console.log(`   • Today is ${days[today.getDay()]} - Weekly habits should be skipped`)
        console.log('   • Only daily habits should be reset')
      }
      
    } else {
      console.log('❌ API Reset Failed!')
      console.log(`   Error: ${data.error || 'Unknown error'}`)
      
      if (response.status === 401) {
        console.log('\n💡 Note: This endpoint might require authentication.')
        console.log('   Try testing with a logged-in user session.')
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error!')
    console.log(`   Error: ${error.message}`)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Note: Make sure your Next.js server is running.')
      console.log('   Run: npm run dev')
    }
  }
}

// Performance test - multiple rapid calls
async function testAPIPerformance() {
  console.log('\n⚡ Testing API Performance (5 rapid calls)')
  console.log('==========================================\n')
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const endpoint = `${baseUrl}/api/habits/daily-reset`
  
  const startTime = Date.now()
  const promises = []
  
  for (let i = 0; i < 5; i++) {
    promises.push(
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(res => ({ 
        callNumber: i + 1, 
        status: res.status, 
        time: Date.now() - startTime 
      }))
    )
  }
  
  try {
    const results = await Promise.all(promises)
    const totalTime = Date.now() - startTime
    
    console.log('📊 Performance Results:')
    results.forEach(result => {
      console.log(`   Call ${result.callNumber}: ${result.status} (${result.time}ms)`)
    })
    console.log(`   Total Time: ${totalTime}ms`)
    console.log(`   Average: ${Math.round(totalTime / 5)}ms per call`)
    
    const successCount = results.filter(r => r.status === 200).length
    console.log(`   Success Rate: ${successCount}/5 (${Math.round(successCount/5*100)}%)`)
    
  } catch (error) {
    console.log('❌ Performance test failed:', error.message)
  }
}

// Main execution
async function main() {
  await testAPIReset()
  await testAPIPerformance()
  
  console.log('\n' + '='.repeat(50))
  console.log('🏁 API Testing Complete!')
  console.log('\nNext steps:')
  console.log('1. Check your database to verify habits were reset')
  console.log('2. Test the dashboard UI to see if changes are reflected')
  console.log('3. Try the test button in the dashboard for comparison')
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testAPIReset, testAPIPerformance } 