#!/usr/bin/env node

/**
 * Master Test Runner
 * 
 * This script runs all test suites for the daily reset functionality:
 * 1. Comprehensive Reset Tests (localStorage logic)
 * 2. Streak Logic Tests
 * 3. API Endpoint Tests
 * 4. Performance Tests
 */

const { execSync } = require('child_process')
const path = require('path')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

function runTest(testName, scriptPath, description) {
  console.log(colorize(`\n${'='.repeat(60)}`, 'cyan'))
  console.log(colorize(`🧪 ${testName}`, 'bold'))
  console.log(colorize(description, 'blue'))
  console.log(colorize(`${'='.repeat(60)}`, 'cyan'))
  
  try {
    const result = execSync(`node ${scriptPath}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    })
    
    console.log(result)
    
    // Check if the test passed based on exit code
    console.log(colorize(`✅ ${testName} PASSED`, 'green'))
    return true
    
  } catch (error) {
    console.log(error.stdout || '')
    console.log(colorize(`❌ ${testName} FAILED`, 'red'))
    if (error.stderr) {
      console.log(colorize(`Error: ${error.stderr}`, 'red'))
    }
    return false
  }
}

async function runAPITest() {
  console.log(colorize(`\n${'='.repeat(60)}`, 'cyan'))
  console.log(colorize(`🌐 API Endpoint Tests`, 'bold'))
  console.log(colorize('Testing /api/habits/daily-reset endpoint', 'blue'))
  console.log(colorize(`${'='.repeat(60)}`, 'cyan'))
  
  try {
    // Check if server is running first
    const fetch = require('node-fetch')
    const response = await fetch('http://localhost:3000/api/test', { 
      method: 'GET',
      timeout: 3000 
    })
    
    if (response.ok) {
      // Server is running, run API tests
      const result = execSync('node scripts/test-api-reset.js', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      console.log(result)
      console.log(colorize(`✅ API Endpoint Tests PASSED`, 'green'))
      return true
    } else {
      throw new Error('Server not responding')
    }
    
  } catch (error) {
    console.log(colorize(`⚠️  Server not running - Skipping API tests`, 'yellow'))
    console.log(colorize(`   To run API tests: npm run dev (in another terminal)`, 'yellow'))
    return null // null means skipped, not failed
  }
}

function generateTestReport(results) {
  console.log(colorize(`\n${'='.repeat(60)}`, 'magenta'))
  console.log(colorize(`📊 TEST REPORT`, 'bold'))
  console.log(colorize(`${'='.repeat(60)}`, 'magenta'))
  
  let totalTests = 0
  let passedTests = 0
  let skippedTests = 0
  
  results.forEach(result => {
    totalTests++
    if (result.passed === true) {
      passedTests++
      console.log(colorize(`✅ ${result.name}`, 'green'))
    } else if (result.passed === false) {
      console.log(colorize(`❌ ${result.name}`, 'red'))
    } else {
      skippedTests++
      console.log(colorize(`⏭️  ${result.name} (skipped)`, 'yellow'))
    }
  })
  
  console.log(colorize(`\nResults:`, 'bold'))
  console.log(`   Passed: ${colorize(passedTests.toString(), 'green')}`)
  console.log(`   Failed: ${colorize((totalTests - passedTests - skippedTests).toString(), 'red')}`)
  console.log(`   Skipped: ${colorize(skippedTests.toString(), 'yellow')}`)
  console.log(`   Total: ${totalTests}`)
  
  const successRate = Math.round((passedTests / (totalTests - skippedTests)) * 100)
  console.log(`   Success Rate: ${colorize(`${successRate}%`, successRate >= 80 ? 'green' : 'red')}`)
  
  if (passedTests === totalTests - skippedTests) {
    console.log(colorize(`\n🎉 ALL TESTS PASSED!`, 'green'))
    console.log(colorize(`Your daily reset functionality is working perfectly!`, 'green'))
  } else {
    console.log(colorize(`\n💥 SOME TESTS FAILED!`, 'red'))
    console.log(colorize(`Review the failed tests above and fix the issues.`, 'red'))
  }
  
  return passedTests === totalTests - skippedTests
}

function printRecommendations() {
  console.log(colorize(`\n📋 RECOMMENDATIONS`, 'cyan'))
  console.log(colorize(`${'='.repeat(30)}`, 'cyan'))
  
  console.log(`
${colorize('🔄 Daily Testing:', 'bold')}
   • Run these tests regularly during development
   • Test on different days of the week to verify weekly habit logic
   • Check both localStorage and database functionality

${colorize('🚀 Deployment Testing:', 'bold')}
   • Verify Vercel Cron Jobs are configured correctly
   • Test the production API endpoint manually
   • Monitor logs after midnight PST to ensure automatic resets work

${colorize('🐛 Debugging Tips:', 'bold')}
   • Use the dashboard test button for manual testing
   • Check browser console for detailed logging
   • Verify database state after running resets

${colorize('📊 Performance Monitoring:', 'bold')}
   • Monitor API response times in production
   • Check for database connection issues
   • Ensure Prisma queries are optimized
  `)
}

async function main() {
  console.log(colorize(`Daily Reset Test Suite Runner`, 'bold'))
  console.log(colorize(`================================`, 'cyan'))
  console.log(`
This test suite will verify that your daily reset functionality is working correctly.
It tests both localStorage (for non-authenticated users) and database (for authenticated users).
  `)
  
  const results = []
  
  // Test 1: Comprehensive Reset Logic
  const test1 = runTest(
    'Comprehensive Reset Tests',
    'scripts/comprehensive-reset-tests.js',
    'Tests daily vs weekly habit reset logic for all days of the week'
  )
  results.push({ name: 'Comprehensive Reset Tests', passed: test1 })
  
  // Test 2: Streak Logic
  const test2 = runTest(
    'Streak Logic Tests',
    'scripts/test-streak-logic.js',
    'Verifies that streaks are preserved correctly during resets'
  )
  results.push({ name: 'Streak Logic Tests', passed: test2 })
  
  // Test 3: API Endpoint (conditional)
  const test3 = await runAPITest()
  results.push({ name: 'API Endpoint Tests', passed: test3 })
  
  // Generate final report
  const allPassed = generateTestReport(results)
  
  // Print recommendations
  printRecommendations()
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1)
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.log(colorize(`\n💥 Uncaught Exception: ${error.message}`, 'red'))
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log(colorize(`\n💥 Unhandled Rejection: ${reason}`, 'red'))
  process.exit(1)
})

if (require.main === module) {
  main().catch(console.error)
} 