
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillFormField"`;

export async function POST(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const body = await req.json();
        const fieldId = `field-${crypto.randomUUID().slice(0, 8)}`;
        
        const query = `
            INSERT INTO ${TABLE} (
                "FieldId", "ProviderId", "FieldKey", "Label", "Placeholder", "HelperText", 
                "FieldType", "KeyboardType", "IconName", "IsRequired", "IsReadOnly", 
                "IsHidden", "IsMasked", "MinLength", "MaxLength", "ValidationPattern", 
                "ValidationMessage", "DefaultValue", "Options", "OptionsLayout", "FieldOrder", 
                "StepNumber", "FieldWidth", "Status", "UpdatedAt"
            )
            VALUES (
                :FieldId, :ProviderId, :FieldKey, :Label, :Placeholder, :HelperText, 
                :FieldType, :KeyboardType, :IconName, :IsRequired, :IsReadOnly, 
                :IsHidden, :IsMasked, :MinLength, :MaxLength, :ValidationPattern, 
                :ValidationMessage, :DefaultValue, :Options, :OptionsLayout, :FieldOrder, 
                :StepNumber, :FieldWidth, :Status, CURRENT_TIMESTAMP
            )
        `;
        
        const binds = {
            FieldId: fieldId,
            ProviderId: params.providerId,
            FieldKey: body.FieldKey,
            Label: body.Label,
            Placeholder: body.Placeholder || null,
            HelperText: body.HelperText || null,
            FieldType: body.FieldType || 'text',
            KeyboardType: body.KeyboardType || 'text',
            IconName: body.IconName || null,
            IsRequired: body.IsRequired ? 1 : 0,
            IsReadOnly: body.IsReadOnly ? 1 : 0,
            IsHidden: body.IsHidden ? 1 : 0,
            IsMasked: body.IsMasked ? 1 : 0,
            MinLength: body.MinLength ? parseInt(body.MinLength, 10) : null,
            MaxLength: body.MaxLength ? parseInt(body.MaxLength, 10) : null,
            ValidationPattern: body.ValidationPattern || null,
            ValidationMessage: body.ValidationMessage || null,
            DefaultValue: body.DefaultValue || null,
            Options: body.Options || null,
            OptionsLayout: body.OptionsLayout || 'vertical',
            FieldOrder: parseInt(body.FieldOrder, 10) || 0,
            StepNumber: parseInt(body.StepNumber, 10) || 1,
            FieldWidth: body.FieldWidth || 'full',
            Status: body.Status || 'Active',
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true, FieldId: fieldId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create form field:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const body = await req.json();
        const { FieldId, ...updateData } = body;

        if (!FieldId) return NextResponse.json({ message: "FieldId is required" }, { status: 400 });

        const fields = Object.keys(updateData).map(key => `"${key}" = :${key}`).join(', ');
        const query = `UPDATE ${TABLE} SET ${fields}, "UpdatedAt" = CURRENT_TIMESTAMP WHERE "FieldId" = :FieldId`;
        
        const binds = { ...body };
        ['IsRequired', 'IsReadOnly', 'IsHidden', 'IsMasked', 'TriggerLookup', 'ClearDependentsOnChange'].forEach(key => {
            if (binds[key] !== undefined) binds[key] = binds[key] ? 1 : 0;
        });

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update form field:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "FieldId" = :id`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete form field:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
