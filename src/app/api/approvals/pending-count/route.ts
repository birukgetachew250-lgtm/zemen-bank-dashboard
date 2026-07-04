import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
  if (session instanceof NextResponse) return session;

  try {
    const count = await prisma.pendingApproval.count({
      where: { status: 'pending' },
    });

    // Fetch top 5 recent pending approvals for the dropdown preview
    const recent = await prisma.pendingApproval.findMany({
      where: { status: 'pending' },
      orderBy: { requestedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        customerName: true,
        requestedAt: true,
        requestedByEmail: true,
      },
    });

    return NextResponse.json({
      count,
      items: recent,
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Failed to fetch pending notifications:', error);
    return NextResponse.json({ count: 0, items: [] });
  }
}
