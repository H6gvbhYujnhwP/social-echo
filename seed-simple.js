const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  // Create default AI config
  const config = await prisma.adminConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      aiModel: 'gpt-4.1-mini',
      temperature: 0.7,
      defaultHashtagCount: 5,
      enableSellingPosts: true,
      enableInformationalPosts: true,
      enableAdvicePosts: true,
      enableNewsPosts: true,
      enableHeadlines: true,
      enableVisualPrompts: true,
      enableHashtags: true,
      learningWeightPositive: 1.2,
      learningWeightNegative: 0.8,
    },
  });
  console.log('✅ AI config created:', config);

  // Create master admin user
  const hashedPassword = await bcrypt.hash('test123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@thegreenagents.com' },
    update: { role: 'MASTER_ADMIN' },
    create: {
      email: 'admin@thegreenagents.com',
      password: hashedPassword,
      name: 'Master Admin',
      role: 'MASTER_ADMIN',
    },
  });
  console.log('✅ Master admin created:', user);
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
