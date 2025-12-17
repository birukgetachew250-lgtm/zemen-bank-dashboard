import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveAccountsPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="customer-account" pageTitle="Approve Customer Accounts" />
    </div>
  );
}
