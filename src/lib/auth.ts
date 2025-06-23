import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

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
      async authorize(credentials) {
        console.log('Authorize called with:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password 
        })

        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          // Ensure database connection
          await prisma.$connect()
          console.log('Database connected successfully')

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true
            }
          })

          console.log('User found:', { 
            exists: !!user, 
            email: user?.email,
            hasPassword: !!user?.password 
          })

          if (!user || !user.password) {
            console.log('User not found or no password')
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password valid:', isValid)
          
          if (!isValid) {
            console.log('Invalid password')
            return null
          }

          console.log('Authentication successful for:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 