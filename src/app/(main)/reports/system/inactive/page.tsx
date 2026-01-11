
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { decrypt } from "@/lib/crypto";

const mockInactiveCustomers = [
    { id: 'user_0061234', name: 'Sara Connor', phone: '+251911123456', status: 'Inactive', registeredAt: '25 Jul 2024, 08:00 AM' },
    { id: 'user_0078901', name: 'Kyle Reese', phone: '+251911654321', status: 'Dormant', registeredAt: '24 Jul 2024, 09:00 AM' },
];


async function getCustomers() {
  try {
    const data = await db.appUser.findMany({
      where: { 
        OR: [
          { Status: 'Inactive' },
          { Status: 'Dormant' }
        ]
      },
      orderBy: { InsertDate: 'desc' }
    });

    if (!data) return mockInactiveCustomers;

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
    console.error("Failed to fetch inactive customers:", error);
    return mockInactiveCustomers;
  }
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
