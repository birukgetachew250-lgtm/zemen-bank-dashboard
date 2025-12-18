
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";
import config from "@/lib/config";

async function getCustomers() {
  if (config.db.isProduction) {
    throw new Error("Production database not connected for Incomplete Registrations Report.");
  }
  // This is a placeholder. In a real app, you would query for incomplete registrations.
  // For now, we'll return an empty array.
  const data = db.prepare("SELECT id, name, phone, status, registeredAt FROM customers WHERE status = 'incomplete' ORDER BY registeredAt DESC").all();
   return data.map(customer => ({
    ...customer,
    registeredAt: format(new Date(customer.registeredAt), 'dd MMM yyyy, h:mm a'),
  }));
}

export default async function IncompleteRegistrationsReportPage() {
  const customers = await getCustomers();
  
  return (
    <div className="w-full h-full">
      <CustomerTable 
          title="Incomplete Registrations Report" 
          customers={customers} 
          showExport
      />
    </div>
  )
}
