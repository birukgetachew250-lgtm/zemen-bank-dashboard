
import { CustomerTable } from "@/components/customers/CustomerTable";
import { executeQuery } from "@/lib/oracle-db";
import { format } from "date-fns";
import { decrypt } from "@/lib/crypto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockInactiveCustomers = [
    { id: 'user_0061234', name: 'Sara Connor', phone: '+251911123456', status: 'Inactive', registeredAt: '25 Jul 2024, 08:00 AM' },
    { id: 'user_0078901', name: 'Kyle Reese', phone: '+251911654321', status: 'Dormant', registeredAt: '24 Jul 2024, 09:00 AM' },
];


async function getCustomers(channel: 'mobile' | 'ussd') {
  if (!process.env.USER_MODULE_DB_CONNECTION_STRING) {
    console.warn("USER_MODULE_DB_CONNECTION_STRING not set, returning mock data for inactive customers.");
    return mockInactiveCustomers;
  }
  try {
    const statusCol = channel === 'mobile' ? 'MobileStatus' : 'UssdStatus';
    const query = `SELECT * FROM "USER_MODULE"."AppUsers" WHERE "${statusCol}" IN ('InActive', 'Suspended') ORDER BY "InsertDate" DESC`;
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
        status: customer[statusCol],
        registeredAt: format(new Date(customer.InsertDate), 'dd MMM yyyy, h:mm a'),
      };
    });
  } catch (error) {
    console.error("Failed to fetch inactive customers:", error);
    return mockInactiveCustomers;
  }
}

export default async function InactiveCustomersReportPage() {
  const mobileCustomers = await getCustomers('mobile');
  const ussdCustomers = await getCustomers('ussd');
  
  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inactive & Dormant Customers Report</h1>
      </div>
      
      <Tabs defaultValue="mobile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="mobile">Mobile App</TabsTrigger>
          <TabsTrigger value="ussd">USSD</TabsTrigger>
        </TabsList>
        <TabsContent value="mobile">
          <CustomerTable 
              title="Inactive Customers (Mobile)" 
              customers={mobileCustomers} 
              showExport
          />
        </TabsContent>
        <TabsContent value="ussd">
          <CustomerTable 
              title="Inactive Customers (USSD)" 
              customers={ussdCustomers} 
              showExport
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
