
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillSubcategory"`;
const PROVIDER_TABLE = `"${SCHEMA}"."BillProvider"`;

const NO_STORE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
};

async function ensureDirectProviderContainer(sub: {
    SubcategoryId: string;
    CategoryId: string;
    SubcategoryName: string;
    HoldingAccountId: string;
    ApiEndpoint?: string | null;
    Description?: string | null;
    LogoUrl?: string | null;
    IconUrl?: string | null;
    PageTemplate?: number | null;
    Status?: string | null;
    Rank?: number | null;
}) {
    const connStr = process.env.APP_CONTROL_DB_CONNECTION_STRING;
    const existing: any = await executeQuery(
        connStr,
        `SELECT "ProviderId" FROM ${PROVIDER_TABLE} WHERE "ProviderId" = :ProviderId`,
        { ProviderId: sub.SubcategoryId }
    );
    const code = `DIRECT_${sub.SubcategoryId.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`.slice(0, 48);

    if (existing.rows && existing.rows.length > 0) {
        await executeQuery(
            connStr,
            `UPDATE ${PROVIDER_TABLE}
             SET "CategoryId" = :CategoryId,
                 "SubcategoryId" = :SubcategoryId,
                 "ProviderName" = :ProviderName,
                 "HoldingAccountId" = :HoldingAccountId,
                 "ApiEndpoint" = :ApiEndpoint,
                 "Description" = :Description,
                 "LogoUrl" = :LogoUrl,
                 "IconUrl" = :IconUrl,
                 "Status" = :Status,
                 "UpdatedAt" = CURRENT_TIMESTAMP
             WHERE "ProviderId" = :ProviderId`,
            {
                ProviderId: sub.SubcategoryId,
                CategoryId: sub.CategoryId,
                SubcategoryId: sub.SubcategoryId,
                ProviderName: sub.SubcategoryName,
                HoldingAccountId: sub.HoldingAccountId,
                ApiEndpoint: sub.ApiEndpoint || null,
                Description: sub.Description || null,
                LogoUrl: sub.LogoUrl || null,
                IconUrl: sub.IconUrl || null,
                Status: sub.Status || 'Active',
            }
        );
    } else {
        await executeQuery(
            connStr,
            `INSERT INTO ${PROVIDER_TABLE} (
                "ProviderId", "CategoryId", "SubcategoryId", "ProviderName", "ProviderCode",
                "ApiEndpoint", "HoldingAccountId", "Description", "LogoUrl", "IconUrl",
                "PageTemplate", "Status", "Rank", "UpdatedAt"
            ) VALUES (
                :ProviderId, :CategoryId, :SubcategoryId, :ProviderName, :ProviderCode,
                :ApiEndpoint, :HoldingAccountId, :Description, :LogoUrl, :IconUrl,
                1, :Status, :Rank, CURRENT_TIMESTAMP
            )`,
            {
                ProviderId: sub.SubcategoryId,
                CategoryId: sub.CategoryId,
                SubcategoryId: sub.SubcategoryId,
                ProviderName: sub.SubcategoryName,
                ProviderCode: code,
                ApiEndpoint: sub.ApiEndpoint || null,
                HoldingAccountId: sub.HoldingAccountId,
                Description: sub.Description || null,
                LogoUrl: sub.LogoUrl || null,
                IconUrl: sub.IconUrl || null,
                Status: sub.Status || 'Active',
                Rank: sub.Rank ?? 0,
            }
        );
    }
}

export async function GET(req: Request) {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    try {
        // Automatically clean up any legacy '(Direct Subcategory Page)' suffix on backing BillProvider rows
        await executeQuery(
            process.env.APP_CONTROL_DB_CONNECTION_STRING,
            `UPDATE ${PROVIDER_TABLE}
             SET "ProviderName" = REPLACE("ProviderName", ' (Direct Subcategory Page)', ''),
                 "Description" = CASE WHEN "Description" = 'Direct subcategory page configuration container' THEN NULL ELSE "Description" END
             WHERE "ProviderName" LIKE '%(Direct Subcategory Page)%'
                OR "Description" = 'Direct subcategory page configuration container'`
        ).catch(() => {});

        let query = `SELECT s.*, c."CategoryName" FROM ${TABLE} s JOIN "${SCHEMA}"."BillCategory" c ON s."CategoryId" = c."CategoryId"`;
        const binds: any = {};
        
        if (categoryId) {
            query += ` WHERE s."CategoryId" = :categoryId`;
            binds.categoryId = categoryId;
        }
        
        query += ` ORDER BY s."Rank" ASC, s."SubcategoryName" ASC`;
        
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json(result.rows || [], { headers: NO_STORE_HEADERS });
    } catch (error: any) {
        console.error("Failed to fetch bill subcategories:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500, headers: NO_STORE_HEADERS });
    }
}

export async function POST(req: Request) {
    const session = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
    if (session instanceof NextResponse) return session;
    try {
        const body = await req.json();

        if (body.action === 'ensure-direct-provider' && body.SubcategoryId) {
            const subRes: any = await executeQuery(
                process.env.APP_CONTROL_DB_CONNECTION_STRING,
                `SELECT * FROM ${TABLE} WHERE "SubcategoryId" = :id`,
                { id: body.SubcategoryId }
            );
            const sub = subRes.rows?.[0];
            if (!sub) {
                return NextResponse.json({ message: 'Subcategory not found' }, { status: 404 });
            }
            await ensureDirectProviderContainer(sub);
            return NextResponse.json({ success: true, ProviderId: sub.SubcategoryId });
        }

        const subcategoryId = body.SubcategoryId || `subcat-${crypto.randomUUID().slice(0, 8)}`;
        const pageTemplate = parseInt(String(body.PageTemplate || 1), 10) || 1;
        
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
            PageTemplate: pageTemplate,
            Status: body.Status || 'Active',
            Rank: parseInt(body.Rank, 10) || 0,
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);

        if (pageTemplate === 2 && !binds.IsMiniApp) {
            await ensureDirectProviderContainer(binds);
        }

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

        if (Number(binds.PageTemplate) === 2 && !binds.IsMiniApp) {
            await ensureDirectProviderContainer({
                SubcategoryId,
                CategoryId: updateData.CategoryId,
                SubcategoryName: updateData.SubcategoryName,
                HoldingAccountId: updateData.HoldingAccountId,
                ApiEndpoint: updateData.ApiEndpoint,
                Description: updateData.Description,
                LogoUrl: updateData.LogoUrl,
                IconUrl: updateData.IconUrl,
                PageTemplate: Number(binds.PageTemplate),
                Status: updateData.Status,
                Rank: Number(binds.Rank || 0),
            });
        }

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
        const connStr = process.env.APP_CONTROL_DB_CONNECTION_STRING;

        // Clean up any direct subcategory SDUI config & container if present
        const childTables = ['BillFormField', 'BillFlowStep', 'BillApiConfig', 'BillDisplayField'];
        for (const childTable of childTables) {
            await executeQuery(
                connStr,
                `DELETE FROM "${SCHEMA}"."${childTable}" WHERE "ProviderId" = :id`,
                { id }
            );
        }
        await executeQuery(connStr, `DELETE FROM ${PROVIDER_TABLE} WHERE "ProviderId" = :id`, { id });

        const query = `DELETE FROM ${TABLE} WHERE "SubcategoryId" = :id`;
        await executeQuery(connStr, query, { id });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete bill subcategory:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
