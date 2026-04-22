import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveResendActivationCodePage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="resend-activation-code" pageTitle="Approve Resend Activation Code" />
    </div>
  );
}
