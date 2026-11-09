import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-log';

export async function POST(req: Request) {
  const session = await requirePermission(PERMISSIONS.CUSTOMERS_CREATE);
  if (session instanceof NextResponse) return session;
  const sessionEmail = session.user?.email || '';

  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    const requester = await db.user.findUnique({
      where: { email: sessionEmail },
      select: { branch: true, email: true },
    });

    if (!requester) {
      return NextResponse.json({ message: 'Requester account not found' }, { status: 403 });
    }

    const { customer, accounts, onboardingData, documents } = await req.json();

    if (!customer || !customer.customer_number || !accounts || !onboardingData) {
      return NextResponse.json(
        { message: 'Incomplete customer, account, or onboarding data' },
        { status: 400 }
      );
    }

    let legacyCustomer = await db.customer.findFirst({
      where: { phone: customer.mobile_number },
    });

    if (!legacyCustomer) {
      legacyCustomer = await db.customer.create({
        data: {
          name: customer.full_name,
          phone: customer.mobile_number,
          status: 'Pending',
        },
      });
    }

    const normalizedDocuments = Array.isArray(documents)
      ? documents
      : Array.isArray(onboardingData?.documents)
      ? onboardingData.documents
      : [];

    const detailsForApproval = {
      cif: customer.customer_number,
      customerData: customer,
      linkedAccounts: accounts,
      onboardingData,
      documents: normalizedDocuments,
      requestContext: {
        requesterBranch: requester.branch || null,
        requesterEmail: requester.email,
      },
    };

    await db.pendingApproval.create({
      data: {
        customerId: legacyCustomer.id,
        type: 'new-customer',
        customerName: customer.full_name,
        customerPhone: customer.mobile_number,
        details: JSON.stringify(detailsForApproval),
        status: 'pending',
        requestedByEmail: requester.email,
      },
    });

    await logActivity({
      userEmail: sessionEmail,
      action: 'CUSTOMER_CREATE_REQUESTED',
      status: 'Success',
      details: `Submitted new customer onboarding approval for CIF ${customer.customer_number} (${customer.full_name}) with ${normalizedDocuments.length} KYC document(s).`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Customer registration submitted for approval',
    });
  } catch (error: any) {
    console.error('Failed to create approval request:', error);

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    await logActivity({
      userEmail: sessionEmail || 'system',
      action: 'CUSTOMER_CREATE_REQUESTED',
      status: 'Failure',
      details: `Failed to submit new customer onboarding approval. Error: ${
        error?.message || 'Unknown error'
      }`,
      ipAddress: typeof ip === 'string' ? ip : undefined,
    });

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
