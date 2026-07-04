import { CustomerStatusClient } from "@/components/customers/CustomerStatusClient";

export default function SuspendCustomerPage() {
  return (
    <div className="w-full space-y-8 animate-fade-up max-w-3xl">
      <CustomerStatusClient action="Suspend" />
    </div>
  );
}
