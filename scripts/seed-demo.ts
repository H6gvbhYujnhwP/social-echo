// scripts/seed-demo.ts
// Seed demo data for features page recordings

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding demo features data...')

  // Create or update demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo+features@socialecho.ai' },
    update: {
      name: 'Cozy Corner Coffee',
      password: hashedPassword,
      twoFactorEnabled: false,
    },
    create: {
      email: 'demo+features@socialecho.ai',
      name: 'Cozy Corner Coffee',
      password: hashedPassword,
      twoFactorEnabled: false,
    },
  })

  console.log('✓ Demo user created:', user.email)

  // Create subscription for demo user
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: 'pro',
      status: 'active',
      usageLimit: 100,
      usageCount: 0,
    },
    create: {
      userId: user.id,
      plan: 'pro',
      status: 'active',
      stripeCustomerId: 'cus_demo_features',
      usageLimit: 100,
      usageCount: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  console.log('✓ Demo subscription created')

  // Create profile for demo user (training data)
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      business_name: 'Cozy Corner Coffee',
      website: 'https://cozycornercoffee.example',
      industry: 'Food & Beverage - Coffee Shop',
      tone: 'casual',
      products_services: 'Specialty coffee, artisan pastries, cozy workspace, community events',
      target_audience: 'Local community members, coffee lovers, remote workers, families',
      usp: 'A warm, welcoming neighborhood coffee shop where quality meets community',
      keywords: ['coffee', 'local', 'community', 'cozy', 'artisan', 'specialty'],
      rotation: 'serious',
    },
    create: {
      userId: user.id,
      business_name: 'Cozy Corner Coffee',
      website: 'https://cozycornercoffee.example',
      industry: 'Food & Beverage - Coffee Shop',
      tone: 'casual',
      products_services: 'Specialty coffee, artisan pastries, cozy workspace, community events',
      target_audience: 'Local community members, coffee lovers, remote workers, families',
      usp: 'A warm, welcoming neighborhood coffee shop where quality meets community',
      keywords: ['coffee', 'local', 'community', 'cozy', 'artisan', 'specialty'],
      rotation: 'serious',
    },
  })

  console.log('✓ Demo profile created')

  // Create planner days for demo user
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const types = ['selling', 'informational', 'advice', 'news']
  
  for (let i = 0; i < days.length; i++) {
    const day = days[i]
    const type = types[i % types.length]
    
    await prisma.plannerDay.upsert({
      where: {
        userId_day: {
          userId: user.id,
          day: day,
        },
      },
      update: {
        type: type,
        enabled: true,
      },
      create: {
        userId: user.id,
        day: day,
        type: type,
        enabled: true,
      },
    })
  }

  console.log('✓ Demo planner days created')

  // Create a sample post history for demo
  const today = new Date().toISOString().split('T')[0]
  
  await prisma.postHistory.create({
    data: {
      userId: user.id,
      date: today,
      postType: 'selling',
      tone: 'casual',
      headlineOptions: [
        'Autumn is here! ☕',
        'Fall flavors are back!',
        'Cozy up with our new autumn specials',
      ],
      postText: `Fall is in the air, and so are our new Autumn specials! ☕🍂

We're thrilled to introduce:
• Pumpkin Spice Latte - The classic that never gets old
• Maple Pecan Cold Brew - Sweet, nutty, and refreshing
• Cinnamon Swirl Muffins - Fresh-baked every morning

Each sip and bite brings the warmth and comfort of the season. Drop by this week for a taste of fall!

#AutumnVibes #CoffeeShop #LocalBusiness #PumpkinSpice`,
      hashtags: ['AutumnVibes', 'CoffeeShop', 'LocalBusiness', 'PumpkinSpice'],
      visualPrompt: 'Cozy coffee shop scene with warm autumn tones, a pumpkin spice latte with latte art on a wooden table, surrounded by cinnamon sticks and maple leaves, morning sunlight, minimal background text, realistic photographic style',
      imageStyle: 'photo-real',
    },
  })

  console.log('✓ Demo post history created')

  console.log('\n✅ Demo features data seeded successfully!')
  console.log('\nDemo user credentials:')
  console.log('  Email: demo+features@socialecho.ai')
  console.log('  Password: demo123')
  console.log('  Business: Cozy Corner Coffee')
  console.log('\nYou can now use this account to record demo videos for the features page.')
  console.log('\nRecording prompts:')
  console.log('  Post: "Announce autumn specials: pumpkin spice latte, maple pecan cold brew, cinnamon swirl muffins"')
  console.log('  Refinement: "Make the opener more catchy + add ☕"')
  console.log('  Image: "Cozy coffee shop scene with warm autumn tones, pumpkin spice latte..."')
}

main()
  .catch((e) => {
    console.error('Error seeding demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

