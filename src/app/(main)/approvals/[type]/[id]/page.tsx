import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ApprovalDetailClient } from "@/components/approvals/ApprovalDetailClient";

export default async function ApprovalDetailPage({
  params,
}: {
  params: { type: string; id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const approvalId = parseInt(params.id, 10);
  if (isNaN(approvalId)) {
    notFound();
  }

  const approval = await db.pendingApproval.findUnique({
    where: { id: approvalId },
  });

  if (!approval) {
    notFound();
  }

  let parsedDetails: any = null;
  if (approval.details) {
    try {
      parsedDetails = JSON.parse(approval.details);
    } catch {}
  }

  const formattedApproval = {
    id: String(approval.id),
    type: approval.type,
    customerName: approval.customerName,
    customerPhone: approval.customerPhone,
    requestedAt: approval.requestedAt.toISOString(),
    status: approval.status,
    submittedBy: approval.requestedByEmail,
    attachmentUrl: approval.attachmentUrl || null,
    checkerRemarks: approval.checkerRemarks || null,
    details: parsedDetails,
    documents: parsedDetails?.documents || [],
  };

  return <ApprovalDetailClient approval={formattedApproval} />;
}
