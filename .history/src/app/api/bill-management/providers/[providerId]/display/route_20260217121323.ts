import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillDisplayField"`;

export async function GET(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const query = `SELECT * FROM ${TABLE} WHERE "ProviderId" = :providerId ORDER BY "ScreenType", "DisplayOrder"`;
        const result = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { providerId: params.providerId });
        return NextResponse.json(result.rows || []);
    } catch (error: any) {
        console.error("Failed to fetch display fields:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const body = await req.json();
        const displayFieldId = `disp-${crypto.randomUUID().slice(0, 8)}`;

        const query = `
            INSERT INTO ${TABLE} (
                "DisplayFieldId", "ProviderId", "ScreenType", "SourceField", "Label",
                "ValueFormat", "FormatString", "IconName", "IsHighlighted", "TextStyle",
                "TextColor", "GroupName", "DisplayOrder", "VisibilityCondition",
                "DefaultValue", "Prefix", "Suffix", "Copyable",
                "Status", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy"
            )
            VALUES (
                :DisplayFieldId, :ProviderId, :ScreenType, :SourceField, :Label,
                :ValueFormat, :FormatString, :IconName, :IsHighlighted, :TextStyle,
                :TextColor, :GroupName, :DisplayOrder, :VisibilityCondition,
                :DefaultValue, :Prefix, :Suffix, :Copyable,
                :Status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :CreatedBy, :UpdatedBy
            )
        `;

        const binds = {
            DisplayFieldId: displayFieldId,
            ProviderId: params.providerId,
            ScreenType: body.ScreenType || 'confirmation',
            SourceField: body.SourceField,
            Label: body.Label,
            ValueFormat: body.ValueFormat || 'text',
            FormatString: body.FormatString || null,
            IconName: body.IconName || null,
            IsHighlighted: body.IsHighlighted ? 1 : 0,
            TextStyle: body.TextStyle || 'normal',
            TextColor: body.TextColor || null,
            GroupName: body.GroupName || null,
            DisplayOrder: parseInt(body.DisplayOrder, 10) || 0,
            VisibilityCondition: body.VisibilityCondition || null,
            DefaultValue: body.DefaultValue || null,
            Prefix: body.Prefix || null,
            Suffix: body.Suffix || null,
            Copyable: body.Copyable ? 1 : 0,
            Status: body.Status || 'Active',
            CreatedBy: body.CreatedBy || 'admin',
            UpdatedBy: body.UpdatedBy || 'admin',
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true, DisplayFieldId: displayFieldId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create display field:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const body = await req.json();
        const { DisplayFieldId, ...updateData } = body;

        if (!DisplayFieldId) return NextResponse.json({ message: "DisplayFieldId is required" }, { status: 400 });

        const booleanFields = ['IsHighlighted', 'Copyable'];
        const intFields = ['DisplayOrder'];
        const excludeKeys = ['DisplayFieldId', 'ProviderId', 'CreatedAt', 'CreatedBy'];

        const setFields: string[] = [];
        const binds: any = { DisplayFieldId, ProviderId: params.providerId };

        for (const [key, value] of Object.entries(updateData)) {
            if (excludeKeys.includes(key)) continue;
            setFields.push(`"${key}" = :${key}`);

            if (booleanFields.includes(key)) {
                binds[key] = value ? 1 : 0;
            } else if (intFields.includes(key)) {
                binds[key] = parseInt(String(value), 10) || 0;
            } else {
                binds[key] = value ?? null;
            }
        }

        if (setFields.length === 0) return NextResponse.json({ message: "No fields to update" }, { status: 400 });

        const query = `UPDATE ${TABLE} SET ${setFields.join(', ')}, "UpdatedAt" = CURRENT_TIMESTAMP, "UpdatedBy" = :UpdatedBy WHERE "DisplayFieldId" = :DisplayFieldId AND "ProviderId" = :ProviderId`;
        binds.UpdatedBy = body.UpdatedBy || 'admin';

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update display field:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "DisplayFieldId" = :id AND "ProviderId" = :providerId`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id, providerId: params.providerId });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete display field:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
