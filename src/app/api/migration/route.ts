import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requireAuthenticatedSession } from '@/lib/auth-utils';
import crypto from 'crypto';

const SESSION_STATUS_MAP: Record<string, string> = {
  '0': 'Initiated',
  '1': 'CredentialsVerified',
  '2': 'OtpSent',
  '3': 'OtpVerified',
  '4': 'Onboarding',
  '5': 'Completed',
  '6': 'Failed',
  '7': 'Expired',
};

const STEP_STATUS_MAP: Record<string, string> = {
  '0': 'Pending',
  '1': 'Success',
  '2': 'Failed',
  '3': 'Skipped',
};

const ATTEMPT_TYPE_MAP: Record<string, string> = {
  '0': 'CredentialVerify',
  '1': 'OtpVerify',
  '2': 'OtpResend',
};

function normalizeSessionStatus(val: any): string {
  if (val === null || val === undefined) return 'Initiated';
  const s = String(val).trim();
  return SESSION_STATUS_MAP[s] || s;
}

function normalizeStepStatus(val: any): string {
  if (val === null || val === undefined) return 'Pending';
  const s = String(val).trim();
  return STEP_STATUS_MAP[s] || s;
}

function normalizeAttemptType(val: any): string {
  if (val === null || val === undefined) return 'CredentialVerify';
  const s = String(val).trim();
  return ATTEMPT_TYPE_MAP[s] || s;
}

function toBool(val: any): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const v = val.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'y' || v === 'yes';
  }
  return false;
}

function toIso(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? String(val) : parsed.toISOString();
}

function getMigrationConnString(): string | undefined {
  return (
    process.env.MIGRATION_MODULE_DB_CONNECTION_STRING ||
    'MIGRATION_MODULE/W0rk$4BanK$@10.1.1.165:2483/SPRAPDB'
  );
}

/**
 * GET /api/migration
 * - ?sessionId=xxx -> Returns step logs & attempts for a specific MigrationSession
 * - Otherwise -> Returns KPI stats, whitelists (including migrated & pending), and migration sessions
 */
export async function GET(req: Request) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId')?.trim();
  const search = searchParams.get('q')?.trim().toLowerCase() || '';
  const connStr = getMigrationConnString();

  // ─── Mode 1: Drill-down into a specific MigrationSession's StepLogs & Attempts ───
  if (sessionId) {
    try {
      const [stepsRes, attemptsRes] = await Promise.all([
        executeQuery(
          connStr,
          `SELECT "Id", "SessionId", "StepName", "StepOrder", "Status",
                  "ErrorMessage", "StartedAt", "CompletedAt"
           FROM "MIGRATION_MODULE"."MigrationStepLogs"
           WHERE "SessionId" = :sessionId
           ORDER BY "StepOrder" ASC, "StartedAt" ASC`,
          { sessionId }
        ),
        executeQuery(
          connStr,
          `SELECT "Id", "SessionId", "AttemptType", "IsSuccessful",
                  "FailureReason", "IpAddress", "AttemptedAt"
           FROM "MIGRATION_MODULE"."MigrationAttempts"
           WHERE "SessionId" = :sessionId
           ORDER BY "AttemptedAt" DESC`,
          { sessionId }
        ),
      ]);

      const stepLogs = (stepsRes?.rows || []).map((r: any) => ({
        id: r.Id || r.ID,
        sessionId: r.SessionId || r.SESSIONID,
        stepName: r.StepName || r.STEPNAME || 'Unknown Step',
        stepOrder: Number(r.StepOrder ?? r.STEPORDER ?? 0),
        status: normalizeStepStatus(r.Status ?? r.STATUS),
        errorMessage: r.ErrorMessage ?? r.ERRORMESSAGE ?? null,
        startedAt: toIso(r.StartedAt ?? r.STARTEDAT),
        completedAt: toIso(r.CompletedAt ?? r.COMPLETEDAT),
      }));

      const attempts = (attemptsRes?.rows || []).map((r: any) => ({
        id: r.Id || r.ID,
        sessionId: r.SessionId || r.SESSIONID,
        attemptType: normalizeAttemptType(r.AttemptType ?? r.ATTEMPTTYPE),
        isSuccessful: toBool(r.IsSuccessful ?? r.ISSUCCESSFUL),
        failureReason: r.FailureReason ?? r.FAILUREREASON ?? null,
        ipAddress: r.IpAddress ?? r.IPADDRESS ?? null,
        attemptedAt: toIso(r.AttemptedAt ?? r.ATTEMPTEDAT),
      }));

      return NextResponse.json({ stepLogs, attempts });
    } catch (error: any) {
      console.error('[MigrationAPI] Failed to load session details:', error);
      return NextResponse.json(
        {
          stepLogs: [],
          attempts: [],
          message: error.message || 'Failed to load session step logs and attempts',
        },
        { status: 500 }
      );
    }
  }

  // ─── Mode 2: Full Migration Overview (Whitelists, Migrated Users, Sessions & KPIs) ───
  try {
    const [whitelistStatsRes, sessionStatsRes, whitelistsRes, sessionsRes] =
      await Promise.all([
        executeQuery(
          connStr,
          `SELECT
             COUNT(*) AS "TotalRows",
             SUM(CASE WHEN "IsAllowed" = 1 THEN 1 ELSE 0 END) AS "AllowedCount",
             SUM(CASE WHEN "IsMigrated" = 1 THEN 1 ELSE 0 END) AS "MigratedCount",
             SUM(CASE WHEN "IsAllowed" = 1 AND "IsMigrated" = 0 THEN 1 ELSE 0 END) AS "PendingCount",
             SUM(CASE WHEN "IsAllowed" = 0 THEN 1 ELSE 0 END) AS "BlockedCount"
           FROM "MIGRATION_MODULE"."MigrationWhitelists"`
        ),
        executeQuery(
          connStr,
          `SELECT
             COUNT(*) AS "TotalSessions",
             SUM(CASE WHEN "Status" IN ('Completed', '5') THEN 1 ELSE 0 END) AS "CompletedSessions",
             SUM(CASE WHEN "Status" IN ('Failed', '6', 'Expired', '7') THEN 1 ELSE 0 END) AS "FailedSessions",
             SUM(CASE WHEN "Status" NOT IN ('Completed', '5', 'Failed', '6', 'Expired', '7') THEN 1 ELSE 0 END) AS "ActiveSessions"
           FROM "MIGRATION_MODULE"."MigrationSessions"`
        ),
        executeQuery(
          connStr,
          search
            ? `SELECT "Id", "HostAccountId", "BankworldUsername", "CIFNumber",
                      "PhoneNumber", "Email", "IsAllowed", "IsMigrated",
                      "MigratedAt", "Remarks", "InsertDate", "UpdateDate",
                      "InsertUser", "UpdateUser"
               FROM "MIGRATION_MODULE"."MigrationWhitelists"
               WHERE LOWER("HostAccountId") LIKE :q
                  OR LOWER(NVL("BankworldUsername", '')) LIKE :q
                  OR LOWER(NVL("CIFNumber", '')) LIKE :q
                  OR LOWER(NVL("PhoneNumber", '')) LIKE :q
                  OR LOWER(NVL("Email", '')) LIKE :q
               ORDER BY "IsMigrated" DESC, "MigratedAt" DESC NULLS LAST, "InsertDate" DESC NULLS LAST
               FETCH FIRST 300 ROWS ONLY`
            : `SELECT "Id", "HostAccountId", "BankworldUsername", "CIFNumber",
                      "PhoneNumber", "Email", "IsAllowed", "IsMigrated",
                      "MigratedAt", "Remarks", "InsertDate", "UpdateDate",
                      "InsertUser", "UpdateUser"
               FROM "MIGRATION_MODULE"."MigrationWhitelists"
               ORDER BY "IsMigrated" DESC, "MigratedAt" DESC NULLS LAST, "InsertDate" DESC NULLS LAST
               FETCH FIRST 300 ROWS ONLY`,
          search ? { q: `%${search}%` } : []
        ),
        executeQuery(
          connStr,
          search
            ? `SELECT s."Id", s."HostAccountId", s."BankworldUsername", s."CIFNumber",
                      s."Status", s."CurrentStep", s."IpAddress", s."UserAgent",
                      s."NotificationTarget", s."NotificationType",
                      s."CreatedAt", s."UpdatedAt", s."ExpiresAt", s."CompletedAt",
                      s."FailureReason",
                      (SELECT COUNT(*) FROM "MIGRATION_MODULE"."MigrationStepLogs" l WHERE l."SessionId" = s."Id") AS "StepCount",
                      (SELECT COUNT(*) FROM "MIGRATION_MODULE"."MigrationAttempts" a WHERE a."SessionId" = s."Id") AS "AttemptCount"
               FROM "MIGRATION_MODULE"."MigrationSessions" s
               WHERE LOWER(s."HostAccountId") LIKE :q
                  OR LOWER(NVL(s."BankworldUsername", '')) LIKE :q
                  OR LOWER(NVL(s."CIFNumber", '')) LIKE :q
                  OR LOWER(NVL(s."NotificationTarget", '')) LIKE :q
               ORDER BY s."CreatedAt" DESC NULLS LAST
               FETCH FIRST 200 ROWS ONLY`
            : `SELECT s."Id", s."HostAccountId", s."BankworldUsername", s."CIFNumber",
                      s."Status", s."CurrentStep", s."IpAddress", s."UserAgent",
                      s."NotificationTarget", s."NotificationType",
                      s."CreatedAt", s."UpdatedAt", s."ExpiresAt", s."CompletedAt",
                      s."FailureReason",
                      (SELECT COUNT(*) FROM "MIGRATION_MODULE"."MigrationStepLogs" l WHERE l."SessionId" = s."Id") AS "StepCount",
                      (SELECT COUNT(*) FROM "MIGRATION_MODULE"."MigrationAttempts" a WHERE a."SessionId" = s."Id") AS "AttemptCount"
               FROM "MIGRATION_MODULE"."MigrationSessions" s
               ORDER BY s."CreatedAt" DESC NULLS LAST
               FETCH FIRST 200 ROWS ONLY`,
          search ? { q: `%${search}%` } : []
        ),
      ]);

    const wStat = whitelistStatsRes?.rows?.[0] || {};
    const sStat = sessionStatsRes?.rows?.[0] || {};

    const totalWhitelisted = Number(wStat.TotalRows ?? wStat.TOTALROWS ?? 0);
    const allowedCount = Number(wStat.AllowedCount ?? wStat.ALLOWEDCOUNT ?? 0);
    const migratedCount = Number(wStat.MigratedCount ?? wStat.MIGRATEDCOUNT ?? 0);
    const pendingCount = Number(wStat.PendingCount ?? wStat.PENDINGCOUNT ?? 0);
    const blockedCount = Number(wStat.BlockedCount ?? wStat.BLOCKEDCOUNT ?? 0);

    const totalSessions = Number(sStat.TotalSessions ?? sStat.TOTALSESSIONS ?? 0);
    const completedSessions = Number(sStat.CompletedSessions ?? sStat.COMPLETEDSESSIONS ?? 0);
    const failedSessions = Number(sStat.FailedSessions ?? sStat.FAILEDSESSIONS ?? 0);
    const activeSessions = Number(sStat.ActiveSessions ?? sStat.ACTIVESESSIONS ?? 0);

    const whitelists = (whitelistsRes?.rows || []).map((r: any) => ({
      id: r.Id || r.ID,
      hostAccountId: r.HostAccountId || r.HOSTACCOUNTID || '',
      bankworldUsername: r.BankworldUsername ?? r.BANKWORLDUSERNAME ?? null,
      cifNumber: r.CIFNumber ?? r.CIFNUMBER ?? null,
      phoneNumber: r.PhoneNumber ?? r.PHONENUMBER ?? null,
      email: r.Email ?? r.EMAIL ?? null,
      isAllowed: toBool(r.IsAllowed ?? r.ISALLOWED),
      isMigrated: toBool(r.IsMigrated ?? r.ISMIGRATED),
      migratedAt: toIso(r.MigratedAt ?? r.MIGRATEDAT),
      remarks: r.Remarks ?? r.REMARKS ?? null,
      insertDate: toIso(r.InsertDate ?? r.INSERTDATE),
      updateDate: toIso(r.UpdateDate ?? r.UPDATEDATE),
      insertUser: r.InsertUser ?? r.INSERTUSER ?? 'SYSTEM',
      updateUser: r.UpdateUser ?? r.UPDATEUSER ?? 'SYSTEM',
    }));

    const sessions = (sessionsRes?.rows || []).map((r: any) => ({
      id: r.Id || r.ID,
      hostAccountId: r.HostAccountId || r.HOSTACCOUNTID || '',
      bankworldUsername: r.BankworldUsername ?? r.BANKWORLDUSERNAME ?? null,
      cifNumber: r.CIFNumber ?? r.CIFNUMBER ?? null,
      status: normalizeSessionStatus(r.Status ?? r.STATUS),
      currentStep: r.CurrentStep ?? r.CURRENTSTEP ?? null,
      ipAddress: r.IpAddress ?? r.IPADDRESS ?? null,
      userAgent: r.UserAgent ?? r.USERAGENT ?? null,
      notificationTarget: r.NotificationTarget ?? r.NOTIFICATIONTARGET ?? null,
      notificationType: r.NotificationType ?? r.NOTIFICATIONTYPE ?? null,
      createdAt: toIso(r.CreatedAt ?? r.CREATEDAT),
      updatedAt: toIso(r.UpdatedAt ?? r.UPDATEDAT),
      expiresAt: toIso(r.ExpiresAt ?? r.EXPIRESAT),
      completedAt: toIso(r.CompletedAt ?? r.COMPLETEDAT),
      failureReason: r.FailureReason ?? r.FAILUREREASON ?? null,
      stepCount: Number(r.StepCount ?? r.STEPCOUNT ?? 0),
      attemptCount: Number(r.AttemptCount ?? r.ATTEMPTCOUNT ?? 0),
    }));

    return NextResponse.json({
      stats: {
        totalWhitelisted,
        allowedCount,
        migratedCount,
        pendingCount,
        blockedCount,
        conversionRate:
          allowedCount > 0 ? Math.round((migratedCount / allowedCount) * 1000) / 10 : 0,
        totalSessions,
        completedSessions,
        failedSessions,
        activeSessions,
      },
      whitelists,
      sessions,
    });
  } catch (error: any) {
    console.error('[MigrationAPI] Query error:', error);
    return NextResponse.json(
      {
        stats: {
          totalWhitelisted: 0,
          allowedCount: 0,
          migratedCount: 0,
          pendingCount: 0,
          blockedCount: 0,
          conversionRate: 0,
          totalSessions: 0,
          completedSessions: 0,
          failedSessions: 0,
          activeSessions: 0,
        },
        whitelists: [],
        sessions: [],
        error: error.message || 'Failed to connect to MIGRATION_MODULE database',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/migration
 * Adds a customer record to "MIGRATION_MODULE"."MigrationWhitelists"
 */
export async function POST(req: Request) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const hostAccountId = (body.hostAccountId || '').trim();
    const bankworldUsername = (body.bankworldUsername || '').trim() || null;
    const cifNumber = (body.cifNumber || '').trim() || null;
    const phoneNumber = (body.phoneNumber || '').trim() || null;
    const email = (body.email || '').trim() || null;
    const remarks = (body.remarks || '').trim() || null;
    const isAllowed = body.isAllowed !== false ? 1 : 0;

    if (!hostAccountId) {
      return NextResponse.json(
        { message: 'HostAccountId is required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const actor = (session.user as any)?.email || (session.user as any)?.name || 'ADMIN';
    const connStr = getMigrationConnString();

    await executeQuery(
      connStr,
      `INSERT INTO "MIGRATION_MODULE"."MigrationWhitelists" (
         "Id", "HostAccountId", "BankworldUsername", "CIFNumber",
         "PhoneNumber", "Email", "IsAllowed", "IsMigrated",
         "Remarks", "InsertDate", "UpdateDate", "InsertUser", "UpdateUser"
       ) VALUES (
         :id, :hostAccountId, :bankworldUsername, :cifNumber,
         :phoneNumber, :email, :isAllowed, 0,
         :remarks, SYSTIMESTAMP, SYSTIMESTAMP, :actor, :actor
       )`,
      {
        id,
        hostAccountId,
        bankworldUsername,
        cifNumber,
        phoneNumber,
        email,
        isAllowed,
        remarks,
        actor,
      }
    );

    return NextResponse.json({
      success: true,
      id,
      message: `HostAccountId ${hostAccountId} added to Migration Whitelist.`,
    });
  } catch (error: any) {
    console.error('[MigrationAPI] POST whitelist failed:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to add entry to Migration Whitelist' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/migration
 * Toggles IsAllowed or updates Remarks on "MIGRATION_MODULE"."MigrationWhitelists"
 */
export async function PATCH(req: Request) {
  const session = await requireAuthenticatedSession();
  if (session instanceof NextResponse) return session;

  try {
    const body = await req.json();
    const id = (body.id || '').trim();
    if (!id) {
      return NextResponse.json({ message: 'Whitelist Id is required' }, { status: 400 });
    }

    const isAllowed = body.isAllowed ? 1 : 0;
    const remarks = body.remarks !== undefined ? body.remarks : null;
    const actor = (session.user as any)?.email || (session.user as any)?.name || 'ADMIN';
    const connStr = getMigrationConnString();

    await executeQuery(
      connStr,
      `UPDATE "MIGRATION_MODULE"."MigrationWhitelists"
       SET "IsAllowed" = :isAllowed,
           "Remarks" = COALESCE(:remarks, "Remarks"),
           "UpdateDate" = SYSTIMESTAMP,
           "UpdateUser" = :actor
       WHERE "Id" = :id`,
      { isAllowed, remarks, actor, id }
    );

    return NextResponse.json({
      success: true,
      message: `Whitelist status updated (${isAllowed === 1 ? 'Allowed' : 'Blocked'}).`,
    });
  } catch (error: any) {
    console.error('[MigrationAPI] PATCH whitelist failed:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update whitelist entry' },
      { status: 500 }
    );
  }
}
