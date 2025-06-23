import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { habitId, date, completed } = body

    if (!habitId || !date) {
      return NextResponse.json({ error: 'habitId and date are required' }, { status: 400 })
    }

    // Check if habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: user.id,
        isActive: true
      }
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Parse the date and normalize to start of day
    const logDate = new Date(date)
    logDate.setHours(0, 0, 0, 0)

    // Check if there's already a log for this date
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: habitId,
          date: logDate
        }
      }
    })

    let log
    if (existingLog) {
      // Update existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: completed }
      })
    } else {
      // Create new log for the specific date
      log = await prisma.habitLog.create({
        data: {
          habitId: habitId,
          userId: user.id,
          date: logDate,
          completed: completed
        }
      })
    }

    return NextResponse.json({
      success: true,
      log: {
        id: log.id,
        date: log.date,
        completed: log.completed
      }
    })
  } catch (error) {
    console.error('Error migrating habit log:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 