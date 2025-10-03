/**
 * Admin Seed Script
 * 
 * Initializes:
 * 1. Default AI configuration in AdminConfig table
 * 2. Master admin user (if needed)
 */

import { PrismaClient } from '@prisma/client'
import { DEFAULT_AI_GLOBALS } from '../lib/ai/ai-config'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin data...')
  
  // 1. Initialize AI configuration
  console.log('📝 Creating default AI configuration...')
  
  const existingConfig = await prisma.adminConfig.findUnique({
    where: { key: 'ai_globals' }
  })
  
  if (!existingConfig) {
    await prisma.adminConfig.create({
      data: {
        key: 'ai_globals',
        json: DEFAULT_AI_GLOBALS as any,
        updatedBy: 'system'
      }
    })
    console.log('✅ AI configuration created')
  } else {
    console.log('ℹ️  AI configuration already exists')
  }
  
  // 2. Create master admin user (optional - only if MASTER_ADMIN_EMAIL is set)
  const masterEmail = process.env.MASTER_ADMIN_EMAIL
  const masterPassword = process.env.MASTER_ADMIN_PASSWORD
  
  if (masterEmail && masterPassword) {
    console.log('👤 Creating master admin user...')
    
    const existingUser = await prisma.user.findUnique({
      where: { email: masterEmail }
    })
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(masterPassword, 10)
      
      await prisma.user.create({
        data: {
          email: masterEmail,
          name: 'Master Admin',
          password: hashedPassword,
          role: 'MASTER_ADMIN',
          emailVerified: new Date()
        }
      })
      console.log('✅ Master admin user created')
    } else {
      // Update existing user to MASTER_ADMIN role
      await prisma.user.update({
        where: { email: masterEmail },
        data: { role: 'MASTER_ADMIN' }
      })
      console.log('✅ Existing user upgraded to MASTER_ADMIN')
    }
  } else {
    console.log('ℹ️  Skipping master admin creation (set MASTER_ADMIN_EMAIL and MASTER_ADMIN_PASSWORD to create)')
  }
  
  console.log('✨ Admin seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
