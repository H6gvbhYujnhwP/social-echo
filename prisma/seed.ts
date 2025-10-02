import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const password = await bcrypt.hash('Passw0rd!', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@sweetbyte.co.uk' },
    update: {},
    create: {
      email: 'test@sweetbyte.co.uk',
      password,
      name: 'Sweetbyte Tester',
      emailVerified: new Date(),
      profile: {
        create: {
          business_name: 'Sweetbyte',
          website: 'https://www.sweetbyte.co.uk',
          industry: 'IT Services and Support',
          tone: 'professional',
          products_services: 'Managed IT services, cloud backup, cybersecurity, IT support',
          target_audience: 'Small and medium businesses in the UK',
          usp: 'Proactive IT support that prevents problems before they happen',
          keywords: ['backups', 'security', 'IT support', 'cloud services'],
          rotation: 'serious'
        }
      },
      subscription: {
        create: {
          plan: 'starter',
          status: 'active',
          usageCount: 0,
          usageLimit: 8,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      }
    },
    include: {
      profile: true,
      subscription: true
    }
  })

  console.log('✅ Created user:', user.email)

  // Create planner schedule (7 days) - matching localStorage default
  const plannerSchedule = [
    { day: 'mon', type: 'informational', enabled: true },
    { day: 'tue', type: 'advice', enabled: true },
    { day: 'wed', type: 'informational', enabled: true },
    { day: 'thu', type: 'advice', enabled: true },
    { day: 'fri', type: 'selling', enabled: true },
    { day: 'sat', type: 'advice', enabled: true },
    { day: 'sun', type: 'informational', enabled: true }
  ]

  for (const dayPlan of plannerSchedule) {
    await prisma.plannerDay.upsert({
      where: {
        userId_day: {
          userId: user.id,
          day: dayPlan.day
        }
      },
      update: {
        type: dayPlan.type,
        enabled: dayPlan.enabled
      },
      create: {
        userId: user.id,
        day: dayPlan.day,
        type: dayPlan.type,
        enabled: dayPlan.enabled
      }
    })
  }

  console.log('✅ Created planner schedule (7 days)')

  // Create sample post history
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  const samplePost = await prisma.postHistory.create({
    data: {
      userId: user.id,
      date: today,
      postType: 'advice',
      tone: 'professional',
      headlineOptions: [
        '5 IT Security Mistakes That Could Cost Your Business Everything',
        'Is Your Business Ready for a Cyber Attack? Here\'s How to Prepare',
        'The IT Support Checklist Every SME Should Follow'
      ],
      postText: 'Most small businesses think they\'re too small to be targeted by cybercriminals. That\'s exactly what makes them perfect targets.\n\nHere are 5 critical IT security mistakes we see every week:\n\n1. No backup strategy - "It won\'t happen to us"\n2. Weak passwords - Still using "Password123"?\n3. No employee training - Your team is your first line of defense\n4. Outdated software - Those updates exist for a reason\n5. No incident response plan - Hoping for the best isn\'t a strategy\n\nThe good news? All of these are fixable with the right IT partner.\n\nWhat\'s your biggest IT security concern right now?',
      hashtags: ['CyberSecurity', 'ITSupport', 'BusinessTips', 'SME', 'DataProtection', 'CloudBackup'],
      visualPrompt: 'Professional illustration showing a shield protecting a small business office from digital threats, with icons representing backups, passwords, and security updates',
      isRegeneration: false
    }
  })

  console.log('✅ Created sample post')

  // Create sample feedback
  await prisma.feedback.create({
    data: {
      userId: user.id,
      postId: samplePost.id,
      feedback: 'up',
      note: null,
      postType: samplePost.postType,
      tone: samplePost.tone,
      keywords: ['backups', 'security', 'IT support', 'cloud services'],
      hashtags: samplePost.hashtags
    }
  })

  console.log('✅ Created sample feedback')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📧 Test credentials:')
  console.log('   Email: test@sweetbyte.co.uk')
  console.log('   Password: Passw0rd!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
