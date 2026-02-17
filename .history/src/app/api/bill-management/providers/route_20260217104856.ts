
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillProvider"`;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');

    try {
        let query = `
            SELECT p.*, c."CategoryName", s."SubcategoryName" 
            FROM ${TABLE} p 
            JOIN "${SCHEMA}"."BillCategory" c ON p."CategoryId" = c."CategoryId"
            LEFT JOIN "${SCHEMA}"."BillSubcategory" s ON p."SubcategoryId" = s."SubcategoryId"
        `;
        const binds: any = {};
        const conditions: string[] = [];
        
        if (categoryId) {
            conditions.push(`p."CategoryId" = :categoryId`);
            binds.categoryId = categoryId;
        }
        if (subcategoryId) {
            conditions.push(`p."SubcategoryId" = :subcategoryId`);
            binds.subcategoryId = subcategoryId;
        }
        
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }
        
        query += ` ORDER BY p."Rank" ASC`;
        
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json(result.rows || []);
    } catch (error: any) {
        console.error("Failed to fetch bill providers:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const providerId = body.ProviderId || `prov-${crypto.randomUUID().slice(0, 8)}`;
        
        const query = `
            INSERT INTO ${TABLE} (
                "ProviderId", "CategoryId", "SubcategoryId", "ProviderName", "ProviderCode", 
                "ApiEndpoint", "HoldingAccountId", "Description", "LogoUrl", "IconUrl", 
                "PrimaryColor", "SecondaryColor", "PageTemplate", "MinAmount", "MaxAmount", 
                "ServiceChargePercent", "ServiceChargeFixed", "Status", "Rank", "UpdatedAt"
            )
            VALUES (
                :ProviderId, :CategoryId, :SubcategoryId, :ProviderName, :ProviderCode, 
                :ApiEndpoint, :HoldingAccountId, :Description, :LogoUrl, :IconUrl, 
                :PrimaryColor, :SecondaryColor, :PageTemplate, :MinAmount, :MaxAmount, 
                :ServiceChargePercent, :ServiceChargeFixed, :Status, :Rank, CURRENT_TIMESTAMP
            )
        `;
        
        const binds = {
            ProviderId: providerId,
            CategoryId: body.CategoryId,
            SubcategoryId: body.SubcategoryId || null,
            ProviderName: body.ProviderName,
            ProviderCode: body.ProviderCode,
            ApiEndpoint: body.ApiEndpoint || null,
            HoldingAccountId: body.HoldingAccountId,
            Description: body.Description || null,
            LogoUrl: body.LogoUrl || null,
            IconUrl: body.IconUrl || null,
            PrimaryColor: body.PrimaryColor || null,
            SecondaryColor: body.SecondaryColor || null,
            PageTemplate: body.PageTemplate || 1,
            MinAmount: body.MinAmount ? parseFloat(body.MinAmount) : null,
            MaxAmount: body.MaxAmount ? parseFloat(body.MaxAmount) : null,
            ServiceChargePercent: body.ServiceChargePercent ? parseFloat(body.ServiceChargePercent) : null,
            ServiceChargeFixed: body.ServiceChargeFixed ? parseFloat(body.ServiceChargeFixed) : null,
            Status: body.Status || 'Active',
            Rank: parseInt(body.Rank, 10) || 0,
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true, ProviderId: providerId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create bill provider:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { ProviderId, ...updateData } = body;

        if (!ProviderId) return NextResponse.json({ message: "ProviderId is required" }, { status: 400 });

        const numericFields = ['PageTemplate', 'MinAmount', 'MaxAmount', 'ServiceChargePercent', 'ServiceChargeFixed', 'Rank'];
        const excludeKeys = ['ProviderId', 'CreatedAt', 'CreatedBy', 'Version'];

        const setFields: string[] = [];
        const binds: any = { ProviderId };

        for (const [key, value] of Object.entries(updateData)) {
            if (excludeKeys.includes(key)) continue;
            setFields.push(`"${key}" = :${key}`);
            if (numericFields.includes(key)) {
                const n = parseFloat(String(value));
                binds[key] = isNaN(n) ? null : n;
            } else {
                binds[key] = (value === '' || value === undefined) ? null : value;
            }
        }

        if (setFields.length === 0) return NextResponse.json({ message: "No fields to update" }, { status: 400 });

        const query = `UPDATE ${TABLE} SET ${setFields.join(', ')}, "UpdatedAt" = CURRENT_TIMESTAMP WHERE "ProviderId" = :ProviderId`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update bill provider:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "ProviderId" = :id`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete bill provider:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
