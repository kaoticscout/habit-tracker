#!/usr/bin/env node

/**
 * Production Database Migration Script
 * 
 * This script applies the schema changes to add currentStreak and bestStreak
 * columns to the production database.
 */

const { execSync } = require('child_process')
const fs = require('fs')

async function migrateProduction() {
  console.log('🚀 Starting production database migration...')
  
  try {
    // Read the production environment file
    if (!fs.existsSync('.env.production')) {
      console.error('❌ .env.production file not found')
      console.log('Run: npx vercel env pull .env.production')
      return
    }
    
    // Load environment variables from .env.production
    const envContent = fs.readFileSync('.env.production', 'utf8')
    const envLines = envContent.split('\n')
    
    envLines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^"(.*)"$/, '$1') // Remove quotes
          process.env[key] = value
        }
      }
    })
    
    console.log('✅ Environment variables loaded')
    console.log(`📊 Using database: ${process.env.DATABASE_URL ? 'Found' : 'Missing'}`)
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env.production')
      return
    }
    
    // Run Prisma db push
    console.log('📤 Pushing schema to production database...')
    execSync('npx prisma db push', { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    console.log('✅ Schema migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    
    console.log('\n🔧 Manual SQL Alternative:')
    console.log('Run this SQL in your Supabase dashboard:')
    console.log(`
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS "currentStreak" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "bestStreak" INTEGER DEFAULT 0;

UPDATE habits 
SET "currentStreak" = 0, "bestStreak" = 0 
WHERE "currentStreak" IS NULL OR "bestStreak" IS NULL;
    `)
  }
}

if (require.main === module) {
  migrateProduction()
} 