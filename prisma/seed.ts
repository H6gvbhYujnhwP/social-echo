import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  const passwordHash = await bcrypt.hash('Passw0rd!', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@sweetbyte.co.uk' },
    update: {},
    create: {
      email: 'test@sweetbyte.co.uk',
      passwordHash,
      name: 'Sweetbyte Tester',
      emailVerified: new Date(),
      profile: {
        create: {
          businessName: 'Sweetbyte',
          website: 'https://www.sweetbyte.co.uk',
          industry: 'IT Services and Support',
          productsServices: 'Managed IT services, cloud backup, cybersecurity, IT support',
          targetAudience: 'Small and medium businesses in the UK',
          usp: 'Proactive IT support that prevents problems before they happen',
          tone: 'Professional',
          keywords: 'backups, security, IT support, cloud services',
          rotation: 'serious'
        }
      },
      subscription: {
        create: {
          plan: 'starter',
          status: 'active',
          usageLimit: 8,
          usageCount: 0
        }
      }
    },
    include: {
      profile: true,
      subscription: true
    }
  })

  console.log('✅ Created user:', user.email)

  // Create planner schedule (7 days)
  const plannerSchedule = [
    { weekday: 0, postType: 'advice' },      // Sunday
    { weekday: 1, postType: 'informational' }, // Monday
    { weekday: 2, postType: 'selling' },     // Tuesday
    { weekday: 3, postType: 'informational' }, // Wednesday
    { weekday: 4, postType: 'advice' },      // Thursday
    { weekday: 5, postType: 'news' },        // Friday
    { weekday: 6, postType: 'informational' }  // Saturday
  ]

  for (const day of plannerSchedule) {
    await prisma.plannerDay.upsert({
      where: {
        userId_weekday: {
          userId: user.id,
          weekday: day.weekday
        }
      },
      update: {
        postType: day.postType
      },
      create: {
        userId: user.id,
        weekday: day.weekday,
        postType: day.postType
      }
    })
  }

  console.log('✅ Created planner schedule (7 days)')

  // Create sample post history
  const samplePost = await prisma.postHistory.create({
    data: {
      userId: user.id,
      postType: 'advice',
      tone: 'Professional',
      draft: {
        headline_options: [
          '5 IT Security Mistakes That Could Cost Your Business Everything',
          'Is Your Business Ready for a Cyber Attack? Here\'s How to Prepare',
          'The IT Support Checklist Every SME Should Follow'
        ],
        post_text: 'Most small businesses think they\'re too small to be targeted by cybercriminals. That\'s exactly what makes them perfect targets.\n\nHere are 5 critical IT security mistakes we see every week:\n\n1. No backup strategy - "It won\'t happen to us"\n2. Weak passwords - Still using "Password123"?\n3. No employee training - Your team is your first line of defense\n4. Outdated software - Those updates exist for a reason\n5. No incident response plan - Hoping for the best isn\'t a strategy\n\nThe good news? All of these are fixable with the right IT partner.\n\nWhat\'s your biggest IT security concern right now?',
        hashtags: ['CyberSecurity', 'ITSupport', 'BusinessTips', 'SME', 'DataProtection', 'CloudBackup'],
        visual_prompt: 'Professional illustration showing a shield protecting a small business office from digital threats, with icons representing backups, passwords, and security updates',
        best_time_uk: '09:00'
      }
    }
  })

  console.log('✅ Created sample post')

  // Create sample feedback
  await prisma.feedback.create({
    data: {
      userId: user.id,
      postId: samplePost.id,
      rating: 'up',
      note: null
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
