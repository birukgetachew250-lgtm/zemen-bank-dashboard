
export const dynamic = 'force-dynamic';

import { ChargeManagementClient } from "@/components/charges/ChargeManagementClient";
import type { ChargeRule } from "@/components/charges/ChargeManagementClient";
import { executeQuery } from "@/lib/oracle-db";

function quoteIdentifier(identifier: string): string {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
    throw new Error(`Unsafe identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

async function resolveDisasterRiskColumn(): Promise<string | null> {
  const sql = `
    SELECT "COLUMN_NAME"
    FROM "USER_TAB_COLUMNS"
    WHERE UPPER("TABLE_NAME") = 'CHARGERULES'
      AND UPPER("COLUMN_NAME") = 'DISASTERRISKPERCENTAGE'
  `;
  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, sql);
  const row = result.rows?.[0];
  if (!row || typeof row !== 'object') return null;
  return (row as any).COLUMN_NAME || (row as any).column_name || Object.values(row)[0] || null;
}

async function getChargeRules(): Promise<ChargeRule[]> {
  try {
    const disasterRiskColumn = await resolveDisasterRiskColumn();
    const disasterRiskSelect = disasterRiskColumn
      ? `cr.${quoteIdentifier(disasterRiskColumn)} as "disasterRiskPercentage"`
      : `NULL as "disasterRiskPercentage"`;

    const query = `
      SELECT 
        cr."Id" as "id",
        cr."CustomerCategoryId" as "customerCategoryId",
        (
          SELECT LISTAGG(map."CustomerCategoryId", ',') WITHIN GROUP (ORDER BY map."CustomerCategoryId")
          FROM "LIMIT_CHARGE_MODULE"."ChargeRuleCustomerCategories" map
          WHERE map."ChargeRuleId" = cr."Id"
        ) as "categoryIdsCsv",
        (
          SELECT LISTAGG(cat."Name", ', ') WITHIN GROUP (ORDER BY cat."Name")
          FROM "LIMIT_CHARGE_MODULE"."ChargeRuleCustomerCategories" map
          JOIN "LIMIT_CHARGE_MODULE"."CustomerCategories" cat ON map."CustomerCategoryId" = cat."Id"
          WHERE map."ChargeRuleId" = cr."Id"
        ) as "categories",
        cr."TransactionTypeId" as "transactionTypeId",
        cc."Name" as "category",
        tt."Name" as "transactionType",
        cr."ServiceName" as "serviceName",
        cr."ChargeType" as "chargeType",
        cr."Percentage" as "percentage",
        cr."FixedAmount" as "fixedAmount",
        cr."VatPercentage" as "vatPercentage",
        ${disasterRiskSelect},
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
      customerCategoryIds: row.categoryIdsCsv
        ? String(row.categoryIdsCsv)
            .split(',')
            .map((v: string) => v.trim())
            .filter(Boolean)
        : row.customerCategoryId
          ? [String(row.customerCategoryId)]
          : [],
      transactionTypeId: row.transactionTypeId,
      categories: row.categories || row.category || 'All Categories',
      transactionType: row.transactionType || 'All Types',
      serviceName: row.serviceName,
      chargeType: row.chargeType || 'FLAT',
      percentage: row.percentage,
      fixedAmount: row.fixedAmount,
      vatPercentage: row.vatPercentage,
      disasterRiskPercentage: row.disasterRiskPercentage ?? null,
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
