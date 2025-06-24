import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  console.log('🔍 [GET /api/habits-fixed] Request received')
  
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
    
    // Calculate 30 days ago more safely
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)
    
    console.log('📅 Date filter - 30 days ago:', thirtyDaysAgo.toISOString())
    
    const habits = await prisma.habit.findMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      include: {
        logs: {
          where: {
            date: {
              gte: thirtyDaysAgo
            }
          },
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log('✅ Habits fetched successfully:', { count: habits.length })

    // Log some details about the habits
    const habitSummary = habits.map(habit => ({
      id: habit.id,
      title: habit.title,
      logCount: habit.logs.length
    }))
    console.log('📊 Habit summary:', habitSummary)

    return NextResponse.json(habits)
  } catch (error) {
    console.error('💥 Error in GET /api/habits-fixed:', error)
    console.error('📊 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 