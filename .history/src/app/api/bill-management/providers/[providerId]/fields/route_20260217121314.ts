
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillFormField"`;

// All boolean NUMBER(1) columns in BillFormField
const BOOLEAN_FIELDS = [
    'IsRequired', 'IsReadOnly', 'IsHidden', 'IsMasked',
    'AllowCamera', 'AllowGallery', 'AllowHalfRating', 'AutoFormat',
    'TriggerLookup', 'ClearDependentsOnChange',
];

// All integer NUMBER columns in BillFormField
const INT_FIELDS = [
    'MinLength', 'MaxLength', 'MinValue', 'MaxValue', 'StepValue',
    'GridColumns', 'MinSelections', 'MaxSelections', 'DigitCount',
    'TextAreaLines', 'MaxFileSize', 'MaxRating', 'DecimalPlaces',
    'FieldOrder', 'StepNumber', 'LookupDebounceMs', 'LookupMinLength',
];

// Keys that should never be in INSERT/UPDATE binds
const EXCLUDE_KEYS = ['FieldId', 'ProviderId', 'CreatedAt', 'UpdatedAt', 'CreatedBy', 'UpdatedBy'];

function toBind(key: string, value: any): any {
    if (BOOLEAN_FIELDS.includes(key)) return value === true || value === 1 || value === 'true' ? 1 : 0;
    if (INT_FIELDS.includes(key)) {
        const n = parseInt(String(value), 10);
        return isNaN(n) ? null : n;
    }
    return (value === '' || value === undefined) ? null : value;
}

export async function GET(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const query = `SELECT * FROM ${TABLE} WHERE "ProviderId" = :providerId ORDER BY "StepNumber", "FieldOrder"`;
        const result = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { providerId: params.providerId });
        return NextResponse.json(result.rows || []);
    } catch (error: any) {
        console.error("Failed to fetch form fields:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const body = await req.json();
        const fieldId = `field-${crypto.randomUUID().slice(0, 8)}`;

        const query = `
            INSERT INTO ${TABLE} (
                "FieldId", "ProviderId", "FieldKey", "Label", "Placeholder", "HelperText",
                "FieldType", "KeyboardType", "IconName", "IsRequired", "IsReadOnly",
                "IsHidden", "IsMasked", "MinLength", "MaxLength", "MinValue", "MaxValue", "StepValue",
                "ValidationPattern", "ValidationMessage", "DefaultValue",
                "Options", "OptionsApiEndpoint", "OptionsApiPath", "OptionsLayout",
                "GridColumns", "MinSelections", "MaxSelections",
                "DigitCount", "TextAreaLines",
                "MinDate", "MaxDate", "DateFormat", "TimeFormat",
                "AllowedFileTypes", "MaxFileSize", "AllowCamera", "AllowGallery",
                "MaxRating", "AllowHalfRating", "OnText", "OffText",
                "Prefix", "Suffix", "InputMask", "AutoFormat",
                "CurrencyCode", "DecimalPlaces",
                "FieldGroup", "FieldOrder", "StepNumber", "FieldWidth",
                "VisibilityCondition", "RequiredCondition",
                "TriggerLookup", "LookupDebounceMs", "LookupMinLength",
                "LookupEndpoint", "LookupFieldMapping",
                "ClearDependentsOnChange", "DependentFields",
                "CssClass", "ExtraConfig",
                "Status", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy"
            )
            VALUES (
                :FieldId, :ProviderId, :FieldKey, :Label, :Placeholder, :HelperText,
                :FieldType, :KeyboardType, :IconName, :IsRequired, :IsReadOnly,
                :IsHidden, :IsMasked, :MinLength, :MaxLength, :MinValue, :MaxValue, :StepValue,
                :ValidationPattern, :ValidationMessage, :DefaultValue,
                :Options, :OptionsApiEndpoint, :OptionsApiPath, :OptionsLayout,
                :GridColumns, :MinSelections, :MaxSelections,
                :DigitCount, :TextAreaLines,
                :MinDate, :MaxDate, :DateFormat, :TimeFormat,
                :AllowedFileTypes, :MaxFileSize, :AllowCamera, :AllowGallery,
                :MaxRating, :AllowHalfRating, :OnText, :OffText,
                :Prefix, :Suffix, :InputMask, :AutoFormat,
                :CurrencyCode, :DecimalPlaces,
                :FieldGroup, :FieldOrder, :StepNumber, :FieldWidth,
                :VisibilityCondition, :RequiredCondition,
                :TriggerLookup, :LookupDebounceMs, :LookupMinLength,
                :LookupEndpoint, :LookupFieldMapping,
                :ClearDependentsOnChange, :DependentFields,
                :CssClass, :ExtraConfig,
                :Status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :CreatedBy, :UpdatedBy
            )
        `;

        const binds: Record<string, any> = {
            FieldId: fieldId,
            ProviderId: params.providerId,
            FieldKey: body.FieldKey,
            Label: body.Label,
            Placeholder: toBind('Placeholder', body.Placeholder),
            HelperText: toBind('HelperText', body.HelperText),
            FieldType: body.FieldType || 'text',
            KeyboardType: body.KeyboardType || 'text',
            IconName: toBind('IconName', body.IconName),
            IsRequired: toBind('IsRequired', body.IsRequired),
            IsReadOnly: toBind('IsReadOnly', body.IsReadOnly),
            IsHidden: toBind('IsHidden', body.IsHidden),
            IsMasked: toBind('IsMasked', body.IsMasked),
            MinLength: toBind('MinLength', body.MinLength),
            MaxLength: toBind('MaxLength', body.MaxLength),
            MinValue: toBind('MinValue', body.MinValue),
            MaxValue: toBind('MaxValue', body.MaxValue),
            StepValue: toBind('StepValue', body.StepValue),
            ValidationPattern: toBind('ValidationPattern', body.ValidationPattern),
            ValidationMessage: toBind('ValidationMessage', body.ValidationMessage),
            DefaultValue: toBind('DefaultValue', body.DefaultValue),
            Options: toBind('Options', body.Options),
            OptionsApiEndpoint: toBind('OptionsApiEndpoint', body.OptionsApiEndpoint),
            OptionsApiPath: toBind('OptionsApiPath', body.OptionsApiPath),
            OptionsLayout: body.OptionsLayout || 'vertical',
            GridColumns: toBind('GridColumns', body.GridColumns),
            MinSelections: toBind('MinSelections', body.MinSelections),
            MaxSelections: toBind('MaxSelections', body.MaxSelections),
            DigitCount: toBind('DigitCount', body.DigitCount),
            TextAreaLines: toBind('TextAreaLines', body.TextAreaLines),
            MinDate: toBind('MinDate', body.MinDate),
            MaxDate: toBind('MaxDate', body.MaxDate),
            DateFormat: toBind('DateFormat', body.DateFormat),
            TimeFormat: toBind('TimeFormat', body.TimeFormat),
            AllowedFileTypes: toBind('AllowedFileTypes', body.AllowedFileTypes),
            MaxFileSize: toBind('MaxFileSize', body.MaxFileSize),
            AllowCamera: toBind('AllowCamera', body.AllowCamera),
            AllowGallery: toBind('AllowGallery', body.AllowGallery),
            MaxRating: toBind('MaxRating', body.MaxRating),
            AllowHalfRating: toBind('AllowHalfRating', body.AllowHalfRating),
            OnText: toBind('OnText', body.OnText),
            OffText: toBind('OffText', body.OffText),
            Prefix: toBind('Prefix', body.Prefix),
            Suffix: toBind('Suffix', body.Suffix),
            InputMask: toBind('InputMask', body.InputMask),
            AutoFormat: toBind('AutoFormat', body.AutoFormat),
            CurrencyCode: body.CurrencyCode || 'ETB',
            DecimalPlaces: toBind('DecimalPlaces', body.DecimalPlaces),
            FieldGroup: toBind('FieldGroup', body.FieldGroup),
            FieldOrder: toBind('FieldOrder', body.FieldOrder) ?? 0,
            StepNumber: toBind('StepNumber', body.StepNumber) ?? 1,
            FieldWidth: body.FieldWidth || 'full',
            VisibilityCondition: toBind('VisibilityCondition', body.VisibilityCondition),
            RequiredCondition: toBind('RequiredCondition', body.RequiredCondition),
            TriggerLookup: toBind('TriggerLookup', body.TriggerLookup),
            LookupDebounceMs: toBind('LookupDebounceMs', body.LookupDebounceMs),
            LookupMinLength: toBind('LookupMinLength', body.LookupMinLength),
            LookupEndpoint: toBind('LookupEndpoint', body.LookupEndpoint),
            LookupFieldMapping: toBind('LookupFieldMapping', body.LookupFieldMapping),
            ClearDependentsOnChange: toBind('ClearDependentsOnChange', body.ClearDependentsOnChange),
            DependentFields: toBind('DependentFields', body.DependentFields),
            CssClass: toBind('CssClass', body.CssClass),
            ExtraConfig: toBind('ExtraConfig', body.ExtraConfig),
            Status: body.Status || 'Active',
            CreatedBy: body.CreatedBy || 'admin',
            UpdatedBy: body.UpdatedBy || 'admin',
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

        const setFields: string[] = [];
        const binds: Record<string, any> = { FieldId, ProviderId: params.providerId };

        for (const [key, value] of Object.entries(updateData)) {
            if (EXCLUDE_KEYS.includes(key)) continue;
            setFields.push(`"${key}" = :${key}`);
            binds[key] = toBind(key, value);
        }

        if (setFields.length === 0) return NextResponse.json({ message: "No fields to update" }, { status: 400 });

        const query = `UPDATE ${TABLE} SET ${setFields.join(', ')}, "UpdatedAt" = CURRENT_TIMESTAMP, "UpdatedBy" = :UpdatedBy WHERE "FieldId" = :FieldId AND "ProviderId" = :ProviderId`;
        binds.UpdatedBy = body.UpdatedBy || 'admin';

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update form field:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "FieldId" = :id AND "ProviderId" = :providerId`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id, providerId: params.providerId });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete form field:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
