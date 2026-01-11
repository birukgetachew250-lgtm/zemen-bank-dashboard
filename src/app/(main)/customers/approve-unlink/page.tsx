
import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveUnlinkPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="unlink-account" pageTitle="Approve Unlink Account Requests" />
    </div>
  );
}
