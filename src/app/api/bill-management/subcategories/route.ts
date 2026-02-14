
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillSubcategory"`;

export async function GET(req: Request) {
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
    try {
        const body = await req.json();
        const { SubcategoryId, ...updateData } = body;

        if (!SubcategoryId) return NextResponse.json({ message: "SubcategoryId is required" }, { status: 400 });

        const fields = Object.keys(updateData).map(key => `"${key}" = :${key}`).join(', ');
        const query = `UPDATE ${TABLE} SET ${fields}, "UpdatedAt" = CURRENT_TIMESTAMP WHERE "SubcategoryId" = :SubcategoryId`;
        
        // Handle boolean conversion for Oracle
        const binds = { ...body };
        if (body.IsMiniApp !== undefined) binds.IsMiniApp = body.IsMiniApp ? 1 : 0;
        if (body.IsBillable !== undefined) binds.IsBillable = body.IsBillable ? 1 : 0;

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update bill subcategory:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
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
