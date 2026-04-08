import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
const CFG = '"WSO2_MODULE"."WSO2_CONFIGURATIONS"';
const CRED = '"WSO2_MODULE"."WSO2_OAUTH_CREDENTIALS"';
const LOGS = '"WSO2_MODULE"."WSO2_REQUEST_LOGS"';

export async function GET() {
  try {
    const [
      configStats,
      credStats,
      dailyVolume,
      statusBreakdown,
      methodBreakdown,
      slowestEndpoints,
      fastestEndpoints,
      mostFailedEndpoints,
      mostActiveEndpoints,
      hourlyVolume,
      avgResponseByService,
      recentErrors,
    ] = await Promise.all([
      // ── Configurations summary ──────────────────────────────────────────
      executeQuery(CS, `
        SELECT
          COUNT(*) AS TOTAL,
          SUM(CASE WHEN IS_ACTIVE=1 THEN 1 ELSE 0 END) AS ACTIVE,
          SUM(CASE WHEN IS_ACTIVE=0 THEN 1 ELSE 0 END) AS INACTIVE
        FROM ${CFG}
      `),

      // ── OAuth Credentials summary ────────────────────────────────────────
      executeQuery(CS, `
        SELECT
          COUNT(*) AS TOTAL,
          SUM(CASE WHEN IS_ACTIVE=1 THEN 1 ELSE 0 END) AS ACTIVE
        FROM ${CRED}
      `),

      // ── Daily request volumes (last 30 days) ─────────────────────────────
      executeQuery(CS, `
        SELECT
          TRUNC(CREATED_DATE) AS LOG_DATE,
          COUNT(*) AS TOTAL,
          SUM(CASE WHEN STATUS='SUCCESS' THEN 1 ELSE 0 END) AS SUCCESSES,
          SUM(CASE WHEN STATUS IN ('FAILED','ERROR') THEN 1 ELSE 0 END) AS FAILURES
        FROM ${LOGS}
        WHERE CREATED_DATE >= SYSDATE - 30
        GROUP BY TRUNC(CREATED_DATE)
        ORDER BY TRUNC(CREATED_DATE)
      `),

      // ── Status breakdown (all time) ──────────────────────────────────────
      executeQuery(CS, `
        SELECT STATUS, COUNT(*) AS CNT
        FROM ${LOGS}
        GROUP BY STATUS
        ORDER BY CNT DESC
      `),

      // ── HTTP method breakdown from configurations ──────────────────────
      executeQuery(CS, `
        SELECT HTTP_METHOD, COUNT(*) AS CNT
        FROM ${CFG}
        GROUP BY HTTP_METHOD
        ORDER BY CNT DESC
      `),

      // ── Slowest endpoints (avg execution time, min 5 calls) ─────────────
      executeQuery(CS, `
        SELECT SERVICE_NAME, ENDPOINT_URL,
          ROUND(AVG(EXECUTION_TIME_MS)) AS AVG_MS,
          MAX(EXECUTION_TIME_MS) AS MAX_MS,
          COUNT(*) AS CALL_COUNT
        FROM ${LOGS}
        WHERE EXECUTION_TIME_MS IS NOT NULL
        GROUP BY SERVICE_NAME, ENDPOINT_URL
        HAVING COUNT(*) >= 5
        ORDER BY AVG_MS DESC
        FETCH FIRST 5 ROWS ONLY
      `),

      // ── Fastest endpoints ───────────────────────────────────────────────
      executeQuery(CS, `
        SELECT SERVICE_NAME, ENDPOINT_URL,
          ROUND(AVG(EXECUTION_TIME_MS)) AS AVG_MS,
          MIN(EXECUTION_TIME_MS) AS MIN_MS,
          COUNT(*) AS CALL_COUNT
        FROM ${LOGS}
        WHERE EXECUTION_TIME_MS IS NOT NULL
        GROUP BY SERVICE_NAME, ENDPOINT_URL
        HAVING COUNT(*) >= 5
        ORDER BY AVG_MS ASC
        FETCH FIRST 5 ROWS ONLY
      `),

      // ── Most failed endpoints ───────────────────────────────────────────
      executeQuery(CS, `
        SELECT SERVICE_NAME, ENDPOINT_URL,
          COUNT(*) AS FAIL_COUNT,
          ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY SERVICE_NAME), 0), 1) AS FAIL_RATE_PCT
        FROM ${LOGS}
        WHERE STATUS IN ('FAILED','ERROR')
        GROUP BY SERVICE_NAME, ENDPOINT_URL
        ORDER BY FAIL_COUNT DESC
        FETCH FIRST 5 ROWS ONLY
      `),

      // ── Most active endpoints (total calls last 7 days) ─────────────────
      executeQuery(CS, `
        SELECT SERVICE_NAME, ENDPOINT_URL, COUNT(*) AS CALL_COUNT
        FROM ${LOGS}
        WHERE CREATED_DATE >= SYSDATE - 7
        GROUP BY SERVICE_NAME, ENDPOINT_URL
        ORDER BY CALL_COUNT DESC
        FETCH FIRST 5 ROWS ONLY
      `),

      // ── Hourly request distribution today ───────────────────────────────
      executeQuery(CS, `
        SELECT TO_CHAR(CREATED_DATE,'HH24') AS HOUR_OF_DAY, COUNT(*) AS CNT
        FROM ${LOGS}
        WHERE TRUNC(CREATED_DATE) = TRUNC(SYSDATE)
        GROUP BY TO_CHAR(CREATED_DATE,'HH24')
        ORDER BY HOUR_OF_DAY
      `),

      // ── Avg execution time per service (last 7 days) ──────────────────────
      executeQuery(CS, `
        SELECT SERVICE_NAME,
          ROUND(AVG(EXECUTION_TIME_MS)) AS AVG_MS,
          COUNT(*) AS CALL_COUNT,
          SUM(CASE WHEN STATUS IN ('FAILED','ERROR') THEN 1 ELSE 0 END) AS FAIL_COUNT
        FROM ${LOGS}
        WHERE CREATED_DATE >= SYSDATE - 7
          AND EXECUTION_TIME_MS IS NOT NULL
        GROUP BY SERVICE_NAME
        ORDER BY AVG_MS DESC
      `),

      // ── Recent errors (last 24 hours) ───────────────────────────────────
      executeQuery(CS, `
        SELECT * FROM (
          SELECT SERVICE_NAME, ENDPOINT_URL, STATUS, ERROR_CODE, REMARKS, CREATED_DATE
          FROM ${LOGS}
          WHERE STATUS IN ('FAILED','ERROR')
            AND CREATED_DATE >= SYSDATE - 1
          ORDER BY CREATED_DATE DESC
        ) WHERE ROWNUM <= 10
      `),
    ]);

    // ── Aggregate totals from logs ────────────────────────────────────────
    const totalToday: any = await executeQuery(CS, `
      SELECT
        COUNT(*) AS TOTAL,
        SUM(CASE WHEN STATUS='SUCCESS' THEN 1 ELSE 0 END) AS SUCCESSES,
        SUM(CASE WHEN STATUS IN ('FAILED','ERROR') THEN 1 ELSE 0 END) AS FAILURES,
        ROUND(AVG(EXECUTION_TIME_MS)) AS AVG_MS
    `);

    const n = (r: any, key: string) => Number(r?.rows?.[0]?.[key] ?? 0);

    return NextResponse.json({
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
        total: n(totalToday, 'TOTAL'),
        successes: n(totalToday, 'SUCCESSES'),
        failures: n(totalToday, 'FAILURES'),
        avgResponseMs: n(totalToday, 'AVG_MS'),
        successRate:
          n(totalToday, 'TOTAL') > 0
            ? Math.round((n(totalToday, 'SUCCESSES') / n(totalToday, 'TOTAL')) * 100)
            : 0,
      },
      allTime: {
        total: n(totalAll, 'TOTAL'),
      },
      dailyVolume: (dailyVolume as any).rows || [],
      statusBreakdown: (statusBreakdown as any).rows || [],
      methodBreakdown: (methodBreakdown as any).rows || [],
      slowestEndpoints: (slowestEndpoints as any).rows || [],
      fastestEndpoints: (fastestEndpoints as any).rows || [],
      mostFailedEndpoints: (mostFailedEndpoints as any).rows || [],
      mostActiveEndpoints: (mostActiveEndpoints as any).rows || [],
      hourlyVolume: (hourlyVolume as any).rows || [],
      avgResponseByService: (avgResponseByService as any).rows || [],
      recentErrors: (recentErrors as any).rows || [],
    });
  } catch (error: any) {
    console.error('Failed to fetch WSO2 statistics:', error);
    return NextResponse.json({ message: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
