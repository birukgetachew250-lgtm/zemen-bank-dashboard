
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillCategory"`;

export async function GET() {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
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
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
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
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
    try {
        const body = await req.json();
        const { CategoryId, ...updateData } = body;

        if (!CategoryId) return NextResponse.json({ message: "CategoryId is required" }, { status: 400 });

        const numericFields = ['Rank'];
        const excludeKeys = ['CategoryId', 'CreatedAt', 'CreatedBy', 'Version'];

        const setFields: string[] = [];
        const binds: any = { CategoryId };

        for (const [key, value] of Object.entries(updateData)) {
            if (excludeKeys.includes(key)) continue;
            setFields.push(`"${key}" = :${key}`);
            if (numericFields.includes(key)) {
                const n = parseInt(String(value), 10);
                binds[key] = isNaN(n) ? null : n;
            } else {
                binds[key] = (value === '' || value === undefined) ? null : value;
            }
        }

        if (setFields.length === 0) return NextResponse.json({ message: "No fields to update" }, { status: 400 });

        const query = `UPDATE ${TABLE} SET ${setFields.join(', ')}, "UpdatedAt" = CURRENT_TIMESTAMP WHERE "CategoryId" = :CategoryId`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update bill category:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
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
