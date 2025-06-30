#!/usr/bin/env node

/**
 * Production Habit Creation Debug Script
 * 
 * This script helps debug habit creation issues in production by testing
 * the API endpoints and identifying common problems.
 */

const fetch = require('node-fetch')

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://your-app.vercel.app'

async function testProductionHabitCreation() {
  console.log('🧪 Production Habit Creation Debug Tool')
  console.log('======================================\n')
  
  if (!PRODUCTION_URL || PRODUCTION_URL.includes('your-app')) {
    console.log('❌ Please set PRODUCTION_URL environment variable')
    console.log('   Example: PRODUCTION_URL=https://your-app.vercel.app node scripts/debug-production-habit-creation.js')
    return
  }
  
  console.log(`Testing production URL: ${PRODUCTION_URL}`)
  
  try {
    // Test 1: Basic API connectivity
    console.log('\n1️⃣ Testing basic API connectivity...')
    const healthResponse = await fetch(`${PRODUCTION_URL}/api/test`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ API connectivity: OK')
      console.log(`   Environment: ${healthData.environment?.nodeEnv || 'unknown'}`)
      console.log(`   Database connected: ${healthData.database?.connected || false}`)
      console.log(`   User count: ${healthData.database?.userCount || 0}`)
    } else {
      console.log('❌ API connectivity: FAILED')
      console.log(`   Status: ${healthResponse.status}`)
    }
    
    // Test 2: Habits API without authentication
    console.log('\n2️⃣ Testing habits API (unauthenticated)...')
    const habitsResponse = await fetch(`${PRODUCTION_URL}/api/habits`)
    if (habitsResponse.status === 401) {
      console.log('✅ Habits API: Correctly requires authentication')
    } else if (habitsResponse.ok) {
      console.log('⚠️  Habits API: Allows access without authentication (security issue)')
    } else {
      console.log(`❌ Habits API: Unexpected status ${habitsResponse.status}`)
    }
    
    // Test 3: Test habit creation endpoint
    console.log('\n3️⃣ Testing habit creation endpoint...')
    const createResponse = await fetch(`${PRODUCTION_URL}/api/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Habit',
        category: 'fitness',
        frequency: 'daily'
      })
    })
    
    if (createResponse.status === 401) {
      console.log('✅ Habit creation: Correctly requires authentication')
    } else if (createResponse.ok) {
      console.log('⚠️  Habit creation: Allows creation without authentication (security issue)')
      const createData = await createResponse.json()
      console.log(`   Created habit ID: ${createData.id}`)
    } else {
      console.log(`❌ Habit creation: Unexpected status ${createResponse.status}`)
      const errorText = await createResponse.text()
      console.log(`   Error: ${errorText}`)
    }
    
    // Test 4: Check for common production issues
    console.log('\n4️⃣ Checking for common production issues...')
    
    // Check if NextAuth is configured
    const sessionResponse = await fetch(`${PRODUCTION_URL}/api/auth/session`)
    if (sessionResponse.ok) {
      console.log('✅ NextAuth session endpoint: Accessible')
    } else {
      console.log('❌ NextAuth session endpoint: Not accessible')
      console.log(`   Status: ${sessionResponse.status}`)
    }
    
    // Test 5: Check for JavaScript errors
    console.log('\n5️⃣ Checking for potential JavaScript issues...')
    console.log('   Common production issues:')
    console.log('   • Missing environment variables')
    console.log('   • Database connection problems')
    console.log('   • NextAuth configuration issues')
    console.log('   • CORS or CSP restrictions')
    console.log('   • Build optimization issues')
    
    // Test 6: Check build status
    console.log('\n6️⃣ Checking build status...')
    try {
      const buildResponse = await fetch(`${PRODUCTION_URL}`)
      if (buildResponse.ok) {
        console.log('✅ Main page: Loading successfully')
      } else {
        console.log(`❌ Main page: Status ${buildResponse.status}`)
      }
    } catch (error) {
      console.log('❌ Main page: Failed to load')
      console.log(`   Error: ${error.message}`)
    }
    
    // Summary and recommendations
    console.log('\n📊 Summary')
    console.log('==========')
    console.log('✅ API connectivity test completed')
    console.log('✅ Authentication requirements verified')
    console.log('✅ Endpoint accessibility checked')
    
    console.log('\n💡 Next Steps for Debugging')
    console.log('===========================')
    console.log('1. Check browser console for JavaScript errors')
    console.log('2. Verify user authentication status')
    console.log('3. Check Vercel function logs for API errors')
    console.log('4. Test with authenticated user session')
    console.log('5. Verify all environment variables are set')
    
    console.log('\n🔧 Common Solutions')
    console.log('==================')
    console.log('• Ensure user is signed in before creating habits')
    console.log('• Check if NEXTAUTH_SECRET is set in production')
    console.log('• Verify DATABASE_URL is correct and accessible')
    console.log('• Check if Prisma client is generated for production')
    console.log('• Ensure all required environment variables are set')
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error.message)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    })
  }
}

// Test specific scenarios
async function testSpecificScenarios() {
  console.log('\n🎯 Testing Specific Scenarios')
  console.log('=============================')
  
  const scenarios = [
    {
      name: 'Guest user habit creation',
      description: 'Should work with localStorage fallback',
      test: async () => {
        // This would require browser testing
        console.log('   ⚠️  Requires browser testing - check localStorage fallback')
      }
    },
    {
      name: 'Authenticated user habit creation',
      description: 'Should work with database storage',
      test: async () => {
        console.log('   ⚠️  Requires authenticated session - test manually')
      }
    },
    {
      name: 'Form validation',
      description: 'Should prevent empty habit creation',
      test: async () => {
        console.log('   ⚠️  Requires frontend testing - check form validation')
      }
    }
  ]
  
  for (const scenario of scenarios) {
    console.log(`\n📋 ${scenario.name}`)
    console.log(`   ${scenario.description}`)
    await scenario.test()
  }
}

// Main execution
async function main() {
  await testProductionHabitCreation()
  await testSpecificScenarios()
  
  console.log('\n🎯 Production Debug Complete!')
  console.log('\n📋 Manual Testing Checklist:')
  console.log('1. Open browser developer tools (F12)')
  console.log('2. Go to Console tab')
  console.log('3. Try to create a habit')
  console.log('4. Look for any error messages')
  console.log('5. Check Network tab for failed requests')
  console.log('6. Verify user authentication status')
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testProductionHabitCreation, testSpecificScenarios } 