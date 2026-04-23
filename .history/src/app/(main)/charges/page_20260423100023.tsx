
export const dynamic = 'force-dynamic';

import { ChargeManagementClient } from "@/components/charges/ChargeManagementClient";
import type { ChargeRule } from "@/components/charges/ChargeManagementClient";
import { executeQuery } from "@/lib/oracle-db";

async function getChargeRules(): Promise<ChargeRule[]> {
  try {
    const query = `
      SELECT 
        cr."Id" as "id",
        cr."CustomerCategoryId" as "customerCategoryId",
        cr."TransactionTypeId" as "transactionTypeId",
        cc."Name" as "category",
        tt."Name" as "transactionType",
        cr."ServiceName" as "serviceName",
        cr."ChargeType" as "chargeType",
        cr."Percentage" as "percentage",
        cr."FixedAmount" as "fixedAmount",
        cr."VatPercentage" as "vatPercentage",
        cr."MinCharge" as "minCharge",
        cr."MaxCharge" as "maxCharge",
        cr."EffectiveFrom" as "effectiveFrom",
        cr."EffectiveTo" as "effectiveTo"
      FROM "LIMIT_CHARGE_MODULE"."ChargeRules" cr
      LEFT JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cc ON cr."CustomerCategoryId" = cc."Id"
      LEFT JOIN "LIMIT_CHARGE_MODULE"."TransactionTypes" tt ON cr."TransactionTypeId" = tt."Id"
      WHERE cr."IsActive" = 1 
      ORDER BY cc."Name", tt."Name"
    `;
    const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
    
    if (!result.rows) {
        return [];
    }
    
    return result.rows.map((row: any) => ({
      id: row.id,
      customerCategoryId: row.customerCategoryId,
      transactionTypeId: row.transactionTypeId,
      category: row.category || 'All Categories',
      transactionType: row.transactionType || 'All Types',
      serviceName: row.serviceName,
      chargeType: row.chargeType || 'FLAT',
      percentage: row.percentage,
      fixedAmount: row.fixedAmount,
      vatPercentage: row.vatPercentage,
      minCharge: row.minCharge,
      maxCharge: row.maxCharge,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
    }));
  } catch (error) {
    console.error("Failed to fetch charge rules:", error);
    return [];
  }
}


export default async function TransactionChargesPage() {
    const chargeRules = await getChargeRules();
    
    return (
        <div className="w-full h-full">
        <ChargeManagementClient initialChargeRules={chargeRules} />
        </div>
    );
}
