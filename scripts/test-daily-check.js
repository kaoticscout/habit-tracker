#!/usr/bin/env node

/**
 * Test script for the daily habit check endpoint
 * Run with: node scripts/test-daily-check.js
 * Requires Node.js 18+ for built-in fetch
 */

// Use built-in fetch (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('This script requires Node.js 18+ for built-in fetch support');
  process.exit(1);
}

async function testDailyCheck() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is required');
    console.error('Add it to your .env file: CRON_SECRET="your-secret-here"');
    process.exit(1);
  }

  try {
    console.log('Testing daily habit check...');
    console.log(`URL: ${baseUrl}/api/habits/daily-check`);
    
    const response = await fetch(`${baseUrl}/api/habits/daily-check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Daily check completed successfully:');
      console.log(`   Processed habits: ${data.processedHabits}`);
      console.log(`   Created logs: ${data.createdLogs}`);
      console.log(`   Date: ${data.date}`);
      console.log(`   Message: ${data.message}`);
    } else {
      console.error('❌ Daily check failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Failed to run daily check:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure your Next.js server is running (npm run dev)');
    }
  }
}

testDailyCheck(); 