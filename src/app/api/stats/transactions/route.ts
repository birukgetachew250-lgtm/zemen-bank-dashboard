import { NextResponse } from 'next/server';
import { tryOracleQuery } from '@/lib/oracle-db-check';

export const dynamic = 'force-dynamic';

const TYPES = ['Transfer', 'Bill Payment', 'Top Up', 'Withdrawal', 'Deposit'];
const STATUSES = ['Success', 'Success', 'Success', 'Failed', 'Pending'];
const CHANNELS = ['Mobile', 'USSD', 'Agent', 'Web'];

function generateDemoTxData(days = 30) {
  return Array.from({ length: Math.min(days * 8, 200) }, (_, i) => ({
    id: `TXN-${String(i + 1).padStart(6, '0')}`,
    amount: Math.round((500 + Math.random() * 49500) * 100) / 100,
    fee: Math.round(Math.random() * 50 * 100) / 100,
    type: TYPES[i % TYPES.length],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
    date: new Date(Date.now() - Math.random() * days * 86400000).toISOString(),
    fromAccount: `100${String(Math.floor(Math.random() * 9000000 + 1000000))}`,
    toAccount: `100${String(Math.floor(Math.random() * 9000000 + 1000000))}`,
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '30d';
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  const CS = process.env.TRANSACTION_LOG_MODULE_DB_CONNECTION_STRING;

  const { data, isLive } = await tryOracleQuery(CS,
    `SELECT "TransactionId" AS id, "Amount" AS amount, "Fee" AS fee,
            "TransactionType" AS type, "Status" AS status, "Channel" AS channel,
            "CreatedAt" AS date, "FromAccount" AS "fromAccount", "ToAccount" AS "toAccount"
     FROM "TRANSACTION_LOG_MODULE"."Transactions"
     WHERE "CreatedAt" >= SYSDATE - :days
     ORDER BY "CreatedAt" DESC
     FETCH FIRST 500 ROWS ONLY`,
    { days }
  );

  const result = isLive ? data : generateDemoTxData(days);

  return NextResponse.json({ isLive, data: result }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
