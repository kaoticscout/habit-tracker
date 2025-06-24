const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking users in database...\n')
  
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Found ${users.length} users:`)
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Name: ${user.name || 'null'}`)
      console.log(`   Has password: ${!!user.password}`)
      console.log(`   Created: ${user.createdAt}`)
      
      if (user.password) {
        // Test with common passwords
        const testPasswords = ['password123', 'test123', 'admin123']
        for (const testPassword of testPasswords) {
          try {
            const isValid = await bcrypt.compare(testPassword, user.password)
            if (isValid) {
              console.log(`   ✅ Password "${testPassword}" works!`)
              break
            }
          } catch (error) {
            console.log(`   ❌ Error testing password: ${error.message}`)
          }
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Database disconnected')
  }
}

checkUsers().catch(console.error) 