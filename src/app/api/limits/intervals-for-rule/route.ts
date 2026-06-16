import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(req: Request) {
  const _authSession = await requirePermission(PERMISSIONS.LIMITS_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;
    try {
        const { searchParams } = new URL(req.url);
        const ruleId = searchParams.get('ruleId');
        
        if (!ruleId) {
            return NextResponse.json({ message: 'ruleId is required' }, { status: 400 });
        }

        const query = `
            SELECT "Id" as "id", "PeriodIntervalId" as "periodIntervalId", "LimitAmount" as "limitAmount", "Currency" as "currency"
            FROM "LIMIT_CHARGE_MODULE"."LimitRuleIntervals"
            WHERE "LimitRuleId" = :RuleId
        `;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { RuleId: ruleId });
        return NextResponse.json(result.rows || []);
    } catch (error) {
        console.error('Failed to fetch intervals for rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
