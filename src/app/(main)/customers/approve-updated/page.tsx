import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveUpdatedCustomersPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="updated-customer" pageTitle="Approve Updated Customers" />
    </div>
  );
}
