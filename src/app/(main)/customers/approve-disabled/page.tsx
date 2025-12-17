import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveDisabledPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="disabled-customer" pageTitle="Approve Disabled Customers" />
    </div>
  );
}
