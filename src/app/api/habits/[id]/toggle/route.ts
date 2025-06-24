import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    console.log(`🔄 [TOGGLE] Starting toggle for habit ${params.id}`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ [TOGGLE] No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ [TOGGLE] User not found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if habit belongs to user - use explicit column selection to avoid missing 'order' column
    const habit = await prisma.habit.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true
      },
      select: {
        id: true,
        title: true,
        userId: true,
        isActive: true
      }
    })

    if (!habit) {
      console.log('❌ [TOGGLE] Habit not found')
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    console.log(`📋 [TOGGLE] Found habit: ${habit.title}`)

    // Get today's date (start of day) - ensure consistent timezone handling
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    console.log(`📅 [TOGGLE] Current time: ${now.toISOString()}`)
    console.log(`📅 [TOGGLE] Today (start of day): ${today.toISOString()}`)

    // Check if there's already a log for today
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: params.id,
          date: today
        }
      }
    })

    console.log(`📊 [TOGGLE] Existing log:`, existingLog ? {
      id: existingLog.id,
      completed: existingLog.completed,
      date: existingLog.date.toISOString()
    } : 'none')

    let log
    if (existingLog) {
      console.log(`🔄 [TOGGLE] Toggling existing log: ${existingLog.completed} → ${!existingLog.completed}`)
      // Toggle existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: !existingLog.completed }
      })
    } else {
      console.log('➕ [TOGGLE] Creating new log with completed: true')
      // Create new log for today
      log = await prisma.habitLog.create({
        data: {
          habitId: params.id,
          userId: user.id,
          date: today,
          completed: true
        }
      })
    }

    console.log(`✅ [TOGGLE] Final result:`, {
      id: log.id,
      completed: log.completed,
      date: log.date.toISOString()
    })

    return NextResponse.json({
      success: true,
      completed: log.completed,
      date: log.date
    })
  } catch (error) {
    console.error('💥 [TOGGLE] Error toggling habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 