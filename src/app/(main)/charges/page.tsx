
import { ChargeManagementClient } from "@/components/charges/ChargeManagementClient";
import type { ChargeRule } from "@/components/charges/ChargeManagementClient";
import { executeQuery } from "@/lib/oracle-db";

async function getChargeRules(): Promise<ChargeRule[]> {
  try {
    const query = `
      SELECT 
        cr.Id as "id",
        cc.Name as "category",
        tt.Name as "transactionType",
        cr.Percentage as "percentage",
        cr.FixedAmount as "fixedAmount"
      FROM "LIMIT_CHARGE_MODULE"."ChargeRules" cr
      JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON cr.CustomerCategoryId = cc.Id
      JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON cr.TransactionTypeId = tt.Id
      WHERE cr.IsActive = 1 
      ORDER BY cc.Name, tt.Name
    `;
    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    
    if (!result.rows) {
        return [];
    }
    
    return result.rows.map((row: any) => ({
      id: row.id,
      category: row.category,
      transactionType: row.transactionType,
      chargeType: row.fixedAmount > 0 ? 'Fixed' : 'Percentage',
      value: row.fixedAmount > 0 ? row.fixedAmount : row.percentage,
    }));
  } catch (error) {
    console.error("Failed to fetch charge rules:", error);
    return [];
  }
}

async function getDropdownData() {
    try {
        const categoriesResult: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" ORDER BY "Name"`);
        const typesResult: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, `SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" ORDER BY "Name"`);
        
        const categories = categoriesResult.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];
        const transactionTypes = typesResult.rows.map((r: any) => ({ id: r.Id, name: r.Name })) || [];
        
        return { categories, transactionTypes };
    } catch (error) {
        console.error("Failed to fetch dropdown data for charges:", error);
        return { categories: [], transactionTypes: [] };
    }
}


export default async function TransactionChargesPage() {
    const chargeRules = await getChargeRules();
    const { categories, transactionTypes } = await getDropdownData();
    
    return (
        <div className="w-full h-full">
            <ChargeManagementClient 
                initialChargeRules={chargeRules} 
                customerCategories={categories}
                transactionTypes={transactionTypes}
            />
        </div>
    );
}

