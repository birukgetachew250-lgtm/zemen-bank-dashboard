
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { decrypt } from "@/lib/crypto";

const mockActiveCustomers = [
  { id: 'user_0005995', name: 'John Adebayo Doe', phone: '+2348012345678', status: 'Active', registeredAt: '28 Jul 2024, 10:30 AM' },
  { id: 'user_0052347', name: 'Jane Smith', phone: '+2348012345679', status: 'Active', registeredAt: '28 Jul 2024, 10:25 AM' },
  { id: 'user_0048533', name: 'AKALEWORK TAMENE KEBEDE', phone: '+251911223345', status: 'Active', registeredAt: '28 Jul 2024, 10:20 AM' },
];

async function getCustomers() {
  try {
    const data = await db.appUser.findMany({
      where: { Status: 'Active' },
      orderBy: { InsertDate: 'desc' }
    });
    
    if (!data) return mockActiveCustomers;

    return data.map((customer: any) => {
      const firstName = decrypt(customer.FirstName);
      const secondName = decrypt(customer.SecondName);
      const lastName = decrypt(customer.LastName);
      
      return {
        id: customer.Id,
        name: [firstName, secondName, lastName].filter(Boolean).join(' '),
        phone: decrypt(customer.PhoneNumber),
        status: customer.Status,
        registeredAt: format(new Date(customer.InsertDate), 'dd MMM yyyy, h:mm a'),
      };
    });
  } catch (error) {
    console.error("Failed to fetch active customers:", error);
    return mockActiveCustomers;
  }
}

export default async function ActiveCustomersReportPage() {
  const customers = await getCustomers();
  
  return (
    <div className="w-full h-full">
      <CustomerTable 
          title="Active Customers Report" 
          customers={customers} 
          showExport
      />
    </div>
  )
}
