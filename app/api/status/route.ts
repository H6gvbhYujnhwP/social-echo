// app/api/status/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if welcomeSentAt column exists by querying it
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'welcomeSentAt'
      ) as exists
    `;
    
    const welcomeSentAtExists = result[0]?.exists || false;
    
    // Get database stats
    const userCount = await prisma.user.count();
    const subscriptionCount = await prisma.subscription.count();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount,
        subscriptionCount,
      },
      schema: {
        welcomeSentAtColumn: welcomeSentAtExists ? 'exists' : 'missing',
      },
      version: process.env.npm_package_version || 'unknown',
    });
  } catch (error: any) {
    console.error('[status] Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error?.message || 'Unknown error',
        database: {
          connected: false,
        },
      },
      { status: 500 }
    );
  }
}

