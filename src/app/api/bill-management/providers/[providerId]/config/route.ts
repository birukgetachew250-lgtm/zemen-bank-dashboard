
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
const SCHEMA = "APP_CONTROL_MODULE";

export async function GET(req: Request, { params }: { params: { providerId: string } }) {
  const _authSession = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;

    const { providerId } = params;

    try {
        const queries = {
            fields: `SELECT * FROM "${SCHEMA}"."BillFormField" WHERE "ProviderId" = :providerId ORDER BY "StepNumber", "FieldOrder" ASC`,
            steps: `SELECT * FROM "${SCHEMA}"."BillFlowStep" WHERE "ProviderId" = :providerId ORDER BY "StepOrder" ASC`,
            api: `SELECT * FROM "${SCHEMA}"."BillApiConfig" WHERE "ProviderId" = :providerId ORDER BY "ExecutionOrder" ASC`,
            display: `SELECT * FROM "${SCHEMA}"."BillDisplayField" WHERE "ProviderId" = :providerId ORDER BY "ScreenType", "DisplayOrder" ASC`,
        };

        const results = await Promise.all(
            Object.entries(queries).map(async ([key, query]) => {
                const res: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { providerId });
                return [key, res.rows || []];
            })
        );

        return NextResponse.json(Object.fromEntries(results));
    } catch (error: any) {
        console.error(`Failed to fetch full config for provider ${providerId}:`, error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
