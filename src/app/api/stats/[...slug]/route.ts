
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subDays, startOfDay, endOfDay } from 'date-fns';

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

    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}
