import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

const CS = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
const CFG = '"WSO2_MODULE"."WSO2_CONFIGURATIONS"';
const CRED = '"WSO2_MODULE"."WSO2_OAUTH_CREDENTIALS"';
const LOGS = '"WSO2_MODULE"."WSO2_REQUEST_LOGS"';

const SUCCESS_COND = `UPPER(TRIM(STATUS)) IN ('SUCCESS', 'COMPLETED', 'OK', '200')`;
const FAIL_COND = `(UPPER(TRIM(STATUS)) IN ('FAILED', 'ERROR', 'FAILURE', 'TIMEOUT', 'REJECTED') OR HTTP_STATUS_CODE >= 400)`;
const PENDING_COND = `UPPER(TRIM(STATUS)) IN ('PENDING', 'IN_PROGRESS', 'PROCESSING', 'INITIATED')`;

async function safeOracleQuery(sql: string, binds: Record<string, any> = {}) {
  if (!CS) return { rows: [], ok: false };
  try {
    const res: any = await executeQuery(CS, sql, binds);
    return { rows: res?.rows || [], ok: true };
  } catch (err: any) {
    console.error('[WSO2 Stats Query Error]:', err?.message || err, '\nSQL:', sql);
    return { rows: [], ok: false, error: err?.message };
  }
}

export async function GET(req: Request) {
  const session = await requirePermission(PERMISSIONS.SECURITY_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = (searchParams.get('date') || '').trim(); // YYYY-MM-DD (defaults to today)
    const daysParam = Math.min(Math.max(parseInt(searchParams.get('days') || '15', 10), 1), 60);

    const isCustomDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
    const dayStartExpr = isCustomDate
      ? `TO_TIMESTAMP(:reportDate, 'YYYY-MM-DD')`
      : `TRUNC(SYSTIMESTAMP)`;
    const dayEndExpr = isCustomDate
      ? `TO_TIMESTAMP(:reportDate, 'YYYY-MM-DD') + INTERVAL '1' DAY`
      : `TRUNC(SYSTIMESTAMP) + INTERVAL '1' DAY`;
    const dateBinds = isCustomDate ? { reportDate: dateParam } : {};

    // Batch 1: Core KPI counts & Selected Day summary
    const [configStats, credStats, selectedDaySummary, allTimeSummary] = await Promise.all([
      safeOracleQuery(`
        SELECT
          COUNT(*) AS TOTAL,
          SUM(CASE WHEN IS_ACTIVE = 1 THEN 1 ELSE 0 END) AS ACTIVE,
          SUM(CASE WHEN IS_ACTIVE = 0 THEN 1 ELSE 0 END) AS INACTIVE
        FROM ${CFG}
      `),
      safeOracleQuery(`
        SELECT
          COUNT(*) AS TOTAL,
          SUM(CASE WHEN IS_ACTIVE = 1 THEN 1 ELSE 0 END) AS ACTIVE
        FROM ${CRED}
      `),
      safeOracleQuery(
        `
        SELECT
          COUNT(*) AS TOTAL,
          SUM(CASE WHEN ${SUCCESS_COND} THEN 1 ELSE 0 END) AS SUCCESSES,
          SUM(CASE WHEN ${FAIL_COND} THEN 1 ELSE 0 END) AS FAILURES,
          SUM(CASE WHEN ${PENDING_COND} THEN 1 ELSE 0 END) AS PENDING,
          ROUND(AVG("EXECUTION_TIME_MS")) AS AVG_MS,
          MIN("EXECUTION_TIME_MS") AS MIN_MS,
          MAX("EXECUTION_TIME_MS") AS MAX_MS,
          COUNT(DISTINCT SERVICE_NAME) AS UNIQUE_SERVICES
        FROM ${LOGS}
        WHERE CREATED_DATE >= ${dayStartExpr}
          AND CREATED_DATE < ${dayEndExpr}
        `,
        dateBinds
      ),
      safeOracleQuery(`
        SELECT
          COUNT(*) AS TOTAL,
          SUM(CASE WHEN CREATED_DATE >= SYSTIMESTAMP - INTERVAL '15' DAY THEN 1 ELSE 0 END) AS LAST_15D_TOTAL
        FROM ${LOGS}
      `),
    ]);

    // Batch 2: Daily Report Breakdowns (Daily Volume Trend, Daily Service Report for selected date, Hourly Distribution for selected date, Status Breakdown)
    const [dailyVolume, dailyServiceReport, hourlyVolume, statusBreakdown, methodBreakdown] =
      await Promise.all([
        safeOracleQuery(`
          SELECT
            TO_CHAR(TRUNC(CREATED_DATE), 'YYYY-MM-DD') AS LOG_DATE,
            COUNT(*) AS TOTAL,
            SUM(CASE WHEN ${SUCCESS_COND} THEN 1 ELSE 0 END) AS SUCCESSES,
            SUM(CASE WHEN ${FAIL_COND} THEN 1 ELSE 0 END) AS FAILURES,
            SUM(CASE WHEN ${PENDING_COND} THEN 1 ELSE 0 END) AS PENDING,
            ROUND(AVG("EXECUTION_TIME_MS")) AS AVG_MS,
            COUNT(DISTINCT SERVICE_NAME) AS UNIQUE_SERVICES
          FROM ${LOGS}
          WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${daysParam}' DAY
          GROUP BY TRUNC(CREATED_DATE)
          ORDER BY TRUNC(CREATED_DATE) ASC
        `),
        safeOracleQuery(
          `
          SELECT
            NVL(TRIM(SERVICE_NAME), 'UNKNOWN_SERVICE') AS SERVICE_NAME,
            MAX(ENDPOINT_URL) AS ENDPOINT_URL,
            MAX(HTTP_METHOD) AS HTTP_METHOD,
            COUNT(*) AS TOTAL_CALLS,
            SUM(CASE WHEN ${SUCCESS_COND} THEN 1 ELSE 0 END) AS SUCCESS_COUNT,
            SUM(CASE WHEN ${FAIL_COND} THEN 1 ELSE 0 END) AS FAIL_COUNT,
            SUM(CASE WHEN ${PENDING_COND} THEN 1 ELSE 0 END) AS PENDING_COUNT,
            ROUND(AVG("EXECUTION_TIME_MS")) AS AVG_MS,
            MIN("EXECUTION_TIME_MS") AS MIN_MS,
            MAX("EXECUTION_TIME_MS") AS MAX_MS,
            MAX(CREATED_DATE) AS LAST_CALLED_AT
          FROM ${LOGS}
          WHERE CREATED_DATE >= ${dayStartExpr}
            AND CREATED_DATE < ${dayEndExpr}
          GROUP BY NVL(TRIM(SERVICE_NAME), 'UNKNOWN_SERVICE')
          ORDER BY TOTAL_CALLS DESC
          `,
          dateBinds
        ),
        safeOracleQuery(
          `
          SELECT
            TO_CHAR(CREATED_DATE, 'HH24') AS HOUR_OF_DAY,
            COUNT(*) AS CNT,
            SUM(CASE WHEN ${SUCCESS_COND} THEN 1 ELSE 0 END) AS SUCCESSES,
            SUM(CASE WHEN ${FAIL_COND} THEN 1 ELSE 0 END) AS FAILURES,
            ROUND(AVG("EXECUTION_TIME_MS")) AS AVG_MS
          FROM ${LOGS}
          WHERE CREATED_DATE >= ${dayStartExpr}
            AND CREATED_DATE < ${dayEndExpr}
          GROUP BY TO_CHAR(CREATED_DATE, 'HH24')
          ORDER BY HOUR_OF_DAY ASC
          `,
          dateBinds
        ),
        safeOracleQuery(
          `
          SELECT
            UPPER(TRIM(NVL(STATUS, 'UNKNOWN'))) AS STATUS,
            COUNT(*) AS CNT
          FROM ${LOGS}
          WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${daysParam}' DAY
          GROUP BY UPPER(TRIM(NVL(STATUS, 'UNKNOWN')))
          ORDER BY CNT DESC
          `
        ),
        safeOracleQuery(`
          SELECT UPPER(TRIM(NVL(HTTP_METHOD, 'POST'))) AS HTTP_METHOD, COUNT(*) AS CNT
          FROM ${CFG}
          GROUP BY UPPER(TRIM(NVL(HTTP_METHOD, 'POST')))
          ORDER BY CNT DESC
        `),
      ]);

    // Batch 3: Endpoint League Tables (Oracle 11g/12c/19c universal ROWNUM subqueries) & Recent Errors for Selected Date
    const [
      slowestEndpoints,
      fastestEndpoints,
      mostFailedEndpoints,
      mostActiveEndpoints,
      avgResponseByService,
      recentErrors,
    ] = await Promise.all([
      safeOracleQuery(`
        SELECT * FROM (
          SELECT SERVICE_NAME, MAX(ENDPOINT_URL) AS ENDPOINT_URL,
            ROUND(AVG("EXECUTION_TIME_MS")) AS AVG_MS,
            MAX("EXECUTION_TIME_MS") AS MAX_MS,
            COUNT(*) AS CALL_COUNT
          FROM ${LOGS}
          WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${daysParam}' DAY
            AND "EXECUTION_TIME_MS" IS NOT NULL
          GROUP BY SERVICE_NAME
          ORDER BY AVG_MS DESC
        ) WHERE ROWNUM <= 5
      `),
      safeOracleQuery(`
        SELECT * FROM (
          SELECT SERVICE_NAME, MAX(ENDPOINT_URL) AS ENDPOINT_URL,
            ROUND(AVG("EXECUTION_TIME_MS")) AS AVG_MS,
            MIN("EXECUTION_TIME_MS") AS MIN_MS,
            COUNT(*) AS CALL_COUNT
          FROM ${LOGS}
          WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${daysParam}' DAY
            AND "EXECUTION_TIME_MS" IS NOT NULL
          GROUP BY SERVICE_NAME
          ORDER BY AVG_MS ASC
        ) WHERE ROWNUM <= 5
      `),
      safeOracleQuery(`
        SELECT * FROM (
          SELECT SERVICE_NAME, MAX(ENDPOINT_URL) AS ENDPOINT_URL,
            COUNT(*) AS FAIL_COUNT,
            COUNT(*) AS CALL_COUNT
          FROM ${LOGS}
          WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${daysParam}' DAY
            AND ${FAIL_COND}
          GROUP BY SERVICE_NAME
          ORDER BY FAIL_COUNT DESC
        ) WHERE ROWNUM <= 5
      `),
      safeOracleQuery(`
        SELECT * FROM (
          SELECT SERVICE_NAME, MAX(ENDPOINT_URL) AS ENDPOINT_URL, COUNT(*) AS CALL_COUNT
          FROM ${LOGS}
          WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${daysParam}' DAY
          GROUP BY SERVICE_NAME
          ORDER BY CALL_COUNT DESC
        ) WHERE ROWNUM <= 5
      `),
      safeOracleQuery(`
        SELECT SERVICE_NAME,
          ROUND(AVG("EXECUTION_TIME_MS")) AS AVG_MS,
          COUNT(*) AS CALL_COUNT,
          SUM(CASE WHEN ${FAIL_COND} THEN 1 ELSE 0 END) AS FAIL_COUNT
        FROM ${LOGS}
        WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${daysParam}' DAY
        GROUP BY SERVICE_NAME
        ORDER BY CALL_COUNT DESC
      `),
      safeOracleQuery(
        `
        SELECT * FROM (
          SELECT ID, REQUEST_ID, SERVICE_NAME, ENDPOINT_URL, HTTP_STATUS_CODE, STATUS, ERROR_CODE, REMARKS, EXECUTION_TIME_MS, CREATED_DATE
          FROM ${LOGS}
          WHERE ${FAIL_COND}
            AND CREATED_DATE >= ${dayStartExpr}
            AND CREATED_DATE < ${dayEndExpr}
          ORDER BY CREATED_DATE DESC
        ) WHERE ROWNUM <= 20
        `,
        dateBinds
      ),
    ]);

    const n = (r: any, key: string) => Number(r?.rows?.[0]?.[key] ?? 0);
    const dayTotal = n(selectedDaySummary, 'TOTAL');
    const daySuccesses = n(selectedDaySummary, 'SUCCESSES');
    const dayFailures = n(selectedDaySummary, 'FAILURES');
    const dayPending = n(selectedDaySummary, 'PENDING');

    return NextResponse.json({
      reportDate: isCustomDate ? dateParam : new Date().toISOString().split('T')[0],
      daysWindow: daysParam,
      configurations: {
        total: n(configStats, 'TOTAL'),
        active: n(configStats, 'ACTIVE'),
        inactive: n(configStats, 'INACTIVE'),
      },
      credentials: {
        total: n(credStats, 'TOTAL'),
        active: n(credStats, 'ACTIVE'),
      },
      today: {
        total: dayTotal,
        successes: daySuccesses,
        failures: dayFailures,
        pending: dayPending,
        avgResponseMs: n(selectedDaySummary, 'AVG_MS'),
        minResponseMs: n(selectedDaySummary, 'MIN_MS'),
        maxResponseMs: n(selectedDaySummary, 'MAX_MS'),
        uniqueServices: n(selectedDaySummary, 'UNIQUE_SERVICES'),
        successRate: dayTotal > 0 ? Math.round((daySuccesses / dayTotal) * 1000) / 10 : 0,
      },
      allTime: {
        total: n(allTimeSummary, 'TOTAL'),
        last15DaysTotal: n(allTimeSummary, 'LAST_15D_TOTAL'),
      },
      dailyVolume: dailyVolume.rows || [],
      dailyServiceReport: (dailyServiceReport.rows || []).map((r: any) => {
        const total = Number(r.TOTAL_CALLS || 0);
        const succ = Number(r.SUCCESS_COUNT || 0);
        const fail = Number(r.FAIL_COUNT || 0);
        const pend = Number(r.PENDING_COUNT || 0);
        return {
          SERVICE_NAME: r.SERVICE_NAME,
          ENDPOINT_URL: r.ENDPOINT_URL,
          HTTP_METHOD: r.HTTP_METHOD,
          TOTAL_CALLS: total,
          SUCCESS_COUNT: succ,
          FAIL_COUNT: fail,
          PENDING_COUNT: pend,
          SUCCESS_RATE: total > 0 ? Math.round((succ / total) * 1000) / 10 : 0,
          AVG_MS: Number(r.AVG_MS || 0),
          MIN_MS: Number(r.MIN_MS || 0),
          MAX_MS: Number(r.MAX_MS || 0),
          LAST_CALLED_AT: r.LAST_CALLED_AT,
        };
      }),
      statusBreakdown: statusBreakdown.rows || [],
      methodBreakdown: methodBreakdown.rows || [],
      slowestEndpoints: slowestEndpoints.rows || [],
      fastestEndpoints: fastestEndpoints.rows || [],
      mostFailedEndpoints: mostFailedEndpoints.rows || [],
      mostActiveEndpoints: mostActiveEndpoints.rows || [],
      hourlyVolume: hourlyVolume.rows || [],
      avgResponseByService: avgResponseByService.rows || [],
      recentErrors: recentErrors.rows || [],
    });
  } catch (error: any) {
    console.error('Failed to fetch WSO2 statistics:', error);
    return NextResponse.json(
      { message: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
