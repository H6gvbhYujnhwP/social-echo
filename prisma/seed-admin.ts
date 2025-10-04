/**
 * Admin Seed Script
 * 
 * Initializes:
 * 1. Default AI configuration in AdminConfig table
 * 2. Master admin user (if needed)
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Default AI configuration (inline to avoid import issues)
const DEFAULT_AI_GLOBALS = {
  textModel: 'gpt-4.1-mini',
  temperature: 0.7,
  hashtagCountDefault: 8,
  allowedPostTypes: ['selling', 'informational', 'advice', 'news'],
  ukPostingTimeHint: true,
  includeHeadlineOptions: true,
  includeVisualPrompt: true,
  includeHashtags: true,
  weightPreferredTerms: 0.6,
  weightDownvotedTones: 0.5,
  enableNewsMode: true,
  newsFallbackToInsight: true,
  
  // Master Prompt Template
  masterPromptTemplate: `Task: Create a LinkedIn post in the style of Chris Donnelly — direct, tactical, problem-led, story-first.

Steps:
1. Provide 3 headline/title options (hooks).
2. Write the full LinkedIn post draft with double spacing between sentences, ending in a reflection or question.
3. Add hashtags at the foot of the post (6–8, mixing broad SME finance reach and niche targeting).
4. Suggest 1 strong image concept that pairs with the post.
5. Suggest the best time to post that day (UK time).

Content rotation: Alternate between:
- A serious SME finance post (cashflow, staff, late payments, interest rates, growth, resilience).
- A funny/quirky finance industry story (weird leases, unusual loans, absurd expenses, strange finance deals).

Output format:
- Headline options
- LinkedIn post draft
- Hashtags
- Visual concept
- Best time to post today`,
  
  // Daily Topic Rotation
  rotation: {
    enabled: true,
    mode: 'daily',
    buckets: ['serious_sme_finance', 'funny_finance_story'],
    timezone: 'Europe/London',
    diversityWindowDays: 7
  },
  
  // Randomness (Temperature Jitter)
  randomness: {
    enabled: true,
    temperatureMin: 0.6,
    temperatureMax: 0.9
  }
}

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
        json: DEFAULT_AI_GLOBALS as any
      }
    })
    console.log('✅ AI configuration created')
  } else {
    // Merge new fields into existing config if they're missing
    const currentConfig = existingConfig.json as any
    let updated = false
    const missingFields: string[] = []
    
    if (!currentConfig.masterPromptTemplate) {
      console.log('  → Adding masterPromptTemplate')
      currentConfig.masterPromptTemplate = DEFAULT_AI_GLOBALS.masterPromptTemplate
      missingFields.push('masterPromptTemplate')
      updated = true
    }
    
    if (!currentConfig.rotation) {
      console.log('  → Adding rotation')
      currentConfig.rotation = DEFAULT_AI_GLOBALS.rotation
      missingFields.push('rotation')
      updated = true
    }
    
    if (!currentConfig.randomness) {
      console.log('  → Adding randomness')
      currentConfig.randomness = DEFAULT_AI_GLOBALS.randomness
      missingFields.push('randomness')
      updated = true
    }
    
    if (updated) {
      await prisma.adminConfig.update({
        where: { key: 'ai_globals' },
        data: { json: currentConfig }
      })
      console.log(`✅ AI configuration updated with new fields: ${missingFields.join(', ')}`)
    } else {
      console.log('ℹ️  AI configuration already exists and is up to date')
    }
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
