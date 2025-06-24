#!/usr/bin/env node

/**
 * Test script for daily reset functionality
 * This script can be used to test the daily reset endpoint locally or in production
 */

const https = require('https')
const http = require('http')

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || ''

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https')
    const client = isHttps ? https : http
    
    const req = client.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CRON_SECRET ? `Bearer ${CRON_SECRET}` : '',
        ...options.headers
      }
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve({ status: res.statusCode, data: json })
        } catch (error) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

async function testDailyReset() {
  console.log('🧪 Testing Daily Reset Functionality')
  console.log('=====================================')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Using CRON_SECRET: ${CRON_SECRET ? 'Yes' : 'No'}`)
  console.log('')

  try {
    // Test the daily reset endpoint
    console.log('📅 Triggering daily reset...')
    const resetUrl = `${BASE_URL}/api/habits/daily-reset`
    const resetResult = await makeRequest(resetUrl)
    
    console.log(`Status: ${resetResult.status}`)
    console.log('Response:', JSON.stringify(resetResult.data, null, 2))
    
    if (resetResult.status === 200 && resetResult.data.success) {
      console.log('')
      console.log('✅ Daily reset completed successfully!')
      console.log(`📊 Summary:`)
      console.log(`   - Total habits: ${resetResult.data.summary.totalHabits}`)
      console.log(`   - Processed: ${resetResult.data.summary.processedHabits}`)
      console.log(`   - Streaks updated: ${resetResult.data.summary.streaksUpdated}`)
      console.log(`   - New logs created: ${resetResult.data.summary.logsCreated}`)
      console.log(`   - Errors: ${resetResult.data.summary.errorCount}`)
      console.log(`   - Execution time: ${resetResult.data.executionTimeMs}ms`)
      
      if (resetResult.data.errors && resetResult.data.errors.length > 0) {
        console.log('')
        console.log('⚠️  Errors encountered:')
        resetResult.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`)
        })
      }
      
      if (resetResult.data.details && resetResult.data.details.length > 0) {
        console.log('')
        console.log('📝 Details:')
        resetResult.data.details.forEach((detail, index) => {
          console.log(`   ${index + 1}. ${detail.habitName} (${detail.userEmail}):`)
          console.log(`      - Action: ${detail.action}`)
          console.log(`      - Frequency: ${detail.frequency}`)
          if (detail.action === 'reset') {
            console.log(`      - Completed yesterday: ${detail.wasCompletedYesterday}`)
            console.log(`      - New streak: ${detail.newStreak}`)
          }
        })
      }
    } else {
      console.log('')
      console.log('❌ Daily reset failed!')
      if (resetResult.data.error) {
        console.log(`Error: ${resetResult.data.error}`)
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testDailyReset().catch(console.error)
}

module.exports = { testDailyReset } 