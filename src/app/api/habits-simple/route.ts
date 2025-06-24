import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  console.log('🔍 [GET /api/habits-simple] Starting simplified habits test')
  
  try {
    // Step 1: Get session
    console.log('Step 1: Getting session...')
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }
    console.log('✅ Session found')

    // Step 2: Find user
    console.log('Step 2: Finding user...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.log('✅ User found:', user.id)

    // Step 3: Count habits (simple query first)
    console.log('Step 3: Counting habits...')
    const habitCount = await prisma.habit.count({
      where: { 
        userId: user.id,
        isActive: true 
      }
    })
    console.log('✅ Found habits:', habitCount)

    // Step 4: Try to fetch habits without includes
    console.log('Step 4: Fetching habits (no includes)...')
    const simpleHabits = await prisma.habit.findMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log('✅ Simple habits fetched:', simpleHabits.length)

    // Step 5: Try with logs included
    console.log('Step 5: Fetching habits with logs...')
    const habitsWithLogs = await prisma.habit.findMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 10 // Limit to recent logs
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    console.log('✅ Habits with logs fetched:', habitsWithLogs.length)

    // Step 6: Check for any problematic data
    const logCounts = habitsWithLogs.map(habit => ({
      habitId: habit.id,
      title: habit.title,
      logCount: habit.logs.length
    }))
    console.log('📊 Log counts per habit:', logCounts)

    return NextResponse.json({
      success: true,
      userId: user.id,
      habitCount,
      simpleHabits: simpleHabits.length,
      habitsWithLogs: habitsWithLogs.length,
      logCounts,
      // Return first habit as sample
      sampleHabit: habitsWithLogs[0] || null
    })

  } catch (error) {
    console.error('💥 Error in habits-simple:', error)
    console.error('📊 Error type:', typeof error)
    console.error('📊 Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('📊 Error message:', error instanceof Error ? error.message : String(error))
    console.error('📊 Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.name : typeof error
    }, { status: 500 })
  }
} 