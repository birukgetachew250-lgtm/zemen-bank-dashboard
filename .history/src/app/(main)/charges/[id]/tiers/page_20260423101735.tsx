export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { executeQuery } from '@/lib/oracle-db';
import { ChargeTierManagementClient } from '@/components/charges/ChargeTierManagementClient';

interface Props {
  params: {
    id: string;
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

async function getTiersByRuleId(chargeRuleId: string) {
  const query = `
    SELECT
      "Id" as "id",
      "ChargeRuleId" as "chargeRuleId",
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
    WHERE "ChargeRuleId" = :id
    ORDER BY "DisplayOrder" ASC, "AmountFrom" ASC
  `;

  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, [chargeRuleId]);
  return result.rows || [];
}

export default async function ChargeTiersPage({ params }: Props) {
  const [rule, tiers] = await Promise.all([getChargeRuleById(params.id), getTiersByRuleId(params.id)]);

  if (!rule) {
    notFound();
  }

  const ruleLabel = rule.serviceName ? `Tiers for ${rule.serviceName}` : `Tiers for Rule ${params.id}`;

  return (
    <div className="w-full h-full">
      <ChargeTierManagementClient
        chargeRuleId={params.id}
        chargeRuleLabel={ruleLabel}
        initialTiers={tiers}
      />
    </div>
  );
}
