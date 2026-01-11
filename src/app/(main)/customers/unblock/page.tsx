
import { CustomerStatusClient } from "@/components/customers/CustomerStatusClient";

export default function UnblockCustomerPage() {
  return (
    <div className="w-full space-y-8">
      <CustomerStatusClient action="Unsuspend" />
    </div>
  );
}

