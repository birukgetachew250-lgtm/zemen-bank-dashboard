
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    try {
        let where: any = {};
        
        if (query) {
             where.OR = [
                { userEmail: { contains: query, mode: 'insensitive' } },
                { action: { contains: query, mode: 'insensitive' } },
                { details: { contains: query, mode: 'insensitive' } },
                { ipAddress: { contains: query, mode: 'insensitive' } }
            ];
        }

        if (from && to) {
            where.timestamp = {
                gte: startOfDay(parseISO(from)),
                lte: endOfDay(parseISO(to))
            };
        }

        const logs = await db.systemActivityLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 100, // Limit the number of logs returned
        });
        return NextResponse.json(logs);
    } catch (error) {
        console.error("Failed to fetch activity logs:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
