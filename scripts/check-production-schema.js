const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProductionSchema() {
  console.log('🔍 Checking Production Database Schema...')
  console.log('=========================================\n')

  try {
    // Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$queryRaw`SELECT 1 as connected`
    console.log('✅ Database connection successful')

    // Get database info
    const dbInfo = await prisma.$queryRaw`SELECT version() as version`
    console.log(`📊 Database: ${dbInfo[0].version.split(' ')[0]} ${dbInfo[0].version.split(' ')[1]}`)

    // Check habit_logs table structure
    console.log('\n🏗️  Checking habit_logs table structure...')
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'habit_logs' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    console.log('\n📋 Current habit_logs columns:')
    columns.forEach((col, index) => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)'
      const defaultVal = col.column_default ? `default: ${col.column_default}` : 'no default'
      console.log(`   ${index + 1}. ${col.column_name} - ${col.data_type} ${nullable} - ${defaultVal}`)
    })

    // Specifically check for updatedDuringToggle field
    console.log('\n🎯 Checking for updatedDuringToggle field...')
    const updatedDuringToggleColumn = columns.find(col => col.column_name === 'updatedDuringToggle')

    if (updatedDuringToggleColumn) {
      console.log('✅ updatedDuringToggle field exists!')
      console.log(`   Type: ${updatedDuringToggleColumn.data_type}`)
      console.log(`   Nullable: ${updatedDuringToggleColumn.is_nullable}`)
      console.log(`   Default: ${updatedDuringToggleColumn.column_default}`)
      
      // Check if any logs have the field set to true
      const logsWithFlag = await prisma.habitLog.count({
        where: { updatedDuringToggle: true }
      })
      
      const totalLogs = await prisma.habitLog.count()
      console.log(`   📊 Logs with flag=true: ${logsWithFlag}/${totalLogs}`)
      
    } else {
      console.log('❌ updatedDuringToggle field NOT found!')
      console.log('   ⚠️  Migration needed!')
    }

    // Check habits table for streak columns
    console.log('\n🏆 Checking habits table for streak columns...')
    const habitColumns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'habits' 
        AND table_schema = 'public'
        AND column_name IN ('currentStreak', 'bestStreak')
      ORDER BY column_name
    `

    if (habitColumns.length === 2) {
      console.log('✅ Streak columns exist in habits table:')
      habitColumns.forEach(col => {
        console.log(`   ${col.column_name} - ${col.data_type} (default: ${col.column_default})`)
      })
    } else {
      console.log('⚠️  Streak columns missing or incomplete in habits table')
    }

    // Check indexes
    console.log('\n🔗 Checking important indexes...')
    const indexes = await prisma.$queryRaw`
      SELECT 
        indexname,
        tablename,
        indexdef
      FROM pg_indexes 
      WHERE tablename IN ('habit_logs', 'habits')
        AND schemaname = 'public'
      ORDER BY tablename, indexname
    `

    console.log(`   Found ${indexes.length} indexes on habit_logs and habits tables`)
    
    // Check for the important unique constraint
    const uniqueConstraint = indexes.find(idx => 
      idx.indexname.includes('habitId_date') || 
      idx.indexdef.includes('habitId') && idx.indexdef.includes('date')
    )
    
    if (uniqueConstraint) {
      console.log('✅ habitId_date unique constraint exists')
    } else {
      console.log('⚠️  habitId_date unique constraint may be missing')
    }

    // Sample data check
    console.log('\n📈 Sample data check...')
    const recentLogs = await prisma.habitLog.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        date: true,
        completed: true,
        updatedDuringToggle: true,
        habit: {
          select: {
            title: true,
            currentStreak: true,
            bestStreak: true
          }
        }
      }
    })

    if (recentLogs.length > 0) {
      console.log('✅ Recent habit logs found:')
      recentLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.habit.title} - ${log.date.toISOString().split('T')[0]} - completed: ${log.completed} - flag: ${log.updatedDuringToggle}`)
        console.log(`      Streaks: current=${log.habit.currentStreak}, best=${log.habit.bestStreak}`)
      })
    } else {
      console.log('ℹ️  No habit logs found (new database?)')
    }

    // Overall assessment
    console.log('\n🎯 Schema Status Assessment:')
    const hasUpdatedDuringToggle = !!updatedDuringToggleColumn
    const hasStreakColumns = habitColumns.length === 2
    const hasUniqueConstraint = !!uniqueConstraint

    console.log(`   updatedDuringToggle field: ${hasUpdatedDuringToggle ? '✅' : '❌'}`)
    console.log(`   Streak columns: ${hasStreakColumns ? '✅' : '❌'}`)
    console.log(`   Unique constraints: ${hasUniqueConstraint ? '✅' : '❌'}`)

    if (hasUpdatedDuringToggle && hasStreakColumns && hasUniqueConstraint) {
      console.log('\n🎉 Production schema is UP TO DATE!')
      console.log('   Ready for immediate streak updates feature!')
    } else {
      console.log('\n⚠️  Production schema needs updates:')
      if (!hasUpdatedDuringToggle) {
        console.log('   - Run: node scripts/migrate-production.js')
      }
      if (!hasStreakColumns) {
        console.log('   - Streak columns missing in habits table')
      }
      if (!hasUniqueConstraint) {
        console.log('   - Check database constraints')
      }
    }

  } catch (error) {
    console.error('\n❌ Schema check failed:', error)
    
    if (error.message.includes('connect')) {
      console.error('\n🔧 Connection issues:')
      console.error('   - Check DATABASE_URL environment variable')
      console.error('   - Verify database is accessible')
      console.error('   - Check network/firewall settings')
    } else if (error.message.includes('permission')) {
      console.error('\n🔧 Permission issues:')
      console.error('   - Check database user permissions')
      console.error('   - Verify you can read schema information')
    } else {
      console.error('\n🔧 Other issues:')
      console.error('   - Check if tables exist')
      console.error('   - Verify Prisma schema matches database')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkProductionSchema() 