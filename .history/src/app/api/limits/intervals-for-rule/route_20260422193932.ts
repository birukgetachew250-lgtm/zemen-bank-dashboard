import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

export async function GET(req: Request) {
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
