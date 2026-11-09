import { CustomerStatusClient } from "@/components/customers/CustomerStatusClient";

export default function UnsuspendCustomerPage() {
  return (
    <div className="w-full animate-fade-up">
      <CustomerStatusClient action="Unsuspend" />
    </div>
  );
}
