const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'westley@sweetbyte.co.uk' }
    });
    
    if (user) {
      console.log('USER FOUND IN DATABASE:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('No user found with email: westley@sweetbyte.co.uk');
    }
    
    // Also check for any related data
    const accounts = await prisma.account.findMany({
      where: { 
        user: {
          email: 'westley@sweetbyte.co.uk'
        }
      }
    });
    
    if (accounts.length > 0) {
      console.log('\nRELATED ACCOUNTS FOUND:');
      console.log(JSON.stringify(accounts, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
