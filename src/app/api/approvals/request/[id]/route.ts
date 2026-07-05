
import { NextResponse } from 'next/server';
import { requireAuthenticatedSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/approvals/request/[id]
 * Allows a Maker to cancel their own pending request before checker approval.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  const requestId = parseInt(params.id, 10);

  if (isNaN(requestId)) {
    return NextResponse.json({ message: 'Invalid Request ID' }, { status: 400 });
  }

  try {
    const existingRequest = await db.pendingApproval.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    // Only PENDING requests can be cancelled
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { message: `Cannot cancel a request with status: ${existingRequest.status}` },
        { status: 409 }
      );
    }

    // Only the original maker can cancel their own request
    const sessionEmail = (session as any).user?.email;
    if (existingRequest.requestedByEmail && existingRequest.requestedByEmail !== sessionEmail) {
      return NextResponse.json(
        { message: 'You can only cancel your own pending requests' },
        { status: 403 }
      );
    }

    // Update status to CANCELLED
    await db.pendingApproval.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' },
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
