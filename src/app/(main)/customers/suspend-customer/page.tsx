import { CustomerStatusClient } from "@/components/customers/CustomerStatusClient";

export default function SuspendCustomerPage() {
  return (
    <div className="w-full animate-fade-up">
      <CustomerStatusClient action="Suspend" />
    </div>
  );
}
