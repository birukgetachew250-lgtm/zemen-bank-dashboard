
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subDays, parseISO } from 'date-fns';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const query = searchParams.get('query');
        
        let sql = `
            SELECT 
                t.id, t.timestamp, t.type, t.amount, t.fee, t.status, t.channel,
                c.name as from_customer_name, c.phone as from_customer_phone,
                t.to_account
            FROM transactions t
            JOIN customers c ON t.customerId = c.id
        `;
        
        const whereClauses: string[] = [];
        const params: any[] = [];

        if (from) {
            whereClauses.push("t.timestamp >= ?");
            params.push(parseISO(from).toISOString());
        } else {
            whereClauses.push("t.timestamp >= ?");
            params.push(subDays(new Date(), 30).toISOString());
        }

        if (to) {
            whereClauses.push("t.timestamp <= ?");
            params.push(parseISO(to).toISOString());
        }

        if (status && status !== 'All') {
            whereClauses.push("t.status = ?");
            params.push(status);
        }

        if (type && type !== 'All') {
            whereClauses.push("t.type = ?");
            params.push(type);
        }

        if (query) {
            whereClauses.push("(t.id LIKE ? OR c.phone LIKE ? OR t.to_account LIKE ? OR c.name LIKE ?)");
            const wildQuery = `%${query}%`;
            params.push(wildQuery, wildQuery, wildQuery, wildQuery);
        }

        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        
        sql += " ORDER BY t.timestamp DESC";
        
        const transactions = db.prepare(sql).all(...params);

        const totalVolume = db.prepare(`SELECT SUM(amount) as total FROM transactions WHERE status = 'Successful'`).get()?.total ?? 0;
        const totalTransactions = db.prepare(`SELECT COUNT(id) as count FROM transactions`).get()?.count ?? 0;
        const failedTransactions = db.prepare(`SELECT COUNT(id) as count FROM transactions WHERE status = 'Failed'`).get()?.count ?? 0;

        const data = transactions.map((row: any) => ({
            id: row.id,
            timestamp: row.timestamp,
            type: row.type,
            amount: row.amount,
            fee: row.fee,
            status: row.status,
            channel: row.channel,
            from: {
                name: row.from_customer_name,
                account: row.from_customer_phone,
            },
            to: {
                name: "Receiver Name", // Mocked
                account: row.to_account
            }
        }));

        return NextResponse.json({
            transactions: data,
            summary: {
                totalVolume,
                totalTransactions,
                failedTransactions
            }
        });

    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

