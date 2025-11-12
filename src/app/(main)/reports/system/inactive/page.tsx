
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";

async function getCustomers() {
  const data = db.prepare("SELECT id, name, phone, status, registeredAt FROM customers WHERE status = 'inactive' ORDER BY registeredAt DESC").all();
  return data.map(customer => ({
    ...customer,
    registeredAt: format(new Date(customer.registeredAt), 'dd MMM yyyy, h:mm a'),
  }));
}

export default async function InactiveCustomersReportPage() {
  const customers = await getCustomers();
  
  return (
      <CustomerTable 
          title="Inactive Customers Report" 
          customers={customers} 
      />
  )
}
