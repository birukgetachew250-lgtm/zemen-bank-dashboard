import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveTransactionPinPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="transaction-pin" pageTitle="Approve Transaction Pin" />
    </div>
  );
}
