import { NextResponse } from 'next/server';
import { requireAuthenticatedSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/approvals/request/[id]
 * Allows a Maker (or Super Admin) to cancel any pending request before checker approval.
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
    if (existingRequest.status?.toUpperCase() !== 'PENDING') {
      return NextResponse.json(
        { message: `Cannot cancel a request with status: ${existingRequest.status}` },
        { status: 409 }
      );
    }

    const sessionEmail = String((session as any).user?.email || '')
      .trim()
      .toLowerCase();
    const userRole = String((session as any).user?.role || '').trim();
    const isSuperAdmin = userRole === 'Super Admin';

    let parsedDetails: Record<string, any> = {};
    try {
      if (existingRequest.details) {
        parsedDetails = JSON.parse(existingRequest.details);
      }
    } catch {}

    const recordedOwner = String(
      existingRequest.requestedByEmail ||
        parsedDetails?.requestContext?.requesterEmail ||
        ''
    )
      .trim()
      .toLowerCase();

    if (recordedOwner && recordedOwner !== sessionEmail && !isSuperAdmin) {
      return NextResponse.json(
        { message: 'You can only cancel pending requests that you submitted.' },
        { status: 403 }
      );
    }

    parsedDetails.cancelledBy = sessionEmail;
    parsedDetails.cancelledAt = new Date().toISOString();

    await db.pendingApproval.update({
      where: { id: requestId },
      data: {
        status: 'cancelled',
        details: JSON.stringify(parsedDetails),
      },
    });

    await logActivity({
      userEmail: sessionEmail || 'system',
      action: 'CUSTOMER_UPDATE_REQUESTED',
      status: 'Success',
      details: `Maker cancelled pending request ID ${requestId} (type: ${existingRequest.type}, customer: ${existingRequest.customerName}).`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (e: any) {
    console.error('[CancelRequest] Error:', e);
    return NextResponse.json(
      { message: 'Failed to cancel request. Please try again.' },
      { status: 500 }
    );
  }
}
