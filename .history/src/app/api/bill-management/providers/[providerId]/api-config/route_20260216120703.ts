import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillApiConfig"`;

export async function POST(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const body = await req.json();
        const configId = `api-${crypto.randomUUID().slice(0, 8)}`;

        const query = `
            INSERT INTO ${TABLE} (
                "ConfigId", "ProviderId", "ApiType", "DisplayName", "Endpoint",
                "HttpMethod", "ContentType", "RequestHeaders", "RequestBodyTemplate",
                "QueryParameters", "ResponseMapping", "SuccessStatusPath",
                "SuccessStatusValues", "ErrorMessagePath", "DefaultErrorMessage",
                "TimeoutSeconds", "RetryCount", "RetryDelayMs", "CacheResponse",
                "CacheDurationSeconds", "UseProxy", "ProxyConfigId", "EnableLogging",
                "MaskSensitiveData", "SensitiveFields", "PreRequestValidation",
                "PostResponseTransform", "MockResponse", "MockEnabled",
                "ExecutionOrder", "Status", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy"
            )
            VALUES (
                :ConfigId, :ProviderId, :ApiType, :DisplayName, :Endpoint,
                :HttpMethod, :ContentType, :RequestHeaders, :RequestBodyTemplate,
                :QueryParameters, :ResponseMapping, :SuccessStatusPath,
                :SuccessStatusValues, :ErrorMessagePath, :DefaultErrorMessage,
                :TimeoutSeconds, :RetryCount, :RetryDelayMs, :CacheResponse,
                :CacheDurationSeconds, :UseProxy, :ProxyConfigId, :EnableLogging,
                :MaskSensitiveData, :SensitiveFields, :PreRequestValidation,
                :PostResponseTransform, :MockResponse, :MockEnabled,
                :ExecutionOrder, :Status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :CreatedBy, :UpdatedBy
            )
        `;

        const binds = {
            ConfigId: configId,
            ProviderId: params.providerId,
            ApiType: body.ApiType || 'lookup',
            DisplayName: body.DisplayName || null,
            Endpoint: body.Endpoint,
            HttpMethod: body.HttpMethod || 'POST',
            ContentType: body.ContentType || 'application/json',
            RequestHeaders: body.RequestHeaders || null,
            RequestBodyTemplate: body.RequestBodyTemplate || null,
            QueryParameters: body.QueryParameters || null,
            ResponseMapping: body.ResponseMapping || null,
            SuccessStatusPath: body.SuccessStatusPath || null,
            SuccessStatusValues: body.SuccessStatusValues || null,
            ErrorMessagePath: body.ErrorMessagePath || null,
            DefaultErrorMessage: body.DefaultErrorMessage || null,
            TimeoutSeconds: parseInt(body.TimeoutSeconds, 10) || 30,
            RetryCount: parseInt(body.RetryCount, 10) || 0,
            RetryDelayMs: parseInt(body.RetryDelayMs, 10) || 1000,
            CacheResponse: body.CacheResponse ? 1 : 0,
            CacheDurationSeconds: parseInt(body.CacheDurationSeconds, 10) || 0,
            UseProxy: body.UseProxy ? 1 : 0,
            ProxyConfigId: body.ProxyConfigId || null,
            EnableLogging: body.EnableLogging !== false ? 1 : 0,
            MaskSensitiveData: body.MaskSensitiveData ? 1 : 0,
            SensitiveFields: body.SensitiveFields || null,
            PreRequestValidation: body.PreRequestValidation || null,
            PostResponseTransform: body.PostResponseTransform || null,
            MockResponse: body.MockResponse || null,
            MockEnabled: body.MockEnabled ? 1 : 0,
            ExecutionOrder: parseInt(body.ExecutionOrder, 10) || 0,
            Status: body.Status || 'Active',
            CreatedBy: body.CreatedBy || 'admin',
            UpdatedBy: body.UpdatedBy || 'admin',
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true, ConfigId: configId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create API config:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const body = await req.json();
        const { ConfigId, ...updateData } = body;

        if (!ConfigId) return NextResponse.json({ message: "ConfigId is required" }, { status: 400 });

        const booleanFields = ['CacheResponse', 'UseProxy', 'EnableLogging', 'MaskSensitiveData', 'MockEnabled'];
        const intFields = ['TimeoutSeconds', 'RetryCount', 'RetryDelayMs', 'CacheDurationSeconds', 'ExecutionOrder'];
        const excludeKeys = ['ConfigId', 'ProviderId', 'CreatedAt', 'CreatedBy'];

        const setFields: string[] = [];
        const binds: any = { ConfigId, ProviderId: params.providerId };

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

        const query = `UPDATE ${TABLE} SET ${setFields.join(', ')}, "UpdatedAt" = CURRENT_TIMESTAMP, "UpdatedBy" = :UpdatedBy WHERE "ConfigId" = :ConfigId AND "ProviderId" = :ProviderId`;
        binds.UpdatedBy = body.UpdatedBy || 'admin';

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update API config:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { providerId: string } }) {
    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "ConfigId" = :id AND "ProviderId" = :providerId`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id, providerId: params.providerId });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete API config:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
