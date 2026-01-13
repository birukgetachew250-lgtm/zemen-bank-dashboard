
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { executeQuery } from '@/lib/oracle-db';


async function getCustomerStats() {
  try {
    const totalResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."AppUsers"`);
    const activeResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."AppUsers" WHERE "Status" = 'Active'`);
    const linkedAccountsResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."Accounts"`);
    
    const total = totalResult.rows[0]?.COUNT || 0;
    const active = activeResult.rows[0]?.COUNT || 0;
    const linkedAccounts = linkedAccountsResult.rows[0]?.COUNT || 0;

    const inactiveResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."AppUsers" WHERE "Status" = 'Inactive' OR "Status" = 'Dormant'`);
    const inactiveAndDormant = inactiveResult.rows[0]?.COUNT || 0;
    
    const registeredResult: any = await executeQuery(process.env.USER_MODULE_DB_CONNECTION_STRING, `SELECT COUNT(*) as count FROM "USER_MODULE"."AppUsers" WHERE "Status" = 'Registered'`);
    const registered = registeredResult.rows[0]?.COUNT || 0;


    return { total, active, inactive: inactiveAndDormant, registered: registered, linkedAccounts };

  } catch (e: any) {
    console.error("Failed to fetch customer stats:", e);
    
    if (e.message.includes('NJS-530')) {
        throw new Error(`Failed to connect to the Oracle database. Please ensure the USER_MODULE_DB_CONNECTION_STRING in your .env file is correct and the database is accessible.`);
    }
    
    throw new Error(`Failed to fetch stats from the database: ${e.message}`);
  }
}

function getDatesFromRange(range: string): { from: Date, to: Date } {
    const now = new Date();
    const to = endOfDay(now);

    switch (range) {
        case '7d':
            return { from: startOfDay(subDays(now, 6)), to };
        case '30d':
            return { from: startOfDay(subDays(now, 29)), to };
        case '90d':
            return { from: startOfDay(subDays(now, 89)), to };
        case 'today':
        default:
            return { from: startOfDay(now), to };
    }
}

export async function GET(
    req: Request,
    { params }: { params: { slug: string[] } }
) {
    const slug = params.slug.join('/');
    const { searchParams } = new URL(req.url);

    if (slug === 'transactions') {
        try {
            const range = searchParams.get('range') || 'today';
            const { from, to } = getDatesFromRange(range);
            
            const whereClause = {
                timestamp: {
                    gte: from,
                    lte: to,
                },
            };

            const total = await db.transaction.count({ where: whereClause });
            const successful = await db.transaction.count({ where: { ...whereClause, status: 'Successful' } });
            const failed = await db.transaction.count({ where: { ...whereClause, status: 'Failed' } });
            
            return NextResponse.json({ total, successful, failed });

        } catch (error) {
            console.error('Failed to fetch transaction stats:', error);
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
    }
    
    if (slug === 'customers') {
       try {
        const stats = await getCustomerStats();
        return NextResponse.json(stats);
      } catch (e: any) {
        console.error("Dashboard database error:", e.message);
        return NextResponse.json({ message: e.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}
