import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMasterAdminFromReq } from '@/lib/rbac';

export async function GET(_: Request, { params }: { params: { id: string }}) {
  try {
    await requireMasterAdminFromReq();
    
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { 
        subscription: true,
        profile: true,
        postHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
