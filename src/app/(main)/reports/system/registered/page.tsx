
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";

async function getCustomers() {
  const data = db.prepare("SELECT id, name, phone, status, registeredAt FROM customers WHERE status = 'registered' ORDER BY registeredAt DESC").all();
   return data.map(customer => ({
    ...customer,
    registeredAt: format(new Date(customer.registeredAt), 'dd MMM yyyy, h:mm a'),
  }));
}

export default async function RegisteredCustomersReportPage() {
  const customers = await getCustomers();
  
  return (
    <div className="w-full h-full">
      <CustomerTable 
          title="Registered Customers Report" 
          customers={customers} 
          showExport
      />
    </div>
  )
}
