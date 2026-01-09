
import { CustomerStatusClient } from "@/components/customers/CustomerStatusClient";

export default function RequestPinResetPage() {
  return (
    <div className="w-full space-y-8">
      <CustomerStatusClient action="Unblock" title="Request PIN Reset" description="Enter a CIF number to find a customer and request a PIN reset for their account." buttonLabel="Request Reset"/>
    </div>
  );
}
