#!/usr/bin/env node

/**
 * Production Database Schema Check Script
 * 
 * This script checks the production database schema to identify
 * any missing tables or columns that might be causing 500 errors.
 */

const { PrismaClient } = require('@prisma/client')

// Create database URL with connection parameters to avoid prepared statement conflicts
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }
  
  // Add parameters to disable prepared statements in production
  const url = new URL(baseUrl)
  url.searchParams.set('prepared_statements', 'false')
  url.searchParams.set('pgbouncer', 'true')
  return url.toString()
}

async function checkProductionSchema() {
  console.log('🔍 Production Database Schema Check')
  console.log('===================================\n')
  
  const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl()
      }
    }
  })
  
  try {
    console.log('📡 Connecting to production database...')
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as connected`
    console.log('✅ Database connection successful')
    
    // Check if required tables exist
    console.log('\n📋 Checking required tables...')
    
    const tables = [
      'users',
      'habits', 
      'habit_logs',
      'accounts',
      'sessions',
      'verification_tokens'
    ]
    
    for (const table of tables) {
      try {
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          ) as exists
        `
        const exists = result[0].exists
        console.log(`   ${table}: ${exists ? '✅' : '❌'}`)
        
        if (!exists) {
          console.log(`      ❌ Missing table: ${table}`)
        }
      } catch (error) {
        console.log(`   ${table}: ❌ Error checking table`)
        console.log(`      Error: ${error.message}`)
      }
    }
    
    // Check habits table columns
    console.log('\n📊 Checking habits table columns...')
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'habits' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
      
      const expectedColumns = [
        'id', 'title', 'category', 'frequency', 'isActive', 
        'order', 'currentStreak', 'bestStreak', 'createdAt', 
        'updatedAt', 'userId'
      ]
      
      const foundColumns = columns.map(col => col.column_name)
      
      for (const expectedCol of expectedColumns) {
        const found = foundColumns.includes(expectedCol)
        console.log(`   ${expectedCol}: ${found ? '✅' : '❌'}`)
        
        if (!found) {
          console.log(`      ❌ Missing column: ${expectedCol}`)
        }
      }
      
      // Show any extra columns
      const extraColumns = foundColumns.filter(col => !expectedColumns.includes(col))
      if (extraColumns.length > 0) {
        console.log(`   Extra columns: ${extraColumns.join(', ')}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Error checking habits table: ${error.message}`)
    }
    
    // Check habit_logs table columns
    console.log('\n📊 Checking habit_logs table columns...')
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'habit_logs' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
      
      const expectedColumns = [
        'id', 'date', 'completed', 'updatedDuringToggle', 
        'createdAt', 'updatedAt', 'habitId', 'userId', 'notes'
      ]
      
      const foundColumns = columns.map(col => col.column_name)
      
      for (const expectedCol of expectedColumns) {
        const found = foundColumns.includes(expectedCol)
        console.log(`   ${expectedCol}: ${found ? '✅' : '❌'}`)
        
        if (!found) {
          console.log(`      ❌ Missing column: ${expectedCol}`)
        }
      }
      
      // Show any extra columns
      const extraColumns = foundColumns.filter(col => !expectedColumns.includes(col))
      if (extraColumns.length > 0) {
        console.log(`   Extra columns: ${extraColumns.join(', ')}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Error checking habit_logs table: ${error.message}`)
    }
    
    // Check for foreign key constraints
    console.log('\n🔗 Checking foreign key constraints...')
    try {
      const constraints = await prisma.$queryRaw`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
      `
      
      if (constraints.length > 0) {
        console.log('   Foreign key constraints found:')
        constraints.forEach(constraint => {
          console.log(`   ✅ ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`)
        })
      } else {
        console.log('   ⚠️  No foreign key constraints found')
      }
      
    } catch (error) {
      console.log(`   ❌ Error checking foreign keys: ${error.message}`)
    }
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...')
    
    try {
      // Test user count
      const userCount = await prisma.user.count()
      console.log(`   ✅ User count: ${userCount}`)
      
      // Test habit count
      const habitCount = await prisma.habit.count()
      console.log(`   ✅ Habit count: ${habitCount}`)
      
      // Test habit log count
      const logCount = await prisma.habitLog.count()
      console.log(`   ✅ Habit log count: ${logCount}`)
      
    } catch (error) {
      console.log(`   ❌ Error testing operations: ${error.message}`)
    }
    
    // Summary
    console.log('\n📊 Summary')
    console.log('==========')
    console.log('✅ Database connection: Working')
    console.log('✅ Schema check: Completed')
    
    console.log('\n💡 Next Steps')
    console.log('=============')
    console.log('1. If any tables or columns are missing, run database migrations')
    console.log('2. Check Vercel function logs for specific error messages')
    console.log('3. Verify all environment variables are set correctly')
    console.log('4. Test with a fresh database if needed')
    
  } catch (error) {
    console.error('\n❌ Schema check failed:', error.message)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    })
  } finally {
    await prisma.$disconnect()
  }
}

// Main execution
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required')
    console.log('💡 Set it with: $env:DATABASE_URL="your-database-url"')
    process.exit(1)
  }
  
  await checkProductionSchema()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { checkProductionSchema } 