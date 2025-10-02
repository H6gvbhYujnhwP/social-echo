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
          plan: 'STARTER',
          postsThisMonth: 0,
          postsLimit: 8,
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
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
    { dayOfWeek: 0, postType: 'advice' },      // Sunday
    { dayOfWeek: 1, postType: 'informational' }, // Monday
    { dayOfWeek: 2, postType: 'selling' },     // Tuesday
    { dayOfWeek: 3, postType: 'informational' }, // Wednesday
    { dayOfWeek: 4, postType: 'advice' },      // Thursday
    { dayOfWeek: 5, postType: 'news' },        // Friday
    { dayOfWeek: 6, postType: 'informational' }  // Saturday
  ]

  for (const day of plannerSchedule) {
    await prisma.plannerDay.upsert({
      where: {
        userId_dayOfWeek: {
          userId: user.id,
          dayOfWeek: day.dayOfWeek
        }
      },
      update: {
        postType: day.postType
      },
      create: {
        userId: user.id,
        dayOfWeek: day.dayOfWeek,
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
      headline: '5 IT Security Mistakes That Could Cost Your Business Everything',
      postText: 'Most small businesses think they\'re too small to be targeted by cybercriminals. That\'s exactly what makes them perfect targets.\n\nHere are 5 critical IT security mistakes we see every week:\n\n1. No backup strategy - "It won\'t happen to us"\n2. Weak passwords - Still using "Password123"?\n3. No employee training - Your team is your first line of defense\n4. Outdated software - Those updates exist for a reason\n5. No incident response plan - Hoping for the best isn\'t a strategy\n\nThe good news? All of these are fixable with the right IT partner.\n\nWhat\'s your biggest IT security concern right now?',
      hashtags: ['CyberSecurity', 'ITSupport', 'BusinessTips', 'SME', 'DataProtection', 'CloudBackup'],
      visualPrompt: 'Professional illustration showing a shield protecting a small business office from digital threats, with icons representing backups, passwords, and security updates',
      bestTimeUk: '09:00',
      isRegeneration: false
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
