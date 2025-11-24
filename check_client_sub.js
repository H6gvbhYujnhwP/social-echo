const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Find the client user
  const client = await prisma.user.findFirst({
    where: {
      email: 'marketing-abc-client1@socialecho.ai'
    },
    include: {
      subscription: true
    }
  })
  
  if (client) {
    console.log('Client found:')
    console.log('- ID:', client.id)
    console.log('- Email:', client.email)
    console.log('- Role:', client.role)
    console.log('- Company:', client.clientCompanyName)
    console.log('\nSubscription:')
    if (client.subscription) {
      console.log('- Plan:', client.subscription.plan)
      console.log('- Status:', client.subscription.status)
      console.log('- Usage Count:', client.subscription.usageCount)
      console.log('- Usage Limit:', client.subscription.usageLimit)
      console.log('- Stripe Customer ID:', client.subscription.stripeCustomerId)
      console.log('- Stripe Subscription ID:', client.subscription.stripeSubscriptionId)
    } else {
      console.log('- No subscription found')
    }
  } else {
    console.log('Client not found')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
