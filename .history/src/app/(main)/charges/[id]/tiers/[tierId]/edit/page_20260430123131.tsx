export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { executeQuery } from '@/lib/oracle-db';
import { ChargeTierFormClient } from '@/components/charges/ChargeTierFormClient';

interface Props {
  params: {
    id: string;
    tierId: string;
  };
}

async function getChargeRuleById(id: string) {
  const query = `
    SELECT
      "Id" as "id",
      "ServiceName" as "serviceName"
    FROM "LIMIT_CHARGE_MODULE"."ChargeRules"
    WHERE "Id" = :id
      AND "IsActive" = 1
  `;

  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, [id]);
  return result.rows?.[0] || null;
}

async function getTierById(chargeRuleId: string, tierId: string) {
  const query = `
    SELECT
      "Id" as "id",
      "TierName" as "tierName",
      "AmountFrom" as "amountFrom",
      "AmountTo" as "amountTo",
      "Percentage" as "percentage",
      "FixedAmount" as "fixedAmount",
      "VatPercentage" as "vatPercentage",
      "MinCharge" as "minCharge",
      "MaxCharge" as "maxCharge",
      "DisplayOrder" as "displayOrder"
    FROM "LIMIT_CHARGE_MODULE"."ChargeTiers"
    WHERE "Id" = :tierId
      AND "ChargeRuleId" = :chargeRuleId
      AND "IsActive" = 1
  `;

  const result: any = await executeQuery(
    process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING,
    query,
    { tierId, chargeRuleId }
  );

  return result.rows?.[0] || null;
}

export default async function EditChargeTierPage({ params }: Props) {
  const [rule, tier] = await Promise.all([
    getChargeRuleById(params.id),
    getTierById(params.id, params.tierId),
  ]);

  if (!rule || !tier) {
    notFound();
  }

  const ruleLabel = rule.serviceName ? `Tiers for ${rule.serviceName}` : `Tiers for Rule ${params.id}`;

  return (
    <div className="w-full h-full">
      <ChargeTierFormClient
        mode="edit"
        chargeRuleId={params.id}
        chargeRuleLabel={ruleLabel}
        initialData={tier}
      />
    </div>
  );
}
