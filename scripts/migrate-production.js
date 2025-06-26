#!/usr/bin/env node

/**
 * Production Database Migration Script
 * 
 * This script applies the schema changes to add currentStreak and bestStreak
 * columns to the production database.
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateProductionDatabase() {
  console.log('🚀 Starting production database migration...')
  console.log('======================================\n')

  try {
    // Check current database connection
    console.log('📡 Testing database connection...')
    await prisma.$queryRaw`SELECT 1 as connected`
    console.log('✅ Database connection successful')

    // Check if the column already exists
    console.log('\n🔍 Checking if updatedDuringToggle column exists...')
    const columnExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'habit_logs' 
        AND column_name = 'updatedDuringToggle'
        AND table_schema = 'public'
    `

    const exists = columnExists[0].count > 0

    if (exists) {
      console.log('⏭️  Column already exists - no migration needed')
      return
    }

    console.log('➕ Column does not exist - proceeding with migration')

    // Apply the migration
    console.log('\n🔄 Adding updatedDuringToggle column to habit_logs table...')
    await prisma.$executeRaw`
      ALTER TABLE habit_logs 
      ADD COLUMN "updatedDuringToggle" BOOLEAN NOT NULL DEFAULT false
    `

    console.log('✅ Successfully added updatedDuringToggle column')

    // Verify the migration
    console.log('\n🔍 Verifying migration...')
    const verification = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'habit_logs' 
        AND table_schema = 'public'
        AND column_name = 'updatedDuringToggle'
    `

    if (verification.length > 0) {
      console.log('✅ Migration verified successfully')
      console.log('Column details:', verification[0])
    } else {
      throw new Error('Migration verification failed - column not found')
    }

    // Check how many existing habit logs will get the default value
    const logCount = await prisma.habitLog.count()
    console.log(`\n📊 Updated ${logCount} existing habit logs with default value (false)`)

    console.log('\n🎉 Production migration completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Deploy your updated application code')
    console.log('2. Test the immediate streak updates feature')
    console.log('3. Monitor for any issues in production')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    console.error('\n🔧 Troubleshooting steps:')
    console.error('1. Check your DATABASE_URL environment variable')
    console.error('2. Ensure the database is accessible')
    console.error('3. Verify you have ALTER TABLE permissions')
    console.error('4. Check if the habit_logs table exists')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateProductionDatabase() 