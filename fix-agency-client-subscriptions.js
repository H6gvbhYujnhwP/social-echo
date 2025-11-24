const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Fixing agency client subscriptions...\n')
  
  // Find all users with agencyId (agency clients)
  const agencyClients = await prisma.user.findMany({
    where: {
      agencyId: { not: null },
      role: 'CUSTOMER'
    },
    include: {
      subscription: true
    }
  })
  
  console.log(`Found ${agencyClients.length} agency clients\n`)
  
  for (const client of agencyClients) {
    console.log(`Processing: ${client.email} (${client.clientCompanyName})`)
    
    if (!client.subscription) {
      // Create new unlimited subscription
      await prisma.subscription.create({
        data: {
          userId: client.id,
          plan: 'agency_client',
          status: 'active',
          usageCount: 0,
          usageLimit: null, // null = unlimited
          stripeCustomerId: null,
          stripeSubscriptionId: null
        }
      })
      console.log('  ✓ Created unlimited subscription')
    } else if (client.subscription.usageLimit !== null) {
      // Update existing subscription to unlimited
      await prisma.subscription.update({
        where: { userId: client.id },
        data: {
          plan: 'agency_client',
          status: 'active',
          usageLimit: null, // null = unlimited
          stripeCustomerId: null,
          stripeSubscriptionId: null
        }
      })
      console.log(`  ✓ Updated subscription from ${client.subscription.plan} (${client.subscription.usageLimit} posts) to unlimited`)
    } else {
      console.log('  ✓ Already has unlimited subscription')
    }
  }
  
  console.log('\nDone!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
