
'use server';

import { NextResponse } from 'next/server';
import { requireAuthenticatedSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';

/**
 * DELETE /api/approvals/request/[id]
 * Allows a Maker Admin to cancel their own pending request before checker approval.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  const requestId = params.id;
  const userId = (session as any).user?.id || (session as any).userId;

  if (!requestId) {
    return NextResponse.json({ message: 'Request ID is required' }, { status: 400 });
  }

  try {
    // Find the request in the database
    const existingRequest = await (db as any).approvalRequest?.findUnique?.({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    // Only the original maker can cancel; only PENDING requests can be cancelled
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { message: `Cannot cancel a request with status: ${existingRequest.status}` },
        { status: 409 }
      );
    }

    if (existingRequest.requestedById && existingRequest.requestedById !== userId) {
      return NextResponse.json(
        { message: 'You can only cancel your own pending requests' },
        { status: 403 }
      );
    }

    // Update status to CANCELLED
    await (db as any).approvalRequest?.update?.({
      where: { id: requestId },
      data: {
        status: 'CANCELLED',
        resolvedAt: new Date(),
        resolvedBy: userId,
        rejectionReason: 'Cancelled by maker before approval',
      },
    });

    return NextResponse.json({ message: 'Request cancelled successfully' });
  } catch (e: any) {
    console.error('[CancelRequest] Error:', e);
    return NextResponse.json(
      { message: 'Failed to cancel request. Please try again.' },
      { status: 500 }
    );
  }
}
