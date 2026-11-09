import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  const session = await requirePermission(PERMISSIONS.APPROVALS_ACTION);
  if (session instanceof NextResponse) return session;

  try {
    const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

    const recentAll = await prisma.pendingApproval.findMany({
      where: {
        status: 'pending',
        requestedAt: { gte: sevenDaysAgo },
      },
      orderBy: { requestedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        type: true,
        customerName: true,
        requestedAt: true,
        requestedByEmail: true,
      },
    });

    const activeItems = recentAll.filter(
      (item: any) =>
        item.type !== 'reset-security-questions' && item.type !== 'security-reset'
    );

    return NextResponse.json(
      {
        count: activeItems.length,
        items: activeItems.slice(0, 5),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (error) {
    console.error('Failed to fetch pending notifications:', error);
    return NextResponse.json({ count: 0, items: [] });
  }
}
