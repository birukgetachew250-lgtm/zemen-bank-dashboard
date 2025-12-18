
import { CustomerStatusClient } from "@/components/customers/CustomerStatusClient";

export default function BlockCustomerPage() {
  return (
    <div className="w-full space-y-8">
      <CustomerStatusClient action="Block" />
    </div>
  );
}
