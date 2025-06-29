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

    const body = await req.json()
    const { title, category, frequency } = body
    console.log('📝 Creating habit with data:', { title, category, frequency })

    if (!title) {
      console.log('❌ Title is required')
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    console.log('💾 Creating habit in database...')
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
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 