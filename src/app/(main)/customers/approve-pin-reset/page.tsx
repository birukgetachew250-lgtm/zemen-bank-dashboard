
import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApprovePinResetPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="pin-reset" pageTitle="Approve PIN Resets" />
    </div>
  );
}
