import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  console.log('🔍 [GET /api/habits] Request received')
  
  try {
    console.log('🔐 Getting server session...')
    const session = await getServerSession(authOptions)
    console.log('📋 Session data:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      email: session?.user?.email 
    })
    
    if (!session?.user?.email) {
      console.log('❌ No session or email found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Looking for user in database...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    console.log('👤 User found:', { hasUser: !!user, userId: user?.id })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('📊 Fetching habits from database...')
    
    // First get habits with safe column selection to avoid missing 'order' column in production
    const habitsRaw = await prisma.$queryRaw`
      SELECT 
        h.id,
        h.title,
        h.category,
        h.frequency,
        h."isActive",
        h."currentStreak",
        h."bestStreak",
        h."createdAt",
        h."updatedAt",
        h."userId"
      FROM habits h
      WHERE h."userId" = ${user.id} AND h."isActive" = true
      ORDER BY h."createdAt" ASC
    ` as Array<{
      id: string
      title: string
      category: string
      frequency: string
      isActive: boolean
      currentStreak: number
      bestStreak: number
      createdAt: Date
      updatedAt: Date
      userId: string
    }>

    // Then get logs for each habit
    const habits = await Promise.all(
      habitsRaw.map(async (habit) => {
        const logs = await prisma.habitLog.findMany({
          where: {
            habitId: habit.id,
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { date: 'desc' }
        })
        
        return {
          ...habit,
          logs
        }
      })
    )
    
    console.log('✅ Habits fetched successfully:', { count: habits.length })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('💥 Error in GET /api/habits:', error)
    console.error('📊 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log('🔍 [POST /api/habits] Request received')
  
  try {
    console.log('🔐 Getting server session...')
    const session = await getServerSession(authOptions)
    console.log('📋 Session data:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      email: session?.user?.email,
      sessionStatus: session ? 'authenticated' : 'unauthenticated'
    })
    
    if (!session?.user?.email) {
      console.log('❌ No session or email found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Looking for user in database...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    console.log('👤 User found:', { hasUser: !!user, userId: user?.id })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { title, category, frequency } = body
    console.log('📝 Creating habit with data:', { title, category, frequency })

    if (!title) {
      console.log('❌ Title is required')
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    console.log('💾 Creating habit in database...')
    console.log('💾 Database connection test...')
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Database connection test successful')
    } catch (dbError) {
      console.error('❌ Database connection test failed:', dbError)
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
    }
    
    // Test if habits table exists
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'habits'
        ) as exists
      ` as Array<{ exists: boolean }>
      console.log('📋 Habits table exists:', tableExists[0].exists)
      
      if (!tableExists[0].exists) {
        throw new Error('Habits table does not exist in database')
      }
    } catch (tableError) {
      console.error('❌ Table check failed:', tableError)
      throw new Error(`Table check failed: ${tableError instanceof Error ? tableError.message : String(tableError)}`)
    }
    
    // Test if required columns exist
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name
        FROM information_schema.columns 
        WHERE table_name = 'habits' 
        AND table_schema = 'public'
      ` as Array<{ column_name: string }>
      const columnNames = columns.map(col => col.column_name)
      console.log('📊 Available columns:', columnNames)
      
      const requiredColumns = ['id', 'title', 'category', 'frequency', 'userId']
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col))
      
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
      }
    } catch (columnError) {
      console.error('❌ Column check failed:', columnError)
      throw new Error(`Column check failed: ${columnError instanceof Error ? columnError.message : String(columnError)}`)
    }

    const habit = await prisma.habit.create({
      data: {
        title,
        category: category || 'general',
        frequency: frequency || 'daily',
        userId: user.id
      },
      include: {
        logs: true
      }
    })
    console.log('✅ Habit created successfully:', { habitId: habit.id })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('💥 Error in POST /api/habits:', error)
    console.error('📊 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: error instanceof Error ? (error as any).code : 'No error code'
    })
    
    // Return more specific error messages for debugging
    if (error instanceof Error) {
      if (error.message.includes('Database connection failed')) {
        return NextResponse.json({ error: 'Database connection error', details: error.message }, { status: 500 })
      }
      if (error.message.includes('Table check failed')) {
        return NextResponse.json({ error: 'Database schema error', details: error.message }, { status: 500 })
      }
      if (error.message.includes('Column check failed')) {
        return NextResponse.json({ error: 'Database schema error', details: error.message }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
} 