#!/usr/bin/env node

/**
 * Production Debug Script
 * 
 * This script helps debug production API issues by testing various endpoints
 * and providing detailed error information.
 */

const fetch = require('node-fetch')

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://your-app.vercel.app'
const LOCAL_URL = 'http://localhost:3000'

async function testEndpoint(url, description, options = {}) {
  console.log(`\n🔍 Testing: ${description}`)
  console.log(`   URL: ${url}`)
  
  try {
    const response = await fetch(url, {
      timeout: 10000,
      ...options
    })
    
    console.log(`   Status: ${response.status} ${response.statusText}`)
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`)
    
    const contentType = response.headers.get('content-type')
    let body
    
    if (contentType && contentType.includes('application/json')) {
      body = await response.json()
    } else {
      body = await response.text()
    }
    
    console.log(`   Body: ${JSON.stringify(body, null, 2)}`)
    
    return { success: response.ok, status: response.status, body }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    console.log(`   Stack: ${error.stack}`)
    return { success: false, error: error.message }
  }
}

async function debugProductionAPI() {
  console.log('🚀 Production API Debug Tool')
  console.log('============================\n')
  
  const baseUrl = PRODUCTION_URL
  console.log(`Testing production URL: ${baseUrl}`)
  
  // Test 1: Basic connectivity
  const healthTest = await testEndpoint(
    `${baseUrl}/api/test`,
    'Basic API connectivity'
  )
  
  // Test 2: Auth endpoint
  const authTest = await testEndpoint(
    `${baseUrl}/api/auth/session`,
    'NextAuth session endpoint'
  )
  
  // Test 3: Habits endpoint (will likely fail without auth)
  const habitsTest = await testEndpoint(
    `${baseUrl}/api/habits`,
    'Habits endpoint (unauthenticated)'
  )
  
  // Test 4: Daily reset endpoint
  const resetTest = await testEndpoint(
    `${baseUrl}/api/habits/daily-reset`,
    'Daily reset endpoint',
    { method: 'POST' }
  )
  
  // Summary
  console.log('\n📊 Summary')
  console.log('===========')
  console.log(`Health Check: ${healthTest.success ? '✅' : '❌'}`)
  console.log(`Auth Session: ${authTest.success ? '✅' : '❌'}`)
  console.log(`Habits API: ${habitsTest.success ? '✅' : '❌'}`)
  console.log(`Reset API: ${resetTest.success ? '✅' : '❌'}`)
  
  // Recommendations
  console.log('\n💡 Recommendations')
  console.log('==================')
  
  if (!healthTest.success) {
    console.log('❌ Basic connectivity failed:')
    console.log('   • Check if your Vercel deployment is working')
    console.log('   • Verify the production URL is correct')
    console.log('   • Check Vercel function logs for errors')
  }
  
  if (!authTest.success) {
    console.log('❌ Auth session failed:')
    console.log('   • Check NextAuth configuration')
    console.log('   • Verify environment variables are set correctly')
    console.log('   • Check if NEXTAUTH_SECRET is configured')
  }
  
  if (!habitsTest.success && habitsTest.status !== 401) {
    console.log('❌ Habits API failed (not auth issue):')
    console.log('   • Check database connection')
    console.log('   • Verify Prisma configuration')
    console.log('   • Check environment variables')
    if (habitsTest.body && habitsTest.body.error) {
      console.log(`   • API Error: ${habitsTest.body.error}`)
    }
  }
  
  console.log('\n🛠️  Next Steps')
  console.log('===============')
  console.log('1. Check Vercel function logs in the dashboard')
  console.log('2. Verify all environment variables are set')
  console.log('3. Test database connectivity separately')
  console.log('4. Check if the issue is auth-related vs database-related')
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Database Connection Test')
  console.log('=============================')
  
  try {
    // This would require running on the server, but we can test the API
    const response = await fetch(`${PRODUCTION_URL}/api/debug`, {
      method: 'GET'
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Database connection successful')
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`)
    } else {
      console.log('❌ Database connection failed')
      console.log(`   Status: ${response.status}`)
      const text = await response.text()
      console.log(`   Error: ${text}`)
    }
  } catch (error) {
    console.log('❌ Database test failed')
    console.log(`   Error: ${error.message}`)
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔧 Environment Variables Check')
  console.log('===============================')
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]
  
  console.log('Required environment variables:')
  requiredVars.forEach(varName => {
    console.log(`   ${varName}: ${process.env[varName] ? '✅ Set' : '❌ Missing'}`)
  })
  
  console.log('\n💡 If variables are missing:')
  console.log('   • Check your .env file')
  console.log('   • Verify Vercel environment variables')
  console.log('   • Ensure production secrets are configured')
}

function printDebuggingTips() {
  console.log('\n🐛 Advanced Debugging Tips')
  console.log('===========================')
  
  console.log(`
📊 Vercel Dashboard:
   • Go to your Vercel dashboard
   • Check the Functions tab for error logs
   • Look for failed function invocations
   
🔍 Browser DevTools:
   • Open Network tab and check the actual API request
   • Look for detailed error messages in the response
   • Check if the request is reaching the server
   
📝 Add Logging:
   • Add console.log statements to your API routes
   • Deploy and check Vercel function logs
   • Use Vercel's real-time logging feature
   
🔗 Test API Directly:
   • Use curl or Postman to test API endpoints
   • Check authentication headers
   • Verify request/response format
   
Example curl command:
curl -X GET "${PRODUCTION_URL}/api/habits" \\
  -H "Content-Type: application/json" \\
  -H "Cookie: your-session-cookie"
  `)
}

async function main() {
  console.log('Production Debug Tool')
  console.log('=====================\n')
  
  if (!PRODUCTION_URL || PRODUCTION_URL.includes('your-app')) {
    console.log('❌ Please set PRODUCTION_URL environment variable')
    console.log('   Example: PRODUCTION_URL=https://your-app.vercel.app node scripts/debug-production.js')
    console.log('   Or edit the script to hardcode your production URL')
    return
  }
  
  await debugProductionAPI()
  await testDatabaseConnection()
  checkEnvironmentVariables()
  printDebuggingTips()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { 
  testEndpoint, 
  debugProductionAPI, 
  testDatabaseConnection 
} 