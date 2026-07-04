
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';


const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillSubcategory"`;

export async function GET(req: Request) {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    try {
        let query = `SELECT s.*, c."CategoryName" FROM ${TABLE} s JOIN "${SCHEMA}"."BillCategory" c ON s."CategoryId" = c."CategoryId"`;
        const binds: any = {};
        
        if (categoryId) {
            query += ` WHERE s."CategoryId" = :categoryId`;
            binds.categoryId = categoryId;
        }
        
        query += ` ORDER BY s."Rank" ASC`;
        
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json(result.rows || []);
    } catch (error: any) {
        console.error("Failed to fetch bill subcategories:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
    try {
        const body = await req.json();
        const subcategoryId = body.SubcategoryId || `subcat-${crypto.randomUUID().slice(0, 8)}`;
        
        const query = `
            INSERT INTO ${TABLE} ("SubcategoryId", "CategoryId", "SubcategoryName", "HoldingAccountId", "IsMiniApp", "WebUrl", "ApiEndpoint", "Description", "LogoUrl", "IconUrl", "IsBillable", "PageTemplate", "Status", "Rank", "UpdatedAt")
            VALUES (:SubcategoryId, :CategoryId, :SubcategoryName, :HoldingAccountId, :IsMiniApp, :WebUrl, :ApiEndpoint, :Description, :LogoUrl, :IconUrl, :IsBillable, :PageTemplate, :Status, :Rank, CURRENT_TIMESTAMP)
        `;
        
        const binds = {
            SubcategoryId: subcategoryId,
            CategoryId: body.CategoryId,
            SubcategoryName: body.SubcategoryName,
            HoldingAccountId: body.HoldingAccountId,
            IsMiniApp: body.IsMiniApp ? 1 : 0,
            WebUrl: body.WebUrl || null,
            ApiEndpoint: body.ApiEndpoint || null,
            Description: body.Description || null,
            LogoUrl: body.LogoUrl || null,
            IconUrl: body.IconUrl || null,
            IsBillable: body.IsBillable ? 1 : 0,
            PageTemplate: body.PageTemplate || 1,
            Status: body.Status || 'Active',
            Rank: parseInt(body.Rank, 10) || 0,
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true, SubcategoryId: subcategoryId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create bill subcategory:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
    try {
        const body = await req.json();
        const { SubcategoryId, ...updateData } = body;

        if (!SubcategoryId) return NextResponse.json({ message: "SubcategoryId is required" }, { status: 400 });

        const booleanFields = ['IsMiniApp', 'IsBillable'];
        const numericFields = ['PageTemplate', 'Rank'];
        const excludeKeys = ['SubcategoryId', 'CreatedAt', 'CreatedBy', 'Version', 'CategoryName'];

        const setFields: string[] = [];
        const binds: any = { SubcategoryId };

        for (const [key, value] of Object.entries(updateData)) {
            if (excludeKeys.includes(key)) continue;
            setFields.push(`"${key}" = :${key}`);
            if (booleanFields.includes(key)) {
                binds[key] = value === true || value === 1 || value === 'true' ? 1 : 0;
            } else if (numericFields.includes(key)) {
                const n = parseInt(String(value), 10);
                binds[key] = isNaN(n) ? null : n;
            } else {
                binds[key] = (value === '' || value === undefined) ? null : value;
            }
        }

        if (setFields.length === 0) return NextResponse.json({ message: "No fields to update" }, { status: 400 });

        const query = `UPDATE ${TABLE} SET ${setFields.join(', ')}, "UpdatedAt" = CURRENT_TIMESTAMP WHERE "SubcategoryId" = :SubcategoryId`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update bill subcategory:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "SubcategoryId" = :id`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete bill subcategory:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
