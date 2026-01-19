
import { CustomerTable } from "@/components/customers/CustomerTable";
import { executeQuery } from "@/lib/oracle-db";
import { format } from "date-fns";
import { decrypt } from "@/lib/crypto";

const mockInactiveCustomers = [
    { id: 'user_0061234', name: 'Sara Connor', phone: '+251911123456', status: 'Inactive', registeredAt: '25 Jul 2024, 08:00 AM' },
    { id: 'user_0078901', name: 'Kyle Reese', phone: '+251911654321', status: 'Dormant', registeredAt: '24 Jul 2024, 09:00 AM' },
];


async function getCustomers() {
  if (!process.env.USER_MODULE_DB_CONNECTION_STRING) {
    console.warn("USER_MODULE_DB_CONNECTION_STRING not set, returning mock data for inactive customers.");
    return mockInactiveCustomers;
  }
  try {
    const query = `SELECT * FROM "USER_MODULE"."AppUsers" WHERE "Status" IN ('Inactive', 'Dormant') ORDER BY "InsertDate" DESC`;
    const result: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, query);

    if (!result.rows) return mockInactiveCustomers;

    return result.rows.map((customer: any) => {
      const firstName = decrypt(customer.FirstName);
      const secondName = decrypt(customer.SecondName);
      const lastName = decrypt(customer.LastName);
      
      return {
        id: customer.Id,
        name: [firstName, secondName, lastName].filter(Boolean).join(' '),
        phone: decrypt(customer.PhoneNumber) || '',
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
