
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subDays, parseISO, startOfDay, endOfDay } from 'date-fns';

function jsonToCsv(items: any[]) {
    if (items.length === 0) {
        return "";
    }
    const header = Object.keys(items[0]);
    const headerString = header.join(',');

    const replacer = (key: any, value: any) => value ?? '';

    const rowItems = items.map(row =>
        header.map(fieldName =>
            JSON.stringify(row[fieldName], replacer)
        ).join(',')
    );

    return [headerString, ...rowItems].join('\r\n');
}


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const query = searchParams.get('query');
        
        let where: any = {};
        
        if (from || to) {
            where.timestamp = {};
            if (from) where.timestamp.gte = startOfDay(parseISO(from));
            if (to) where.timestamp.lte = endOfDay(parseISO(to));
        }

        if (status && status !== 'All') where.status = status;
        if (type && type !== 'All') where.type = type;

        if (query) {
             where.OR = [
                { id: { contains: query, mode: 'insensitive' } },
                { to_account: { contains: query, mode: 'insensitive' } },
                { customer: { name: { contains: query, mode: 'insensitive' } } },
                { customer: { phone: { contains: query, mode: 'insensitive' } } }
            ];
        }

        const transactions = await db.transaction.findMany({
            where,
            include: {
                customer: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: { timestamp: 'desc' }
        });
        
        const dataForCsv = transactions.map((row: any) => ({
            transaction_id: row.id,
            timestamp: row.timestamp.toISOString(),
            type: row.type,
            amount: row.amount,
            fee: row.fee,
            status: row.status,
            channel: row.channel,
            sender_name: row.customer.name,
            sender_phone: row.customer.phone,
            receiver_account: row.to_account
        }));

        const csv = jsonToCsv(dataForCsv);

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="transactions.csv"`,
            },
        });

    } catch (error) {
        console.error('Failed to export transactions:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
