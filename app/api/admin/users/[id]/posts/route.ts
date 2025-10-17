import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function GET(req: Request, { params }: { params: { id: string }}) {
  try {
    await getAdminActorOrThrow();

    // Get user's posts
    const posts = await prisma.postHistory.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent posts
      select: {
        id: true,
        postType: true,
        tone: true,
        postText: true,
        visualPrompt: true,
        createdAt: true
      }
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
