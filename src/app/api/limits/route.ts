
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const TABLE = '"LIMIT_CHARGE_MODULE"."LimitRules"';

export async function GET() {
    try {
        const query = `SELECT * FROM ${TABLE} WHERE "IsActive" = 1 ORDER BY "CustomerCategory", "TransactionType"`;
        const result: any = await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query);
        return NextResponse.json(result.rows.map((row: any) => ({
            id: row.Id,
            category: row.CustomerCategory,
            transactionType: row.TransactionType,
            dailyLimit: row.DailyLimit,
            weeklyLimit: row.WeeklyLimit,
            monthlyLimit: row.MonthlyLimit,
        })));
    } catch (error) {
        console.error('Failed to fetch limit rules:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { category, transactionType, dailyLimit, weeklyLimit, monthlyLimit } = await req.json();
        const id = crypto.randomUUID();
        const query = `
            INSERT INTO ${TABLE} ("Id", "CustomerCategory", "TransactionType", "DailyLimit", "WeeklyLimit", "MonthlyLimit", "Currency", "IsActive") 
            VALUES (:Id, :CustomerCategory, :TransactionType, :DailyLimit, :WeeklyLimit, :MonthlyLimit, :Currency, 1)
        `;
        const binds = {
            Id: id,
            CustomerCategory: category,
            TransactionType: transactionType,
            DailyLimit: parseFloat(dailyLimit),
            WeeklyLimit: parseFloat(weeklyLimit),
            MonthlyLimit: parseFloat(monthlyLimit),
            Currency: 'ETB',
        };

        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ id, category, transactionType, dailyLimit, weeklyLimit, monthlyLimit }, { status: 201 });
    } catch (error) {
        console.error('Failed to create limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, category, transactionType, dailyLimit, weeklyLimit, monthlyLimit } = await req.json();
        const query = `
            UPDATE ${TABLE} SET 
                "CustomerCategory" = :CustomerCategory, 
                "TransactionType" = :TransactionType, 
                "DailyLimit" = :DailyLimit, 
                "WeeklyLimit" = :WeeklyLimit,
                "MonthlyLimit" = :MonthlyLimit 
            WHERE "Id" = :Id
        `;
        const binds = {
            Id: id,
            CustomerCategory: category,
            TransactionType: transactionType,
            DailyLimit: parseFloat(dailyLimit),
            WeeklyLimit: parseFloat(weeklyLimit),
            MonthlyLimit: parseFloat(monthlyLimit),
        };
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ id, category, transactionType, dailyLimit, weeklyLimit, monthlyLimit });
    } catch (error) {
        console.error('Failed to update limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        // Soft delete
        const query = `UPDATE ${TABLE} SET "IsActive" = 0 WHERE "Id" = :Id`;
        await executeQuery(process.env.LIMIT_CHARGE_MODULE_DB_CONNECTION_STRING, query, { Id: id });
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete limit rule:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
