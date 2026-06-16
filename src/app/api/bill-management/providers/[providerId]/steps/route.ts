import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import crypto from 'crypto';

import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
const SCHEMA = "APP_CONTROL_MODULE";
const TABLE = `"${SCHEMA}"."BillFlowStep"`;

export async function GET(req: Request, { params }: { params: { providerId: string } }) {
  const _authSession = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;

    try {
        const query = `SELECT * FROM ${TABLE} WHERE "ProviderId" = :providerId ORDER BY "StepOrder"`;
        const result = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { providerId: params.providerId });
        return NextResponse.json(result.rows || []);
    } catch (error: any) {
        console.error("Failed to fetch flow steps:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { providerId: string } }) {
  const _authSession = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;

    try {
        const body = await req.json();
        const stepId = `step-${crypto.randomUUID().slice(0, 8)}`;

        const query = `
            INSERT INTO ${TABLE} (
                "StepId", "ProviderId", "StepOrder", "StepType", "Title", "Subtitle",
                "IconName", "PrimaryButtonText", "SecondaryButtonText", "ApiEndpoint",
                "ApiMethod", "RequestTemplate", "ResponseMapping", "SuccessCondition",
                "ErrorMessagePath", "ShowLoading", "LoadingMessage", "RequiresAuth",
                "AuthType", "NextStepOnSuccess", "NextStepOnError", "CanGoBack",
                "SkipCondition", "Layout", "BackgroundColor", "CustomComponent",
                "ExtraConfig", "Status", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy"
            )
            VALUES (
                :StepId, :ProviderId, :StepOrder, :StepType, :Title, :Subtitle,
                :IconName, :PrimaryButtonText, :SecondaryButtonText, :ApiEndpoint,
                :ApiMethod, :RequestTemplate, :ResponseMapping, :SuccessCondition,
                :ErrorMessagePath, :ShowLoading, :LoadingMessage, :RequiresAuth,
                :AuthType, :NextStepOnSuccess, :NextStepOnError, :CanGoBack,
                :SkipCondition, :Layout, :BackgroundColor, :CustomComponent,
                :ExtraConfig, :Status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :CreatedBy, :UpdatedBy
            )
        `;

        const binds = {
            StepId: stepId,
            ProviderId: params.providerId,
            StepOrder: parseInt(body.StepOrder, 10) || 1,
            StepType: body.StepType || 'input',
            Title: body.Title,
            Subtitle: body.Subtitle || null,
            IconName: body.IconName || null,
            PrimaryButtonText: body.PrimaryButtonText || 'Continue',
            SecondaryButtonText: body.SecondaryButtonText || null,
            ApiEndpoint: body.ApiEndpoint || null,
            ApiMethod: body.ApiMethod || null,
            RequestTemplate: body.RequestTemplate || null,
            ResponseMapping: body.ResponseMapping || null,
            SuccessCondition: body.SuccessCondition || null,
            ErrorMessagePath: body.ErrorMessagePath || null,
            ShowLoading: body.ShowLoading ? 1 : 0,
            LoadingMessage: body.LoadingMessage || null,
            RequiresAuth: body.RequiresAuth ? 1 : 0,
            AuthType: body.AuthType || null,
            NextStepOnSuccess: body.NextStepOnSuccess || null,
            NextStepOnError: body.NextStepOnError || null,
            CanGoBack: body.CanGoBack !== false ? 1 : 0,
            SkipCondition: body.SkipCondition || null,
            Layout: body.Layout || 'standard',
            BackgroundColor: body.BackgroundColor || null,
            CustomComponent: body.CustomComponent || null,
            ExtraConfig: body.ExtraConfig || null,
            Status: body.Status || 'Active',
            CreatedBy: body.CreatedBy || 'admin',
            UpdatedBy: body.UpdatedBy || 'admin',
        };

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true, StepId: stepId }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create flow step:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { providerId: string } }) {
  const _authSession = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;

    try {
        const body = await req.json();
        const { StepId, ...updateData } = body;

        if (!StepId) return NextResponse.json({ message: "StepId is required" }, { status: 400 });

        // Build dynamic SET clause - exclude non-column keys
        const excludeKeys = ['StepId'];
        const setFields: string[] = [];
        const binds: any = { StepId };

        for (const [key, value] of Object.entries(updateData)) {
            if (excludeKeys.includes(key)) continue;
            setFields.push(`"${key}" = :${key}`);

            // Convert booleans to 0/1 for Oracle
            if (['ShowLoading', 'RequiresAuth', 'CanGoBack'].includes(key)) {
                binds[key] = value ? 1 : 0;
            } else if (['StepOrder'].includes(key)) {
                binds[key] = parseInt(String(value), 10) || 0;
            } else {
                binds[key] = value ?? null;
            }
        }

        if (setFields.length === 0) return NextResponse.json({ message: "No fields to update" }, { status: 400 });

        const query = `UPDATE ${TABLE} SET ${setFields.join(', ')}, "UpdatedAt" = CURRENT_TIMESTAMP, "UpdatedBy" = :UpdatedBy WHERE "StepId" = :StepId AND "ProviderId" = :ProviderId`;
        binds.UpdatedBy = body.UpdatedBy || 'admin';
        binds.ProviderId = params.providerId;

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update flow step:", error);
        return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { providerId: string } }) {
  const _authSession = await requirePermission(PERMISSIONS.APP_CONTROL_MANAGE);
  if (_authSession instanceof NextResponse) return _authSession;

    try {
        const { id } = await req.json();
        const query = `DELETE FROM ${TABLE} WHERE "StepId" = :id AND "ProviderId" = :providerId`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id, providerId: params.providerId });
        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error("Failed to delete flow step:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
