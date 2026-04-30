export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { executeQuery } from '@/lib/oracle-db';
import { ChargeTierFormClient } from '@/components/charges/ChargeTierFormClient';

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

async function getNextDisplayOrder(chargeRuleId: string): Promise<number> {
  const query = `
    SELECT NVL(MAX("DisplayOrder"), 0) + 1 as "nextOrder"
    FROM "LIMIT_CHARGE_MODULE"."ChargeTiers"
    WHERE "ChargeRuleId" = :id
      AND "IsActive" = 1
  `;

  const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, [chargeRuleId]);
  const value = result.rows?.[0]?.nextOrder ?? result.rows?.[0]?.NEXTORDER;
  return Number(value || 1);
}

export default async function NewChargeTierPage({ params }: Props) {
  const [rule, nextOrder] = await Promise.all([
    getChargeRuleById(params.id),
    getNextDisplayOrder(params.id),
  ]);

  if (!rule) {
    notFound();
  }

  const ruleLabel = rule.serviceName ? `Tiers for ${rule.serviceName}` : `Tiers for Rule ${params.id}`;

  return (
    <div className="w-full h-full">
      <ChargeTierFormClient
        mode="create"
        chargeRuleId={params.id}
        chargeRuleLabel={ruleLabel}
        defaultDisplayOrder={nextOrder}
      />
    </div>
  );
}
