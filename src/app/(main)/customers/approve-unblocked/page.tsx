import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveUnblockedPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="unsuspend-customer" pageTitle="Approve Unsuspended Customers" />
    </div>
  );
}
