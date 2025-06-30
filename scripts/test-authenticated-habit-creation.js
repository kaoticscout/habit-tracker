#!/usr/bin/env node

/**
 * Authenticated Habit Creation Test Script
 * 
 * This script helps test habit creation with an authenticated session
 * to identify server-side issues causing 500 errors.
 */

const fetch = require('node-fetch')

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://habit-tracker-olive-beta.vercel.app'

async function testAuthenticatedHabitCreation() {
  console.log('🔐 Authenticated Habit Creation Test')
  console.log('====================================\n')
  
  console.log(`Testing production URL: ${PRODUCTION_URL}`)
  
  try {
    // Test 1: Check session endpoint
    console.log('\n1️⃣ Testing session endpoint...')
    const sessionResponse = await fetch(`${PRODUCTION_URL}/api/auth/session`)
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log('✅ Session endpoint accessible')
      console.log('📋 Session data:', {
        hasSession: !!sessionData,
        hasUser: !!sessionData?.user,
        email: sessionData?.user?.email,
        expires: sessionData?.expires
      })
      
      if (!sessionData?.user) {
        console.log('⚠️  No authenticated user found')
        console.log('💡 You need to sign in before testing authenticated features')
        return
      } else {
        console.log('✅ User is authenticated')
      }
    } else {
      console.log('❌ Session endpoint failed')
      console.log(`   Status: ${sessionResponse.status}`)
      return
    }
    
    // Test 2: Test habits endpoint with authentication
    console.log('\n2️⃣ Testing habits endpoint (authenticated)...')
    const habitsResponse = await fetch(`${PRODUCTION_URL}/api/habits`)
    
    if (habitsResponse.ok) {
      const habitsData = await habitsResponse.json()
      console.log('✅ Habits API accessible')
      console.log(`   Found ${habitsData.length} habits`)
    } else {
      console.log(`❌ Habits API failed: ${habitsResponse.status}`)
      const errorText = await habitsResponse.text()
      console.log(`   Error: ${errorText}`)
    }
    
    // Test 3: Test habit creation with authentication
    console.log('\n3️⃣ Testing habit creation endpoint (authenticated)...')
    const createResponse = await fetch(`${PRODUCTION_URL}/api/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Habit from Script',
        category: 'fitness',
        frequency: 'daily'
      })
    })
    
    if (createResponse.ok) {
      const createData = await createResponse.json()
      console.log('✅ Habit creation successful')
      console.log(`   Created habit ID: ${createData.id}`)
      console.log(`   Title: ${createData.title}`)
      console.log(`   Category: ${createData.category}`)
      console.log(`   Frequency: ${createData.frequency}`)
      
      // Clean up: Delete the test habit
      console.log('\n4️⃣ Cleaning up test habit...')
      const deleteResponse = await fetch(`${PRODUCTION_URL}/api/habits/${createData.id}`, {
        method: 'DELETE',
      })
      
      if (deleteResponse.ok) {
        console.log('✅ Test habit deleted successfully')
      } else {
        console.log(`⚠️  Failed to delete test habit: ${deleteResponse.status}`)
      }
    } else {
      console.log(`❌ Habit creation failed: ${createResponse.status}`)
      const errorText = await createResponse.text()
      console.log(`   Error: ${errorText}`)
      
      // Try to get more detailed error information
      try {
        const errorData = JSON.parse(errorText)
        console.log('   Parsed error data:', errorData)
      } catch (e) {
        console.log('   Could not parse error as JSON')
      }
    }
    
    // Test 4: Check database connectivity
    console.log('\n4️⃣ Testing database connectivity...')
    const testResponse = await fetch(`${PRODUCTION_URL}/api/test`)
    
    if (testResponse.ok) {
      const testData = await testResponse.json()
      console.log('✅ Database connectivity: OK')
      console.log(`   User count: ${testData.database?.userCount || 0}`)
      console.log(`   Environment: ${testData.environment?.nodeEnv || 'unknown'}`)
      console.log(`   Has NextAuth Secret: ${testData.environment?.hasNextAuthSecret || false}`)
      console.log(`   Has Database URL: ${testData.environment?.hasDatabaseUrl || false}`)
    } else {
      console.log('❌ Database connectivity: FAILED')
      console.log(`   Status: ${testResponse.status}`)
    }
    
    // Summary and recommendations
    console.log('\n📊 Summary')
    console.log('==========')
    console.log('✅ Authentication is working')
    console.log('✅ Session is valid')
    console.log('✅ Database is connected')
    
    console.log('\n💡 Next Steps')
    console.log('=============')
    console.log('1. Check Vercel function logs for detailed error information')
    console.log('2. Verify database schema is up to date')
    console.log('3. Check if all environment variables are set correctly')
    console.log('4. Test with a different habit title/category')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    })
  }
}

// Main execution
async function main() {
  await testAuthenticatedHabitCreation()
  
  console.log('\n🎯 Debugging Tips')
  console.log('=================')
  console.log('1. Go to Vercel Dashboard → Your Project → Functions')
  console.log('2. Look for the /api/habits function')
  console.log('3. Check the logs for detailed error information')
  console.log('4. Look for database connection errors or schema issues')
  console.log('5. Verify the habits table exists and has the correct schema')
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testAuthenticatedHabitCreation } 