import { ApprovalClientPage } from "@/components/customers/ApprovalClientPage";

export default function ApproveDevicesPage() {
  return (
    <div className="w-full h-full">
      <ApprovalClientPage approvalType="new-device" pageTitle="Approve New Customer Devices" />
    </div>
  );
}
