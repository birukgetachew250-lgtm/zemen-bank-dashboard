
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";

const mockRegisteredCustomers = [
    { id: 'cust-123', name: 'Samson Tsegaye', phone: '+251911223344', status: 'Registered', registeredAt: '29 Jul 2024, 11:00 AM' },
];

async function getCustomers() {
  try {
    const data = await db.customer.findMany({
      where: { status: 'Registered' },
      orderBy: { registeredAt: 'desc' }
    });
    if (data.length === 0) return mockRegisteredCustomers;
    return data.map(customer => ({
      ...customer,
      registeredAt: format(new Date(customer.registeredAt), 'dd MMM yyyy, h:mm a'),
    }));
  } catch(error) {
    console.error("Failed to fetch registered customers:", error);
    return mockRegisteredCustomers;
  }
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
