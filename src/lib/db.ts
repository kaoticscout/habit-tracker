import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create database URL with connection parameters to avoid prepared statement conflicts
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) return baseUrl
  
  // In production, add parameters to disable prepared statements
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(baseUrl)
    url.searchParams.set('prepared_statements', 'false')
    url.searchParams.set('pgbouncer', 'true')
    return url.toString()
  }
  
  return baseUrl
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// For serverless environments, we need to handle connections differently
export async function executeQuery<T>(queryFn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  try {
    // Create a fresh client for each query in production to avoid prepared statement conflicts
    if (process.env.NODE_ENV === 'production') {
      const freshClient = new PrismaClient({
        log: ['error'],
        datasources: {
          db: {
            url: getDatabaseUrl()
          }
        }
      })
      
      try {
        const result = await queryFn(freshClient)
        return result
      } finally {
        await freshClient.$disconnect()
      }
    } else {
      // In development, use the global client
      return await queryFn(prisma)
    }
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma 