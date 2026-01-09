
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { decrypt } from "@/lib/crypto";

async function getCustomers() {
  const data = await db.appUser.findMany({
    where: { 
      OR: [
        { Status: 'Inactive' },
        { Status: 'Dormant' }
      ]
    },
    orderBy: { InsertDate: 'desc' }
  });

  if (!data) return [];

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
}

export default async function InactiveCustomersReportPage() {
  const customers = await getCustomers();
  
  return (
    <div className="w-full h-full">
      <CustomerTable 
          title="Inactive & Dormant Customers Report" 
          customers={customers} 
          showExport
      />
    </div>
  )
}
