// app/api/posts/[id]/customisation-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCustomisationAllowed } from '@/lib/usage/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const postId = params.id;

    // Use centralized service with plan-based limits
    const customisation = await checkCustomisationAllowed(postId, userId);

    return NextResponse.json({
      customisations_used: customisation.customisationsUsed,
      customisations_left: customisation.customisationsLeft,
      allowed: customisation.allowed,
    });
  } catch (error) {
    console.error('[GET /api/posts/[id]/customisation-usage] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

