import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import type { User } from 'next-auth'

// Ensure required environment variables are available
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not defined')
}

export const authOptions: NextAuthOptions = {
  // Remove the adapter when using credentials provider with JWT strategy
  // The Prisma adapter conflicts with JWT strategy for credentials providers
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        console.log('🔐 Authorize called with:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          // Don't manually connect/disconnect in serverless environments
          // Prisma handles connections automatically
          console.log('✅ Using Prisma client for database query')

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true
            }
          })

          console.log('👤 User lookup result:', { 
            exists: !!user, 
            email: user?.email,
            hasPassword: !!user?.password,
            userId: user?.id
          })

          if (!user) {
            console.log('❌ User not found in database')
            return null
          }

          if (!user.password) {
            console.log('❌ User has no password set')
            return null
          }

          console.log('🔍 Comparing passwords...')
          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔑 Password comparison result:', isValid)
          
          if (!isValid) {
            console.log('❌ Invalid password')
            return null
          }

          const userResult = {
            id: user.id,
            email: user.email,
            name: user.name || null
          }

          console.log('✅ Authentication successful, returning user:', userResult)
          return userResult
        } catch (error) {
          console.error('💥 Auth error:', error)
          return null
        }
        // Removed manual disconnect - let Prisma handle connections
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🎫 JWT callback called:', { 
        hasUser: !!user, 
        hasToken: !!token,
        hasAccount: !!account,
        tokenSub: token?.sub,
        userEmail: user?.email
      })
      
      if (user) {
        console.log('👤 Adding user to token:', { id: user.id, email: user.email })
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      console.log('🎫 JWT token result:', { 
        id: token.id, 
        email: token.email, 
        sub: token.sub 
      })
      return token
    },
    async session({ session, token }) {
      console.log('📋 Session callback called:', { 
        hasSession: !!session,
        hasToken: !!token,
        sessionUserEmail: session?.user?.email,
        tokenId: token?.id
      })
      
      if (session.user && token) {
        session.user.id = token.id as string
        console.log('📋 Session updated with user ID:', session.user.id)
      }
      
      console.log('📋 Final session:', {
        userId: session?.user?.id,
        userEmail: session?.user?.email
      })
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 