
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subDays, parseISO, startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const query = searchParams.get('query');
        
        let where: any = {};
        
        // Date range filtering
        if (from || to) {
            where.timestamp = {};
            if (from) {
                where.timestamp.gte = startOfDay(parseISO(from));
            }
            if (to) {
                where.timestamp.lte = endOfDay(parseISO(to));
            }
        } else {
             where.timestamp = {
                gte: subDays(new Date(), 30)
            };
        }

        if (status && status !== 'All') {
            where.status = status;
        }

        if (type && type !== 'All') {
            where.type = type;
        }

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
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        
        const todayRange = {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date())
        };

        const totalVolumeToday = await db.transaction.aggregate({
            _sum: { amount: true },
            where: { status: 'Successful', timestamp: todayRange }
        });
        
        const totalTransactionsToday = await db.transaction.count({ where: { timestamp: todayRange } });
        const failedTransactionsToday = await db.transaction.count({ where: { status: 'Failed', timestamp: todayRange } });

        const data = transactions.map((row: any) => ({
            id: row.id,
            timestamp: row.timestamp,
            type: row.type,
            amount: row.amount,
            fee: row.fee,
            status: row.status,
            channel: row.channel,
            from: {
                name: row.customer.name,
                account: row.customer.phone,
            },
            to: {
                name: "Receiver Name", // Mocked
                account: row.to_account
            }
        }));

        return NextResponse.json({
            transactions: data,
            summary: {
                totalVolume: totalVolumeToday._sum.amount || 0,
                totalTransactions: totalTransactionsToday,
                failedTransactions: failedTransactionsToday
            }
        });

    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            transactions: [],
            summary: {
                totalVolume: 0,
                totalTransactions: 0,
                failedTransactions: 0
            }
        }, { status: 500 });
    }
}
