
import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveSuspensionPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="suspend-customer" pageTitle="Approve Suspended Customers" />
    </div>
  );
}
