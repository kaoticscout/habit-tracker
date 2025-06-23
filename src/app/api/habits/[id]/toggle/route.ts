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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        isActive: true
      }
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if there's already a log for today
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: params.id,
          date: today
        }
      }
    })

    let log
    if (existingLog) {
      // Toggle existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: !existingLog.completed }
      })
    } else {
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

    return NextResponse.json({
      success: true,
      completed: log.completed,
      date: log.date
    })
  } catch (error) {
    console.error('Error toggling habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 