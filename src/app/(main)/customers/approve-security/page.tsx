import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveSecurityPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="reset-security-questions" pageTitle="Approve Reset Security Questions" />
    </div>
  );
}
