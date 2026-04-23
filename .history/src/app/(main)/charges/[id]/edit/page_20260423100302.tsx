export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ChargeRuleFormClient } from '@/components/charges/ChargeRuleFormClient';
import { executeQuery } from '@/lib/oracle-db';

interface Props {
  params: {
    id: string;
  };
}

async function getDropdownData() {
  try {
    const categoriesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      'SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."CustomerCategories" ORDER BY "Name"'
    );
    const typesResult: any = await executeQuery(
      process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
      'SELECT "Id", "Name" FROM "LIMIT_CHARGE_MODULE"."TransactionTypes" ORDER BY "Name"'
    );

    const customerCategories = categoriesResult.rows.map((row: any) => ({ id: row.Id, name: row.Name })) || [];
    const transactionTypes = typesResult.rows.map((row: any) => ({ id: row.Id, name: row.Name })) || [];

    return { customerCategories, transactionTypes };
  } catch (error) {
    console.error('Failed to fetch dropdowns for charge rule form:', error);
    return { customerCategories: [], transactionTypes: [] };
  }
}

async function getChargeRuleById(id: string) {
  const query = `
    SELECT
      "Id" as "id",
      "CustomerCategoryId" as "customerCategoryId",
      "TransactionTypeId" as "transactionTypeId",
      "ServiceName" as "serviceName",
      "ChargeType" as "chargeType",
      "Percentage" as "percentage",
      "FixedAmount" as "fixedAmount",
      "VatPercentage" as "vatPercentage",
      "MinCharge" as "minCharge",
      "MaxCharge" as "maxCharge",
      "EffectiveFrom" as "effectiveFrom",
      "EffectiveTo" as "effectiveTo"
    FROM "LIMIT_CHARGE_MODULE"."ChargeRules"
    WHERE "Id" = :id
      AND "IsActive" = 1
  `;

  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, [id]);
  const row = result.rows?.[0];
  if (!row) return null;

  return {
    id: row.id,
    customerCategoryId: row.customerCategoryId,
    transactionTypeId: row.transactionTypeId,
    serviceName: row.serviceName,
    chargeType: row.chargeType || 'FLAT',
    percentage: row.percentage || 0,
    fixedAmount: row.fixedAmount || 0,
    vatPercentage: row.vatPercentage ?? 15,
    minCharge: row.minCharge,
    maxCharge: row.maxCharge,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
  };
}

export default async function EditTransactionChargePage({ params }: Props) {
  const [rule, dropdowns] = await Promise.all([getChargeRuleById(params.id), getDropdownData()]);
  if (!rule) {
    notFound();
  }

  return (
    <div className="w-full h-full">
      <ChargeRuleFormClient
        mode="edit"
        initialRule={rule}
        customerCategories={dropdowns.customerCategories}
        transactionTypes={dropdowns.transactionTypes}
      />
    </div>
  );
}
