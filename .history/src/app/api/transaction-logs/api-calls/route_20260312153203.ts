import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle-db";

const connStr = process.env.TRANSACTION_LOG_MODULE_DB_CONNECTION_STRING;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const search = searchParams.get("search")?.trim() || "";
    const apiName = searchParams.get("apiName") || "";
    const isSuccess = searchParams.get("isSuccess") || "";
    const sourceModule = searchParams.get("sourceModule") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const offset = (page - 1) * pageSize;
    const binds: Record<string, any> = {};
    const conditions: string[] = [];

    if (search) {
      conditions.push(
        `(a."TransactionId" LIKE :search OR a."CorrelationId" LIKE :search OR a."EndpointUrl" LIKE :search OR a."ErrorMessage" LIKE :search)`
      );
      binds.search = `%${search}%`;
    }

    if (apiName) {
      conditions.push(`a."ApiName" = :apiName`);
      binds.apiName = apiName;
    }

    if (isSuccess === "true") {
      conditions.push(`a."IsSuccess" = 1`);
    } else if (isSuccess === "false") {
      conditions.push(`a."IsSuccess" = 0`);
    }

    if (sourceModule) {
      conditions.push(`a."SourceModule" = :sourceModule`);
      binds.sourceModule = sourceModule;
    }

    if (dateFrom) {
      conditions.push(`a."RequestTimestamp" >= TO_DATE(:dateFrom, 'YYYY-MM-DD')`);
      binds.dateFrom = dateFrom;
    }

    if (dateTo) {
      conditions.push(`a."RequestTimestamp" <= TO_DATE(:dateTo, 'YYYY-MM-DD') + 1`);
      binds.dateTo = dateTo;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await executeQuery(
      connStr,
      `SELECT COUNT(*) AS "total" FROM "ApiCallLogs" a ${whereClause}`,
      binds
    );
    const total = countResult.rows?.[0]?.total || 0;

    const query = `
      SELECT a."Id", a."TransactionId", a."CorrelationId",
        a."ApiName", a."ApiOperation", a."EndpointUrl", a."HttpMethod",
        a."RequestContentType", a."RequestHeaders", a."RequestBody", a."RequestTimestamp",
        a."ResponseStatusCode", a."ResponseContentType", a."ResponseHeaders", a."ResponseBody", a."ResponseTimestamp",
        a."DurationMs",
        a."IsSuccess", a."ErrorCode", a."ErrorMessage",
        a."AttemptNumber", a."MaxAttempts",
        a."SourceModule", a."InitiatedBy",
        a."InsertDate", a."InsertUser"
      FROM "ApiCallLogs" a
      ${whereClause}
      ORDER BY a."RequestTimestamp" DESC
      OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY
    `;

    const dataResult = await executeQuery(connStr, query, {
      ...binds,
      offset,
      pageSize,
    });

    return NextResponse.json({
      data: dataResult.rows || [],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("ApiCallLogs GET error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
