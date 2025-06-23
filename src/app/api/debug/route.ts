import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    // Test session
    let sessionInfo = null
    try {
      const session = await getServerSession(authOptions)
      sessionInfo = {
        hasSession: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id
      }
    } catch (sessionError) {
      sessionInfo = {
        error: sessionError instanceof Error ? sessionError.message : 'Unknown session error'
      }
    }
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlHost: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        vercelUrl: process.env.VERCEL_URL,
        vercelEnv: process.env.VERCEL_ENV,
      },
      database: {
        connected: true,
        userCount
      },
      session: sessionInfo,
      nextAuth: {
        version: 'v4',
        strategy: 'jwt',
        providers: ['credentials']
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      environment: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        vercelUrl: process.env.VERCEL_URL,
        vercelEnv: process.env.VERCEL_ENV,
      },
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      session: null
    }, { status: 500 })
  }
} 