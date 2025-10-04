import { prisma } from '@/lib/prisma';
import { requireMasterAdminFromReq } from '@/lib/rbac';

export async function GET(req: Request) {
  try {
    await requireMasterAdminFromReq(req);
    
    const users = await prisma.user.findMany({ 
      include: { subscription: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const rows = [
      ['id','email','name','role','isSuspended','createdAt','plan','status','usageCount','usageLimit','periodEnd'].join(',')
    ].concat(
      users.map(u => [
        u.id, 
        u.email, 
        u.name,
        u.role, 
        u.isSuspended, 
        u.createdAt.toISOString(),
        u.subscription?.plan ?? '', 
        u.subscription?.status ?? '',
        u.subscription?.usageCount ?? 0, 
        u.subscription?.usageLimit ?? 0,
        u.subscription?.currentPeriodEnd?.toISOString() ?? ''
      ].join(','))
    );
    
    return new Response(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users_export.csv"',
      }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Export failed' }),
      { 
        status: error.message?.includes('Forbidden') ? 403 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
