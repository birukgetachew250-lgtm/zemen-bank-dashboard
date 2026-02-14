
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillCategory"`;

export async function GET() {
    try {
        const query = `SELECT * FROM ${TABLE} ORDER BY "Rank" ASC`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        return NextResponse.json(result.rows || []);
    } catch (error: any) {
        console.error("Failed to fetch bill categories:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const categoryId = body.CategoryId || `cat-${crypto.randomUUID().slice(0, 8)}`;
        
        const query = `
            INSERT INTO ${TABLE} ("CategoryId", "CategoryName", "Description", "LogoUrl", "IconUrl", "ColorHex", "Status", "Rank", "UpdatedAt")
            VALUES (:CategoryId, :CategoryName, :Description, :LogoUrl, :IconUrl, :ColorHex, :Status, :Rank, CURRENT_TIMESTAMP)
        `;
        
        const binds = {
            CategoryId: categoryId,
            CategoryName: body.CategoryName,
            Description: body.Description || null,
            LogoUrl: body.LogoUrl || null,
            IconUrl: body.IconUrl || null,
            ColorHex: body.ColorHex || null,
            Status: body.Status || 'Active',
            Rank: parseInt(body.Rank, 10) || 0,
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true, CategoryId: categoryId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create bill category:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { CategoryId, ...updateData } = body;

        if (!CategoryId) return NextResponse.json({ message: "CategoryId is required" }, { status: 400 });

        const fields = Object.keys(updateData).map(key => `"${key}" = :${key}`).join(', ');
        const query = `UPDATE ${TABLE} SET ${fields}, "UpdatedAt" = CURRENT_TIMESTAMP WHERE "CategoryId" = :CategoryId`;
        
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, body);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update bill category:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "CategoryId" = :id`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete bill category:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
