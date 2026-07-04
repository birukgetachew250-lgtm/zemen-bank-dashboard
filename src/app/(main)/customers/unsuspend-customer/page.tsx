import { CustomerStatusClient } from "@/components/customers/CustomerStatusClient";

export default function UnsuspendCustomerPage() {
  return (
    <div className="w-full space-y-8 animate-fade-up max-w-3xl">
      <CustomerStatusClient action="Unsuspend" />
    </div>
  );
}
