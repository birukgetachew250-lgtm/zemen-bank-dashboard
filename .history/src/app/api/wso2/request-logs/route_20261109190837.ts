import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';

const CS = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
const TABLE = '"WSO2_MODULE"."WSO2_REQUEST_LOGS"';
const CFG_TABLE = '"WSO2_MODULE"."WSO2_CONFIGURATIONS"';

/** Maximum retention window shown on the Request Logs page (15 days) */
const MAX_DAYS_WINDOW = 15;

export async function GET(req: Request) {
  const session = await requirePermission(PERMISSIONS.SECURITY_MANAGE);
  if (session instanceof NextResponse) return session;

  try {
    const { searchParams } = new URL(req.url);
    const includeMeta = searchParams.get('meta') === '1';

    // If caller only requests metadata (distinct services & statuses for last 15 days)
    if (searchParams.get('metaOnly') === '1') {
      const [logSvcRes, cfgSvcRes, statusRes]: any[] = await Promise.all([
        executeQuery(
          CS,
          `SELECT DISTINCT TRIM(SERVICE_NAME) AS SERVICE_NAME
           FROM ${TABLE}
           WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${MAX_DAYS_WINDOW}' DAY
             AND SERVICE_NAME IS NOT NULL
           ORDER BY TRIM(SERVICE_NAME) ASC`
        ).catch(() => ({ rows: [] })),
        executeQuery(
          CS,
          `SELECT DISTINCT TRIM(SERVICE_NAME) AS SERVICE_NAME
           FROM ${CFG_TABLE}
           WHERE SERVICE_NAME IS NOT NULL
           ORDER BY TRIM(SERVICE_NAME) ASC`
        ).catch(() => ({ rows: [] })),
        executeQuery(
          CS,
          `SELECT UPPER(TRIM(STATUS)) AS STATUS, COUNT(*) AS CNT
           FROM ${TABLE}
           WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${MAX_DAYS_WINDOW}' DAY
             AND STATUS IS NOT NULL
           GROUP BY UPPER(TRIM(STATUS))
           ORDER BY CNT DESC`
        ).catch(() => ({ rows: [] })),
      ]);

      const serviceSet = new Set<string>();
      for (const r of logSvcRes?.rows || []) {
        if (r.SERVICE_NAME) serviceSet.add(String(r.SERVICE_NAME).trim());
      }
      for (const r of cfgSvcRes?.rows || []) {
        if (r.SERVICE_NAME) serviceSet.add(String(r.SERVICE_NAME).trim());
      }

      return NextResponse.json({
        services: Array.from(serviceSet).sort((a, b) => a.localeCompare(b)),
        statuses: (statusRes?.rows || []).map((r: any) => ({
          status: r.STATUS,
          count: Number(r.CNT || 0),
        })),
        windowDays: MAX_DAYS_WINDOW,
      });
    }

    const status = (searchParams.get('status') || '').trim();
    const serviceName = (searchParams.get('service') || '').trim();
    const httpMethod = (searchParams.get('method') || '').trim();
    const from = (searchParams.get('from') || '').trim();
    const to = (searchParams.get('to') || '').trim();
    const q = (searchParams.get('q') || '').trim();
    const scope = (searchParams.get('scope') || 'all').trim(); // 'all' | 'payloads' | 'request' | 'response' | 'metadata'
    const reqBodyFilter = (searchParams.get('requestBody') || '').trim();
    const resBodyFilter = (searchParams.get('responseBody') || '').trim();
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '200', 10), 1), 1000);

    const conditions: string[] = [];
    const binds: Record<string, any> = {};

    // 1. Always enforce the last 15 days rolling window to prevent heavy table scans
    conditions.push(`CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${MAX_DAYS_WINDOW}' DAY`);

    // Optional further narrowing within the 15-day window
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      conditions.push(`CREATED_DATE >= TO_TIMESTAMP(:fromDate, 'YYYY-MM-DD')`);
      binds.fromDate = from;
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      conditions.push(`CREATED_DATE < TO_TIMESTAMP(:toDate, 'YYYY-MM-DD') + INTERVAL '1' DAY`);
      binds.toDate = to;
    }

    // 2. Case-insensitive & grouped Status filter
    if (status && status.toUpperCase() !== 'ALL') {
      const upperStatus = status.toUpperCase();
      if (upperStatus === 'SUCCESS') {
        conditions.push(`UPPER(TRIM(STATUS)) IN ('SUCCESS', 'COMPLETED', 'OK', '200')`);
      } else if (upperStatus === 'FAILED') {
        conditions.push(
          `(UPPER(TRIM(STATUS)) IN ('FAILED', 'ERROR', 'FAILURE', 'TIMEOUT', 'REJECTED') OR HTTP_STATUS_CODE >= 400)`
        );
      } else if (upperStatus === 'PENDING') {
        conditions.push(`UPPER(TRIM(STATUS)) IN ('PENDING', 'IN_PROGRESS', 'PROCESSING', 'INITIATED')`);
      } else {
        conditions.push(`UPPER(TRIM(STATUS)) = :status`);
        binds.status = upperStatus;
      }
    }

    // 3. Case-insensitive & trimmed Service filter
    if (serviceName && serviceName.toUpperCase() !== 'ALL') {
      conditions.push(`UPPER(TRIM(SERVICE_NAME)) = UPPER(TRIM(:svcName))`);
      binds.svcName = serviceName;
    }

    // 4. Optional HTTP Method filter
    if (httpMethod && httpMethod.toUpperCase() !== 'ALL') {
      conditions.push(`UPPER(TRIM(HTTP_METHOD)) = :httpMethod`);
      binds.httpMethod = httpMethod.toUpperCase();
    }

    // 5. Dedicated Request Body filter (CLOB/VARCHAR2 safe via DBMS_LOB.INSTR)
    if (reqBodyFilter) {
      conditions.push(
        `(REQUEST_PAYLOAD IS NOT NULL AND DBMS_LOB.INSTR(UPPER(REQUEST_PAYLOAD), UPPER(:reqBodyFilter)) > 0)`
      );
      binds.reqBodyFilter = reqBodyFilter;
    }

    // 6. Dedicated Response Body filter (CLOB/VARCHAR2 safe via DBMS_LOB.INSTR)
    if (resBodyFilter) {
      conditions.push(
        `(RESPONSE_PAYLOAD IS NOT NULL AND DBMS_LOB.INSTR(UPPER(RESPONSE_PAYLOAD), UPPER(:resBodyFilter)) > 0)`
      );
      binds.resBodyFilter = resBodyFilter;
    }

    // 7. Deep Search query `q` across selected scope (supports multi-token or phrase matching)
    if (q) {
      const buildTokenClause = (bindKey: string): string => {
        const metaClause = `(
          UPPER(NVL(REQUEST_ID, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR UPPER(NVL(PARENT_REQUEST_ID, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR UPPER(NVL(SERVICE_NAME, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR UPPER(NVL(ENDPOINT_URL, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR UPPER(NVL(ERROR_CODE, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR UPPER(NVL(WSO2_STATUS, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR UPPER(NVL(INITIATED_BY, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR UPPER(NVL(REMARKS, '')) LIKE '%' || UPPER(:${bindKey}) || '%'
          OR TO_CHAR(HTTP_STATUS_CODE) = :${bindKey}
        )`;
        const reqClause = `(REQUEST_PAYLOAD IS NOT NULL AND DBMS_LOB.INSTR(UPPER(REQUEST_PAYLOAD), UPPER(:${bindKey})) > 0)`;
        const resClause = `(RESPONSE_PAYLOAD IS NOT NULL AND DBMS_LOB.INSTR(UPPER(RESPONSE_PAYLOAD), UPPER(:${bindKey})) > 0)`;

        if (scope === 'request') return reqClause;
        if (scope === 'response') return resClause;
        if (scope === 'payloads') return `(${reqClause} OR ${resClause})`;
        if (scope === 'metadata') return metaClause;
        return `(${metaClause} OR ${reqClause} OR ${resClause})`;
      };

      binds.searchQuery = q;
      conditions.push(buildTokenClause('searchQuery'));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `SELECT * FROM (SELECT * FROM ${TABLE} ${where} ORDER BY CREATED_DATE DESC) WHERE ROWNUM <= :lim`;
    const result: any = await executeQuery(CS, sql, { ...binds, lim: limit });
    const rows = result.rows || [];

    if (includeMeta) {
      const [logSvcRes, cfgSvcRes]: any[] = await Promise.all([
        executeQuery(
          CS,
          `SELECT DISTINCT TRIM(SERVICE_NAME) AS SERVICE_NAME
           FROM ${TABLE}
           WHERE CREATED_DATE >= SYSTIMESTAMP - INTERVAL '${MAX_DAYS_WINDOW}' DAY
             AND SERVICE_NAME IS NOT NULL
           ORDER BY TRIM(SERVICE_NAME) ASC`
        ).catch(() => ({ rows: [] })),
        executeQuery(
          CS,
          `SELECT DISTINCT TRIM(SERVICE_NAME) AS SERVICE_NAME
           FROM ${CFG_TABLE}
           WHERE SERVICE_NAME IS NOT NULL
           ORDER BY TRIM(SERVICE_NAME) ASC`
        ).catch(() => ({ rows: [] })),
      ]);

      const serviceSet = new Set<string>();
      for (const r of logSvcRes?.rows || []) {
        if (r.SERVICE_NAME) serviceSet.add(String(r.SERVICE_NAME).trim());
      }
      for (const r of cfgSvcRes?.rows || []) {
        if (r.SERVICE_NAME) serviceSet.add(String(r.SERVICE_NAME).trim());
      }

      return NextResponse.json({
        logs: rows,
        services: Array.from(serviceSet).sort((a, b) => a.localeCompare(b)),
        windowDays: MAX_DAYS_WINDOW,
      });
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch WSO2 request logs:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
