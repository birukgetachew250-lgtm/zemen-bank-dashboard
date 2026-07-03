
import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveUnlockPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="unlock-customer" pageTitle="Approve Unlock Customer" />
    </div>
  );
}
