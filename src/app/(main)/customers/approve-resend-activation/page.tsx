import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveSendActivationPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="resend-activation-code" pageTitle="Approve Send Activation" />
    </div>
  );
}
