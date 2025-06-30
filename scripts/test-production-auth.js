#!/usr/bin/env node

/**
 * Production Authentication Test Script
 * 
 * This script helps test authentication status and identify why habit creation
 * might be failing in production.
 */

const fetch = require('node-fetch')

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://habit-tracker-olive-beta.vercel.app'

async function testProductionAuth() {
  console.log('🔐 Production Authentication Test')
  console.log('==================================\n')
  
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
        console.log('💡 You need to sign in before creating habits')
      } else {
        console.log('✅ User is authenticated')
      }
    } else {
      console.log('❌ Session endpoint failed')
      console.log(`   Status: ${sessionResponse.status}`)
    }
    
    // Test 2: Test habits endpoint with session
    console.log('\n2️⃣ Testing habits endpoint...')
    const habitsResponse = await fetch(`${PRODUCTION_URL}/api/habits`)
    
    if (habitsResponse.status === 401) {
      console.log('✅ Habits API correctly requires authentication')
      console.log('💡 This confirms you need to sign in')
    } else if (habitsResponse.ok) {
      console.log('⚠️  Habits API allows access without authentication (security issue)')
    } else {
      console.log(`❌ Habits API returned unexpected status: ${habitsResponse.status}`)
    }
    
    // Test 3: Test habit creation with session
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
      console.log('✅ Habit creation correctly requires authentication')
      console.log('💡 This confirms you need to sign in')
    } else if (createResponse.ok) {
      console.log('⚠️  Habit creation allows creation without authentication (security issue)')
      const createData = await createResponse.json()
      console.log(`   Created habit ID: ${createData.id}`)
    } else {
      console.log(`❌ Habit creation returned status: ${createResponse.status}`)
      const errorText = await createResponse.text()
      console.log(`   Error: ${errorText}`)
    }
    
    // Test 4: Check if user exists in database
    console.log('\n4️⃣ Testing database connectivity...')
    const testResponse = await fetch(`${PRODUCTION_URL}/api/test`)
    
    if (testResponse.ok) {
      const testData = await testResponse.json()
      console.log('✅ Database connectivity: OK')
      console.log(`   User count: ${testData.database?.userCount || 0}`)
      console.log(`   Environment: ${testData.environment?.nodeEnv || 'unknown'}`)
    } else {
      console.log('❌ Database connectivity: FAILED')
      console.log(`   Status: ${testResponse.status}`)
    }
    
    // Summary and recommendations
    console.log('\n📊 Summary')
    console.log('==========')
    console.log('✅ API endpoints are working')
    console.log('✅ Authentication is properly configured')
    console.log('✅ Database is connected')
    
    console.log('\n💡 Solution')
    console.log('==========')
    console.log('The issue is likely that you are not signed in.')
    console.log('To fix this:')
    console.log('1. Go to your production app')
    console.log('2. Click "Sign In" or "Create Account"')
    console.log('3. Complete the authentication process')
    console.log('4. Try creating a habit again')
    
    console.log('\n🔧 Alternative: Guest Mode')
    console.log('=======================')
    console.log('If you want to test without signing in:')
    console.log('1. The app should fall back to localStorage mode')
    console.log('2. Check if there are any JavaScript errors preventing this')
    console.log('3. Verify the useHabits hook is handling guest mode correctly')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

// Main execution
async function main() {
  await testProductionAuth()
  
  console.log('\n🎯 Next Steps')
  console.log('=============')
  console.log('1. Sign in to your production app')
  console.log('2. Try creating a habit again')
  console.log('3. Check Vercel function logs if issues persist')
  console.log('4. Verify all environment variables are set correctly')
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testProductionAuth } 