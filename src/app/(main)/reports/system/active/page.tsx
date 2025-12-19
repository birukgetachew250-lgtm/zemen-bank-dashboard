
import { CustomerTable } from "@/components/customers/CustomerTable";
import { db } from "@/lib/db";
import { format } from "date-fns";
import config from "@/lib/config";
import { decrypt } from "@/lib/crypto";

async function getCustomers() {
  let data;
  if (config.db.isProduction) {
    data = await db.prepare('SELECT "Id", "CIFNumber", "FirstName", "SecondName", "LastName", "PhoneNumber", "Status", "InsertDate" FROM "USER_MODULE"."AppUsers" WHERE "Status" = \'Active\' ORDER BY "InsertDate" DESC').all();
  } else {
    data = db.prepare("SELECT Id, CIFNumber, FirstName, SecondName, LastName, PhoneNumber, Status, InsertDate FROM AppUsers WHERE Status = 'Active' ORDER BY InsertDate DESC").all();
  }
  
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
