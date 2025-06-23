import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has habits
    const existingHabits = await prisma.habit.findMany({
      where: { userId: user.id }
    })

    if (existingHabits.length > 0) {
      return NextResponse.json({ message: 'User already has habits' }, { status: 200 })
    }

    const sampleHabits = [
      { title: 'Drink 8 glasses of water', category: 'Health', frequency: 'daily' },
      { title: 'Read for 30 minutes', category: 'Learning', frequency: 'daily' },
      { title: 'Exercise for 45 minutes', category: 'Fitness', frequency: 'daily' },
      { title: 'Practice meditation', category: 'Wellness', frequency: 'daily' },
      { title: 'Write in journal', category: 'Personal', frequency: 'daily' },
      { title: 'Call family/friends', category: 'Social', frequency: 'weekly' }
    ]

    // Create sample habits for the user
    const createdHabits = await Promise.all(
      sampleHabits.map(habit =>
        prisma.habit.create({
          data: {
            title: habit.title,
            frequency: habit.frequency,
            userId: user.id
          }
        })
      )
    )

    // Create some sample logs for the past few days
    const today = new Date()
    const logs = []

    for (const habit of createdHabits.slice(0, 3)) { // Only for first 3 habits
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        // Randomly create logs (70% completion rate)
        if (Math.random() > 0.3) {
          logs.push({
            habitId: habit.id,
            userId: user.id,
            date,
            completed: true
          })
        }
      }
    }

    if (logs.length > 0) {
      await prisma.habitLog.createMany({
        data: logs,
        skipDuplicates: true
      })
    }

    return NextResponse.json({ 
      message: 'Sample habits created successfully',
      habitsCreated: createdHabits.length,
      logsCreated: logs.length
    })
  } catch (error) {
    console.error('Error creating sample habits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 