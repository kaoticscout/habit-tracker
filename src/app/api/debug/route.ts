import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  console.log('🔍 [GET /api/debug] Debug endpoint called')
  
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabase: false,
    hasAuth: false,
    session: null,
    user: null,
    databaseTest: null,
    errors: []
  }
  
  try {
    // Test 1: Check if authOptions is working
    console.log('🔐 Testing auth configuration...')
    debugInfo.hasAuth = !!authOptions
    
    // Test 2: Try to get session
    console.log('🔐 Getting server session...')
    const session = await getServerSession(authOptions)
    debugInfo.session = {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email ? '***@***.***' : null,
      name: session?.user?.name || null
    }
    
    // Test 3: Test database connection
    console.log('🗄️  Testing database connection...')
    try {
      const userCount = await prisma.user.count()
      const habitCount = await prisma.habit.count()
      debugInfo.hasDatabase = true
      debugInfo.databaseTest = {
        connected: true,
        userCount,
        habitCount
      }
      console.log('✅ Database connection successful')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      debugInfo.databaseTest = {
        connected: false,
        error: dbError instanceof Error ? dbError.message : String(dbError)
      }
      debugInfo.errors.push('Database connection failed')
    }
    
    // Test 4: If user is logged in, try to find them
    if (session?.user?.email) {
      console.log('👤 Looking up user in database...')
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: {
            _count: {
              select: { habits: true }
            }
          }
        })
        debugInfo.user = {
          found: !!user,
          hasId: !!user?.id,
          habitCount: user?._count?.habits || 0
        }
      } catch (userError) {
        console.error('❌ User lookup failed:', userError)
        debugInfo.user = {
          found: false,
          error: userError instanceof Error ? userError.message : String(userError)
        }
        debugInfo.errors.push('User lookup failed')
      }
    }
    
    console.log('✅ Debug check completed')
    return NextResponse.json(debugInfo)
    
  } catch (error) {
    console.error('💥 Debug endpoint error:', error)
    debugInfo.errors.push(error instanceof Error ? error.message : String(error))
    return NextResponse.json(debugInfo, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log('🔍 [POST /api/debug] Database write test')
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized - login required for write test' 
      }, { status: 401 })
    }
    
    // Test creating a temporary record
    const testResult = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database write test completed',
      userExists: !!testResult
    })
    
  } catch (error) {
    console.error('💥 Database write test failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
} 