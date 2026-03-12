import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle-db";
import { decrypt } from "@/lib/crypto";

const connStr = process.env.TRANSACTION_LOG_MODULE_DB_CONNECTION_STRING;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const sourceModule = searchParams.get("sourceModule") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const offset = (page - 1) * pageSize;
    const binds: Record<string, any> = {};
    const conditions: string[] = [];

    if (search) {
      conditions.push(
        `(t."TransactionId" LIKE :search OR t."CIFNumber" LIKE :search OR t."CustomerName" LIKE :search OR t."FlexcubeReference" LIKE :search OR t."ExternalReference" LIKE :search OR t."CorrelationId" LIKE :search)`
      );
      binds.search = `%${search}%`;
    }

    if (status) {
      conditions.push(`t."TransactionStatus" = :status`);
      binds.status = status;
    }

    if (sourceModule) {
      conditions.push(`t."SourceModule" = :sourceModule`);
      binds.sourceModule = sourceModule;
    }

    if (dateFrom) {
      conditions.push(`t."TransactionDate" >= TO_DATE(:dateFrom, 'YYYY-MM-DD')`);
      binds.dateFrom = dateFrom;
    }

    if (dateTo) {
      conditions.push(`t."TransactionDate" <= TO_DATE(:dateTo, 'YYYY-MM-DD') + 1`);
      binds.dateTo = dateTo;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await executeQuery(
      connStr,
      `SELECT COUNT(*) AS "total" FROM "TransactionLogs" t ${whereClause}`,
      binds
    );
    const total = countResult.rows?.[0]?.total || 0;

    const query = `
      SELECT t."Id", t."TransactionId", t."CorrelationId", t."ParentTransactionId",
        t."CIFNumber", t."CustomerName", t."CustomerCategory",
        t."DebitAccountEncrypted", t."DebitAccountName", t."DebitBranchCode", t."DebitCurrency",
        t."CreditAccountEncrypted", t."CreditAccountName", t."CreditBranchCode", t."CreditCurrency",
        t."CreditBankCode", t."CreditBankName",
        t."TransactionType", t."ServiceName",
        t."Amount", t."Currency", t."ExchangeRate", t."CreditAmount", t."Narration",
        t."FeeAmount", t."VatAmount", t."TotalCharge",
        t."TransactionStatus", t."IsApproved",
        t."ErrorCode", t."ErrorMessage",
        t."FlexcubeReference", t."FlexcubeStatus",
        t."ExternalReference", t."ExternalStatus", t."ExternalResponseCode",
        t."RtgsReference", t."SwitchReference",
        t."Channel", t."DeviceId", t."IpAddress", t."SessionId", t."UserAgent",
        t."TransactionDate", t."CompletionDate",
        t."Comments", t."InitiatedBy", t."SourceModule",
        t."InsertDate", t."InsertUser"
      FROM "TransactionLogs" t
      ${whereClause}
      ORDER BY t."InsertDate" DESC
      OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY
    `;

    const dataResult = await executeQuery(connStr, query, {
      ...binds,
      offset,
      pageSize,
    });

    const rows = (dataResult.rows || []).map((row: any) => ({
      ...row,
      debitAccount: row.DebitAccountEncrypted ? decrypt(row.DebitAccountEncrypted) : null,
      creditAccount: row.CreditAccountEncrypted ? decrypt(row.CreditAccountEncrypted) : null,
      DebitAccountEncrypted: undefined,
      CreditAccountEncrypted: undefined,
    }));

    return NextResponse.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("TransactionLogs GET error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
